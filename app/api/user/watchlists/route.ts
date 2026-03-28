import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
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

        // Fetch watchlists with nested alerts
        const watchlists = await prisma.watchlist.findMany({
            where: { userId: user.id },
            include: {
                alerts: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ watchlists });
    } catch (error) {
        console.error('Watchlists fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch watchlists' }, { status: 500 });
    }
}

export async function POST(req: Request) {
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

        const body = await req.json();
        const { chain = 'solana', address } = body;

        if (!address) {
            return NextResponse.json({ error: 'Token address required' }, { status: 400 });
        }

        const watchlist = await prisma.watchlist.create({
            data: {
                userId: user.id,
                chain,
                address,
            }
        });

        return NextResponse.json({ watchlist }, { status: 201 });
    } catch (error: any) {
        console.error('Watchlist create error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Token already in watchlist' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
    }
}
