import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request, { params }: { params: Promise<{ txId: string }> }) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { txId } = await params;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(txId);

        // Try finding by internal ID if it's a UUID, otherwise by txHash
        const trade = await prisma.transaction.findFirst({
            where: isUuid
                ? { OR: [{ id: txId }, { txHash: txId }] }
                : { txHash: txId },
            include: {
                dispute: true
            }
        });

        if (!trade) return NextResponse.json({ error: 'Trade not found' }, { status: 404 });

        return NextResponse.json({ trade, onChainStatus: trade.status, dispute: trade.dispute });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ txId: string }> }) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { txId } = await params;
        const body = await req.json();
        const { status, txHash, fromAmount, toAmount, errorLogs } = body;

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(txId);

        // Identify transaction by internal ID or existing txHash
        const existing = await prisma.transaction.findFirst({
            where: isUuid
                ? { OR: [{ id: txId }, { txHash: txId }] }
                : { txHash: txId }
        });

        if (!existing) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

        const updated = await prisma.transaction.update({
            where: { id: existing.id },
            data: {
                status: status || existing.status,
                txHash: txHash || existing.txHash,
                fromAmount: fromAmount !== undefined ? fromAmount : existing.fromAmount,
                toAmount: toAmount !== undefined ? toAmount : existing.toAmount,
                errorLogs: errorLogs || existing.errorLogs,
            }
        });

        return NextResponse.json({ success: true, trade: updated });
    } catch (error: any) {
        console.error('[TradeStatusPATCH] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
