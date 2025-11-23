// app/api/user/phone/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { phoneNumber } = await request.json();

        // Validate phone number format (E.164)
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return NextResponse.json(
                { error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)' },
                { status: 400 }
            );
        }

        // Update user phone number
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { phoneNumber },
            select: {
                id: true,
                email: true,
                phoneNumber: true,
            },
        });

        return NextResponse.json({
            message: 'Phone number updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error updating phone number:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}