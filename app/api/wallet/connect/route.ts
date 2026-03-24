import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * ============================================================================
 * WALLET CONNECT API
 * ============================================================================
 * Description: Links a Solana wallet to the authenticated Clerk user.
 * ============================================================================
 */

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { address, chain = 'solana' } = await req.json();

        if (!address) {
            return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
        }

        // Find the user in our database
        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
        }

        // Upsert the wallet (create or link to user)
        const wallet = await prisma.wallet.upsert({
            where: {
                userId_chain_address: {
                    userId: user.id,
                    chain,
                    address,
                },
            },
            update: {}, // No updates needed if it already exists
            create: {
                userId: user.id,
                chain,
                address,
            },
        });

        return NextResponse.json({ success: true, wallet });
    } catch (error) {
        console.error('Wallet link error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
