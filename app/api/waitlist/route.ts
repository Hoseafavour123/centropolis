import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const waitlistSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().optional(),
    source: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = waitlistSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({
                error: result.error.errors[0].message
            }, { status: 400 });
        }

        const { email, name, source } = result.data;

        // Check if duplicate
        const existing = await prisma.waitlistEntry.findUnique({
            where: { email }
        });

        if (existing) {
            return NextResponse.json({
                message: "You're already on the list! We'll be in touch soon.",
                status: 'duplicate'
            }, { status: 200 });
        }

        // Create entry
        await prisma.waitlistEntry.create({
            data: {
                email,
                name,
                source: source || 'landing_page'
            }
        });

        return NextResponse.json({
            message: "Welcome to the Binocs family! You've been added to the waitlist.",
            status: 'success'
        }, { status: 201 });

    } catch (error) {
        console.error('[WaitlistAPI] Error:', error);
        return NextResponse.json({
            error: 'Something went wrong. Please try again later.'
        }, { status: 500 });
    }
}
