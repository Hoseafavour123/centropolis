
// app/api/token/[chain]/[address]/meta/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { tokenAggregator } from '@/services/token/tokenAggregator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  const { chain, address } = await params;

  try {
    const token = await tokenAggregator.getTokenMeta(chain, address);

    return NextResponse.json(token, {
      headers: {
        // public: can be cached by browsers and CDNs
        // s-maxage=60: cache on CDN for 60 seconds
        // stale-while-revalidate=300: allow serving stale data for up to 5 minutes while background refresh happens
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error(`[TokenMetaAPI] Error fetching metadata for ${chain}/${address}:`, error);

    // Fallback minimal object for error cases
    return NextResponse.json({
      chain,
      address,
      symbol: 'TKN',
      name: 'Unknown Token',
      decimals: 9,
      lastUpdated: new Date().toISOString(),
      verified: false,
      contractFlags: ['unverified'],
      safetyScore: 0
    }, {
      status: 200, // Return 200 with partial data rather than 500 to keep UI stable
      headers: {
        'Cache-Control': 'no-store', // Don't cache error fallbacks
      }
    });
  }
}