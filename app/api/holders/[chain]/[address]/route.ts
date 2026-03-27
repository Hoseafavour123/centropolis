import { NextRequest, NextResponse } from 'next/server';
import { heliusService } from '@/lib/services/helius';
import { holderAdapter } from '@/lib/adapters/holderAdapter';

/**
 * ============================================================================
 * HOLDERS API (HELIUS)
 * ============================================================================
 * Description: Fetches real-time on-chain holder data for Solana tokens.
 * ============================================================================
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  try {
    const { address, chain } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    if (!address) {
      return NextResponse.json({ error: 'Token address required' }, { status: 400 });
    }

    // Only support Solana for now
    if (chain.toLowerCase() !== 'solana') {
      return NextResponse.json({ error: 'Only Solana is supported for holder intelligence' }, { status: 400 });
    }

    // Fetch largest accounts and total supply concurrently
    const [accounts, supply] = await Promise.all([
      heliusService.getTokenLargestAccounts(address),
      heliusService.getTokenSupply(address)
    ]);

    if (!accounts || accounts.length === 0 || !supply) {
      return NextResponse.json([], {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
      });
    }

    // Normalize and transform into Holder[]
    const holders = holderAdapter.mapAccountsToHolders(accounts, supply);

    // Sort by percentage descending and slice to limit
    holders.sort((a, b) => b.percentage - a.percentage);
    const finalHolders = holders.slice(0, limit);

    return NextResponse.json(finalHolders, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error("Holders API (Helius) Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}