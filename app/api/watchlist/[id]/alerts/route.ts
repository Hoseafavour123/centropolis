import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scheduleAlertEvaluation } from '@/services/alertQueue';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { id: watchlistId } = await params;
        const body = await req.json();
        const { type, thresholdValue } = body;

        if (!type || typeof thresholdValue !== 'number') {
            return NextResponse.json({ error: 'Invalid alert configuration' }, { status: 400 });
        }

        // Verify ownership
        const watchlistItem = await prisma.watchlist.findUnique({
            where: { id: watchlistId }
        });

        if (!watchlistItem || watchlistItem.userId !== user.id) {
            return NextResponse.json({ error: 'Watchlist item not found' }, { status: 404 });
        }

        // Create the alert in DB
        const alert = await prisma.alert.create({
            data: {
                watchlistId,
                userId: user.id,
                type,
                thresholdValue,
                status: 'ACTIVE'
            }
        });

        // Enqueue the job for evaluation
        await scheduleAlertEvaluation(alert.id);

        return NextResponse.json({ alert }, { status: 201 });
    } catch (error) {
        console.error('Create alert error:', error);
        return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
    }
}
