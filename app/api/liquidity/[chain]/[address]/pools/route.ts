import { NextRequest, NextResponse } from 'next/server';
import { PoolInfo } from '@/types/token';

const POOL_DATABASE: Record<string, PoolInfo[]> = {
  'So11111111111111111111111111111111111111112': [
    {
      poolId: 'sol-usdc-jupiter-1',
      pair: { tokenA: 'SOL', tokenB: 'USDC' },
      liquidityUsd: 314200000,
      depthScore: 94,
      feeTier: 0.0005,
      poolAddress: '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2',
      provider: 'Jupiter',
      mevProtected: true,
      jitoProtected: true,
      lastUpdated: new Date().toISOString(),
    },
    {
      poolId: 'sol-jitosol-orca-1',
      pair: { tokenA: 'SOL', tokenB: 'JitoSOL' },
      liquidityUsd: 142400000,
      depthScore: 88,
      feeTier: 0.0001,
      poolAddress: 'C3Po2t8JP7Yu8g5aJ8vqQ1S5y9i8u9vY7w6x5z4a3b2c',
      provider: 'Orca',
      mevProtected: true,
      jitoProtected: false,
      lastUpdated: new Date().toISOString(),
    },
    {
      poolId: 'bonk-sol-raydium-1',
      pair: { tokenA: 'BONK', tokenB: 'SOL' },
      liquidityUsd: 56100000,
      depthScore: 72,
      feeTier: 0.003,
      poolAddress: '8sGjK9t7q6r5e4w3q2w1e2r3t4y5u6i7o8p9a0s1d2f3',
      provider: 'Raydium',
      mevProtected: false,
      jitoProtected: false,
      lastUpdated: new Date().toISOString(),
    },
    {
      poolId: 'sol-usdc-meteora-1',
      pair: { tokenA: 'SOL', tokenB: 'USDC' },
      liquidityUsd: 89200000,
      depthScore: 85,
      feeTier: 0.00025,
      poolAddress: '9tH8g7f6d5s4a3q2w1e2r3t4y5u6i7o8p9a0s1d2f3g4',
      provider: 'Meteora',
      mevProtected: true,
      jitoProtected: true,
      lastUpdated: new Date().toISOString(),
    },
  ],
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': [
    {
      poolId: 'usdc-sol-jupiter-1',
      pair: { tokenA: 'USDC', tokenB: 'SOL' },
      liquidityUsd: 314200000,
      depthScore: 94,
      feeTier: 0.0005,
      poolAddress: '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2',
      provider: 'Jupiter',
      mevProtected: true,
      jitoProtected: true,
      lastUpdated: new Date().toISOString(),
    },
  ],
};

function generatePools(address: string): PoolInfo[] {
  const providers: Array<PoolInfo['provider']> = ['Jupiter', 'Orca', 'Raydium', 'Meteora'];
  
  return providers.map((provider, i) => ({
    poolId: `pool-${address.slice(-4)}-${provider!.toLowerCase()}-${i}`,
    pair: { 
      tokenA: `TKN${address.slice(-4)}`, 
      tokenB: ['USDC', 'SOL', 'ETH', 'USDT'][i % 4] 
    },
    liquidityUsd: Math.random() * 100000000 + 1000000,
    depthScore: Math.floor(Math.random() * 30) + 70,
    feeTier: [0.0001, 0.0005, 0.003, 0.01][i % 4],
    poolAddress: `${Math.random().toString(36).substring(2, 15)}`,
    provider,
    mevProtected: provider === 'Jupiter' || provider === 'Orca',
    jitoProtected: provider === 'Jupiter',
    lastUpdated: new Date().toISOString(),
  }));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  const { address } = await params;

  // Simulate network delay
  await new Promise(r => setTimeout(r, 150 + Math.random() * 200));

  const pools = POOL_DATABASE[address] || generatePools(address);

  // Sort by liquidity descending
  pools.sort((a, b) => b.liquidityUsd - a.liquidityUsd);

  return NextResponse.json(pools, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
    },
  });
}