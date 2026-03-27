import { NextRequest, NextResponse } from 'next/server';
import { dexScreenerService } from '@/lib/services/dexscreener';
import { liquidityAdapter } from '@/lib/adapters/liquidityAdapter';

/**
 * ============================================================================
 * LIQUIDITY POOLS API
 * ============================================================================
 * Description: Fetches real-time liquidity pools for a given token address.
 * ============================================================================
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json({ error: 'Token address required' }, { status: 400 });
    }

    // Fetch real pair data from DexScreener
    const pairs = await dexScreenerService.getTokenPairs(address);

    if (!pairs || pairs.length === 0) {
      return NextResponse.json([], {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        },
      });
    }

    // Normalize and transform into PoolInfo[]
    const pools = liquidityAdapter.mapPairs(pairs);

    // Sort by liquidityUsd descending
    pools.sort((a, b) => b.liquidityUsd - a.liquidityUsd);

    return NextResponse.json(pools, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error("Liquidity API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}