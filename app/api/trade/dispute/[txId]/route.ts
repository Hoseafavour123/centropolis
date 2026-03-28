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

        const trade = await prisma.transaction.findFirst({
            where: { txHash: txId }
        });

        if (!trade) return NextResponse.json({ error: 'Trade not found' }, { status: 404 });

        // Trigger telemetry / dispatch dispute logic
        await fetch(`${new URL(req.url).origin}/api/telemetry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'order_disputed', payload: { txId, reason } })
        }).catch(() => { });

        return NextResponse.json({ success: true, message: 'Dispute submitted successfully.' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
