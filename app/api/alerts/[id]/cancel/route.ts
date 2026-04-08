import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cancelAlertEvaluation } from '@/services/alertQueue';

/**
 * DELETE /api/alerts/[id]/cancel
 * Pauses an active alert and removes its repeatable BullMQ job.
 */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { id: alertId } = await params;

        // Verify ownership
        const alert = await prisma.alert.findUnique({ where: { id: alertId } });
        if (!alert || alert.userId !== user.id) {
            return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
        }

        // Cancel the BullMQ repeatable job
        await cancelAlertEvaluation(alertId);

        // Mark as paused in DB
        const updated = await prisma.alert.update({
            where: { id: alertId },
            data: { status: 'PAUSED' }
        });

        console.log(`[AlertCancelAPI] Alert ${alertId} paused by user ${user.id}`);
        return NextResponse.json({ success: true, alert: updated });

    } catch (error: any) {
        console.error('[AlertCancelAPI] Error:', error.message);
        return NextResponse.json({ error: 'Failed to cancel alert' }, { status: 500 });
    }
}
