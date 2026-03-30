import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request, { params }: { params: Promise<{ txId: string }> }) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { txId } = await params;
        const body = await req.json();
        const { reason } = body;

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(txId);

        const trade = await prisma.transaction.findFirst({
            where: isUuid
                ? { OR: [{ id: txId }, { txHash: txId }] }
                : { txHash: txId }
        });

        if (!trade) return NextResponse.json({ error: 'Trade not found' }, { status: 404 });

        // Check if a dispute already exists
        const existingDispute = await prisma.dispute.findUnique({
            where: { transactionId: trade.id }
        });

        if (existingDispute) {
            return NextResponse.json({ error: 'Dispute already submitted for this transaction.' }, { status: 400 });
        }

        // Create the dispute record
        const dispute = await prisma.dispute.create({
            data: {
                transactionId: trade.id,
                userId: trade.userId,
                reason,
                status: 'OPEN'
            }
        });

        // Trigger telemetry / dispatch dispute logic
        await fetch(`${new URL(req.url).origin}/api/telemetry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'order_disputed', payload: { txId: trade.txHash, disputeId: dispute.id, reason } })
        }).catch(() => { });

        return NextResponse.json({ success: true, message: 'Dispute submitted successfully.', dispute });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
