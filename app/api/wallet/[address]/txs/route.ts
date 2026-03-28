import { NextResponse } from 'next/server';
import { heliusService } from '@/services/heliusService';

export const revalidate = 0; // Disable default static caching to allow dynamic search params but we might use headers for Vercel edge caching

export async function GET(req: Request, { params }: { params: Promise<{ address: string }> }) {
    try {
        const { address } = await params;
        if (!address) {
            return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const before = searchParams.get('before') || undefined;

        // Fetch paginated transactions
        const transactions = await heliusService.getTransactionHistory(address, limit, before);

        return NextResponse.json({ transactions });
    } catch (error) {
        console.error('Transactions fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
