import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request, { params }: { params: Promise<{ txId: string }> }) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { txId } = await params;

        const trade = await prisma.transaction.findFirst({
            where: { txHash: txId } // the actual signature or id 
        });

        if (!trade) return NextResponse.json({ error: 'Trade not found' }, { status: 404 });

        return NextResponse.json({ trade, onChainStatus: trade.status });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
