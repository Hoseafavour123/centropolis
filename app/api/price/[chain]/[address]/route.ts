// app/api/price/[chain]/[address]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PricePoint } from '@/types/token';
import { generateCandles } from '@/mocks/token.mock';

// // Generate realistic OHLCV data
// function generateCandles(
//   basePrice: number,
//   points: number,
//   timeframe: number = 15 * 60 * 1000 // 15 minutes
// ): PricePoint[] {
//   const candles: PricePoint[] = [];
//   let price = basePrice;
//   const now = Date.now();

//   for (let i = points; i >= 0; i--) {
//     const volatility = price * 0.015; // 1.5% volatility
//     const trend = Math.sin(i / 10) * volatility * 0.5; // Add trend cycles
//     const noise = (Math.random() - 0.5) * volatility;
    
//     const open = price;
//     const close = price + trend + noise;
//     const high = Math.max(open, close) + Math.random() * volatility * 0.3;
//     const low = Math.min(open, close) - Math.random() * volatility * 0.3;
//     const volume = Math.random() * 1000000 * (1 + Math.abs(close - open) / price);

//     candles.push({
//       time: now - i * timeframe,
//       open: Math.max(0.000001, open),
//       high: Math.max(0.000001, high),
//       low: Math.max(0.000001, low),
//       close: Math.max(0.000001, close),
//       volume: Math.floor(volume),
//     });

//     price = close;
//   }

//   return candles;
// }

// Base prices for known tokens
const BASE_PRICES: Record<string, number> = {
  'So11111111111111111111111111111111111111112': 136.82,
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1.00,
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 0.0000198,
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 3456.78,
  '0x4200000000000000000000000000000000000006': 3456.78,
};

function getBasePrice(address: string): number {
  return BASE_PRICES[address] || Math.random() * 100 + 0.001;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  const { chain, address } = await params;
  const { searchParams } = new URL(request.url);
  
  const range = searchParams.get('range') || '1d';
  const points = range === '1d' ? 96 : range === '7d' ? 672 : range === '30d' ? 2880 : 4320;
  const timeframe = range === '1d' ? 15 * 60 * 1000 : range === '7d' ? 15 * 60 * 1000 : 60 * 60 * 1000;

  // Simulate network delay
  await new Promise(r => setTimeout(r, 100 + Math.random() * 150));

  const basePrice = getBasePrice(address);
  const candles = generateCandles(basePrice, points);

  return NextResponse.json(candles, {
    headers: {
      'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=30',
    },
  });
}