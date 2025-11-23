// app/api/cron/check-events/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";
import { makeEventReminderCall } from "@/lib/twilio";

export async function GET(request: Request) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get("authorization");
        console.log(authHeader);
        
        if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("🔄 Cron job started:", new Date().toISOString());

        // Find users that have phoneNumber AND at least one google account with tokens
        const users = await prisma.user.findMany({
            where: {
                phoneNumber: { not: null },
                accounts: {
                    some: {
                        provider: "google",
                        // require at least a refresh or access token
                        OR: [{ refresh_token: { not: null } }, { access_token: { not: null } }],
                    },
                },
            },
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                // include the google account (filtered)
                accounts: {
                    where: { provider: "google" },
                    select: {
                        provider: true,
                        access_token: true,
                        refresh_token: true,
                        expires_at: true,
                        scope: true,
                        providerAccountId: true,
                    },
                    take: 1,
                },
            },
        });

        console.log(`📊 Found ${users.length} users to check`);

        const results = {
            totalUsers: users.length,
            eventsFound: 0,
            callsInitiated: 0,
            errors: 0,
            details: [] as any[],
        };

        for (const user of users) {
            try {
                const account = user.accounts?.[0];
                if (!account) {
                    console.warn(`⚠️ No google account found for user ${user.email}`);
                    continue;
                }

                const accessToken = account.access_token ?? undefined;
                const refreshToken = account.refresh_token ?? undefined;

                if (!accessToken && !refreshToken) {
                    console.warn(`⚠️ No usable tokens for user ${user.email}`);
                    results.details.push({ user: user.email, error: "No tokens" });
                    continue;
                }

                // If you depend on Calendar scope, confirm it exists
                const scope = account.scope ?? "";
                if (!scope.includes("https://www.googleapis.com/auth/calendar")) {
                    console.warn(`⚠️ Insufficient calendar scopes for ${user.email}: ${scope}`);
                    results.details.push({ user: user.email, error: "Insufficient scopes" });
                    continue;
                }

                // Initialize OAuth2 client and set credentials
                const oauth2Client = new google.auth.OAuth2(
                    process.env.GOOGLE_CLIENT_ID,
                    process.env.GOOGLE_CLIENT_SECRET
                );

                oauth2Client.setCredentials({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    // expires_at stored as seconds in many setups, convert if present
                    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
                });

                const calendar = google.calendar({ version: "v3", auth: oauth2Client });

                // Check events in next 5 minutes
                const now = new Date();
                const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

                const response = await calendar.events.list({
                    calendarId: "primary",
                    timeMin: now.toISOString(),
                    timeMax: fiveMinutesLater.toISOString(),
                    singleEvents: true,
                    orderBy: "startTime",
                    maxResults: 50,
                });

                const events = response.data.items ?? [];

                if (events.length > 0) {
                    console.log(`📅 Found ${events.length} upcoming event(s) for ${user.email}`);
                    results.eventsFound += events.length;

                    for (const event of events) {
                        const eventName = event.summary ?? "Untitled Event";
                        const eventTime = event.start?.dateTime ?? event.start?.date ?? "";

                        const startTime = new Date(eventTime).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                        });

                        console.log(`📞 Calling ${user.phoneNumber} for event: ${eventName}`);

                        const callResult = await makeEventReminderCall(
                            user.phoneNumber!,
                            eventName,
                            startTime
                        );

                        if (callResult.success) {
                            results.callsInitiated++;
                            console.log(`✅ Call initiated successfully: ${callResult.callSid}`);

                            //   await prisma.callLog.create({
                            //     data: {
                            //       userId: user.id,
                            //       eventName,
                            //       eventTime,
                            //       phoneNumber: user.phoneNumber!,
                            //       callSid: callResult.callSid ?? null,
                            //       status: "initiated",
                            //     },
                            //   });
                        } else {
                            results.errors++;
                            console.error(`❌ Call failed: ${callResult.error}`);

                            //   await prisma.callLog.create({
                            //     data: {
                            //       userId: user.id,
                            //       eventName,
                            //       eventTime,
                            //       phoneNumber: user.phoneNumber!,
                            //       status: "failed",
                            //       errorMessage: callResult.error ?? String(callResult),
                            //     },
                            //   });
                        }

                        results.details.push({
                            user: user.email,
                            event: eventName,
                            time: startTime,
                            callSuccess: callResult.success,
                            callSid: callResult.callSid,
                            error: callResult.error,
                        });
                    }
                } else {
                    console.log(`✅ No upcoming events for ${user.email}`);
                }
            } catch (error: any) {
                console.error(`❌ Error processing user ${user.email}:`, error);
                results.errors++;
                results.details.push({
                    user: user.email,
                    error: error?.message ?? String(error),
                });
            }
        }

        console.log("✅ Cron job completed:", results);

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            results,
        });
    } catch (error: any) {
        console.error("❌ Cron job error:", error);
        return NextResponse.json({ error: "Cron job failed", message: error.message }, { status: 500 });
    }
}

// For local testing without cron
export async function POST(request: Request) {
    return GET(request);
}
