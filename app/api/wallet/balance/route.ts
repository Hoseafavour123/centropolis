import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { heliusService } from '@/services/heliusService';

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const address = searchParams.get('address');

        if (!address) {
            return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
        }

        const balance = await heliusService.getWalletBalance(address);
        return NextResponse.json({ balance });
    } catch (error) {
        console.error('Balance fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
    }
}
