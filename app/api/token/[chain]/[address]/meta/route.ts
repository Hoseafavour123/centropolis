import { NextRequest, NextResponse } from 'next/server';
import { TokenMeta } from '@/types/token';

// Mock token database
const TOKEN_DB: Record<string, Record<string, TokenMeta>> = {
  solana: {
    'So11111111111111111111111111111111111111112': {
      chain: 'solana',
      address: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      logoUrl: '/tokens/sol.png',
      marketCapUsd: 99400000000,
      totalSupply: '582000000',
      decimals: 9,
      verified: true,
      contractFlags: ['immutable', 'no-mint', 'no-freeze', 'no-upgrade'],
      lastUpdated: new Date().toISOString(),
      priceUsd: 136.82,
      change24h: 4.12,
      volume24h: 4220000000,
      safetyScore: 72,
    },
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
      chain: 'solana',
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      symbol: 'USDC',
      name: 'USD Coin',
      logoUrl: '/tokens/usdc.png',
      marketCapUsd: 28900000000,
      totalSupply: '28900000000',
      decimals: 6,
      verified: true,
      contractFlags: ['fiat-backed', 'regulated', 'audited'],
      lastUpdated: new Date().toISOString(),
      priceUsd: 1.00,
      change24h: 0.01,
      volume24h: 8900000000,
      safetyScore: 98,
    },
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': {
      chain: 'solana',
      address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      symbol: 'BONK',
      name: 'Bonk',
      logoUrl: '/tokens/bonk.png',
      marketCapUsd: 1850000000,
      totalSupply: '93528300000000',
      decimals: 5,
      verified: true,
      contractFlags: ['community', 'burned-lp'],
      lastUpdated: new Date().toISOString(),
      priceUsd: 0.0000198,
      change24h: 12.45,
      volume24h: 89000000,
      safetyScore: 65,
    },
  },
  ethereum: {
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': {
      chain: 'ethereum',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      logoUrl: '/tokens/weth.png',
      marketCapUsd: 45600000000,
      totalSupply: '26500000',
      decimals: 18,
      verified: true,
      contractFlags: ['wrapped', 'canonical'],
      lastUpdated: new Date().toISOString(),
      priceUsd: 3456.78,
      change24h: -1.23,
      volume24h: 12300000000,
      safetyScore: 95,
    },
  },
  base: {
    '0x4200000000000000000000000000000000000006': {
      chain: 'base',
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      logoUrl: '/tokens/weth.png',
      marketCapUsd: 890000000,
      totalSupply: '257000',
      decimals: 18,
      verified: true,
      contractFlags: ['wrapped', 'canonical', 'l2-native'],
      lastUpdated: new Date().toISOString(),
      priceUsd: 3456.78,
      change24h: -1.23,
      volume24h: 234000000,
      safetyScore: 88,
    },
  },
};

// Generate dynamic token for unknown addresses
function generateTokenMeta(chain: string, address: string): TokenMeta {
  const isRisky = address.toLowerCase().includes('risk') || Math.random() > 0.7;
  const basePrice = Math.random() * 100 + 0.01;
  
  return {
    chain,
    address,
    symbol: `TKN${address.slice(-4)}`,
    name: `Token ${address.slice(0, 6)}`,
    logoUrl: `/tokens/generic.png`,
    marketCapUsd: Math.random() * 1000000000,
    totalSupply: String(Math.floor(Math.random() * 1000000000)),
    decimals: 9,
    verified: !isRisky,
    contractFlags: isRisky ? ['unverified', 'mintable'] : ['immutable'],
    lastUpdated: new Date().toISOString(),
    priceUsd: basePrice,
    change24h: (Math.random() - 0.5) * 20,
    volume24h: Math.random() * 100000000,
    safetyScore: isRisky ? Math.floor(Math.random() * 40) : Math.floor(Math.random() * 30) + 70,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  const { chain, address } = await params;
  const normalizedAddress = chain === 'solana' ? address : address.toLowerCase();

  // Simulate network delay
  await new Promise(r => setTimeout(r, 150 + Math.random() * 200));

  // Check for forced error (for testing)
  if (address === 'error') {
    return NextResponse.json(
      { error: 'Failed to fetch token metadata' },
      { status: 500 }
    );
  }

  // Return known token or generate mock
  const token = TOKEN_DB[chain]?.[normalizedAddress] || generateTokenMeta(chain, normalizedAddress);

  // Add cache headers
  return NextResponse.json(token, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}