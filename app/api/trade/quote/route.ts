import { NextRequest, NextResponse } from 'next/server';
import { TradeRoute } from '@/types/token';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const chain = searchParams.get('chain') || 'solana';
  const fromToken = searchParams.get('from') || 'USDC';
  const toToken = searchParams.get('to') || 'SOL';
  const amount = searchParams.get('amount') || '1000';

  // Simulate network delay
  await new Promise(r => setTimeout(r, 100 + Math.random() * 200));

  const amountNum = parseFloat(amount);
  const outputBase = fromToken === 'USDC' && toToken === 'SOL' ? amountNum / 136.82 :
                     fromToken === 'SOL' && toToken === 'USDC' ? amountNum * 136.82 :
                     amountNum * (Math.random() * 100);

  const routes: TradeRoute[] = [
    {
      routeId: `route-jupiter-${Date.now()}`,
      provider: 'Jupiter',
      fromToken,
      toToken,
      expectedOutput: (outputBase * 0.9985).toFixed(6),
      minimumOutput: (outputBase * 0.995).toFixed(6),
      priceImpact: 0.08,
      slippage: 0.5,
      feeUsd: amountNum * 0.0005,
      platformFee: 0.15,
      mevProtected: true,
      jitoProtected: true,
      steps: [{ dex: 'Jupiter', from: fromToken, to: toToken, percent: 100 }],
      estimatedTimeMs: 450,
    },
    {
      routeId: `route-orca-${Date.now()}`,
      provider: 'Orca',
      fromToken,
      toToken,
      expectedOutput: (outputBase * 0.9975).toFixed(6),
      minimumOutput: (outputBase * 0.994).toFixed(6),
      priceImpact: 0.12,
      slippage: 0.5,
      feeUsd: amountNum * 0.0003,
      platformFee: 0.15,
      mevProtected: true,
      jitoProtected: false,
      steps: [{ dex: 'Orca', from: fromToken, to: toToken, percent: 100 }],
      estimatedTimeMs: 320,
    },
    {
      routeId: `route-raydium-${Date.now()}`,
      provider: 'Raydium',
      fromToken,
      toToken,
      expectedOutput: (outputBase * 0.996).toFixed(6),
      minimumOutput: (outputBase * 0.992).toFixed(6),
      priceImpact: 0.18,
      slippage: 0.5,
      feeUsd: amountNum * 0.0025,
      platformFee: 0.15,
      mevProtected: false,
      jitoProtected: false,
      steps: [
        { dex: 'Raydium', from: fromToken, to: 'USDC', percent: 50 },
        { dex: 'Raydium', from: 'USDC', to: toToken, percent: 50 },
      ],
      estimatedTimeMs: 680,
    },
    {
      routeId: `route-meteora-${Date.now()}`,
      provider: 'Meteora',
      fromToken,
      toToken,
      expectedOutput: (outputBase * 0.997).toFixed(6),
      minimumOutput: (outputBase * 0.993).toFixed(6),
      priceImpact: 0.15,
      slippage: 0.5,
      feeUsd: amountNum * 0.00025,
      platformFee: 0.15,
      mevProtected: true,
      jitoProtected: true,
      steps: [{ dex: 'Meteora', from: fromToken, to: toToken, percent: 100 }],
      estimatedTimeMs: 520,
    },
  ];

  // Sort by expected output descending
  routes.sort((a, b) => parseFloat(b.expectedOutput) - parseFloat(a.expectedOutput));

  return NextResponse.json(routes, {
    headers: {
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
    },
  });
}