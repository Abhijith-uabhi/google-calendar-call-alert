// lib/twilio.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function makeCall(to: string, eventDetails: string) {
  return await client.calls.create({
    to,
    from: "+16505478518" ,
    twiml: `<Response><Say>You have an upcoming event: ${eventDetails}</Say></Response>`
  });
}

export async function makeEventReminderCall(to: string, eventName: string, startTime: string) {
  try {
    // Example: create a call and return a small result object; adapt TwiML / voice message as needed.
    const call = await client.calls.create({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/twilio/voice?event=${encodeURIComponent(eventName)}&time=${encodeURIComponent(startTime)}`,
      to,
      from: process.env.TWILIO_PHONE_NUMBER!,
    });

    return { success: true, callSid: call.sid };
  } catch (error: any) {
    console.error("Twilio call error:", error);
    return { success: false, error: (error.message || String(error)) };
  }
}