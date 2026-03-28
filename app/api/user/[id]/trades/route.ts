import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(req.url);
        const chain = url.searchParams.get('chain') || undefined;
        const status = url.searchParams.get('status') || undefined;
        const { id: targetUserId } = await params;

        // Verify the user is requesting their own trades
        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user || user.id !== targetUserId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const trades = await prisma.transaction.findMany({
            where: {
                userId: targetUserId,
                ...(chain && chain !== 'all' ? { chain } : {}),
                ...(status && status !== 'all' ? { status } : {})
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ trades });
    } catch (error) {
        console.error('Failed to fetch trades', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
