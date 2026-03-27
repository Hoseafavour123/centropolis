import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// GET: Check if a token is watchlisted
export async function GET(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ isWatchlisted: false });
        }

        const { searchParams } = new URL(request.url);
        const chain = searchParams.get('chain');
        const address = searchParams.get('address');

        if (!chain || !address) {
            return NextResponse.json({ error: "Missing chain or address" }, { status: 400 });
        }

        const dbUser = await prisma.user.findUnique({ where: { clerkId } });
        if (!dbUser) {
            return NextResponse.json({ isWatchlisted: false });
        }

        const watchlistItem = await prisma.watchlist.findUnique({
            where: {
                userId_chain_address: {
                    userId: dbUser.id,
                    chain,
                    address,
                }
            }
        });

        return NextResponse.json({ isWatchlisted: !!watchlistItem });
    } catch (error) {
        console.error("[Watchlist GET Error]", error);
        return NextResponse.json({ error: "Failed to fetch watchlist status" }, { status: 500 });
    }
}

// POST: Toggle watchlist status
export async function POST(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { chain, address } = body;

        if (!chain || !address) {
            return NextResponse.json({ error: "Missing chain or address" }, { status: 400 });
        }

        const dbUser = await prisma.user.findUnique({ where: { clerkId } });
        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const uniqueWhere = {
            userId_chain_address: {
                userId: dbUser.id,
                chain,
                address,
            }
        };

        const existing = await prisma.watchlist.findUnique({
            where: uniqueWhere
        });

        if (existing) {
            await prisma.watchlist.delete({ where: uniqueWhere });
            return NextResponse.json({ isWatchlisted: false });
        } else {
            await prisma.watchlist.create({
                data: {
                    userId: dbUser.id,
                    chain,
                    address,
                }
            });
            return NextResponse.json({ isWatchlisted: true });
        }
    } catch (error) {
        console.error("[Watchlist POST Error]", error);
        return NextResponse.json({ error: "Failed to toggle watchlist" }, { status: 500 });
    }
}
