import { NextRequest, NextResponse } from 'next/server';
import { AISummary } from '@/types/token';

const AI_DATABASE: Record<string, AISummary> = {
  'So11111111111111111111111111111111111111112': {
    summary: 'SOL looks strong. Liquidity is healthy and smart money is accumulating. RSI shows overbought conditions. Exercise caution at $140 resistance level.',
    sentiment: 'bullish',
    keyPoints: [
      'Strong liquidity depth ($314M)',
      'Positive smart money inflows (+$3.7M)',
      'RSI overbought at 72',
      'Watch $140 resistance',
      'Whale accumulation detected',
    ],
    lastUpdated: new Date().toISOString(),
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    summary: 'USDC maintains strong peg stability with deep liquidity across all major venues. Institutional confidence remains high. Minimal volatility expected.',
    sentiment: 'neutral',
    keyPoints: [
      'Peg stability: 0.9998-1.0002',
      'Deep liquidity ($2.8B)',
      'Regulatory compliant',
      'Full reserve attestation',
    ],
    lastUpdated: new Date().toISOString(),
  },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': {
    summary: 'BONK showing high volatility with strong community momentum. Social sentiment extremely positive but concentration risk remains elevated. Suitable for risk-tolerant traders only.',
    sentiment: 'bullish',
    keyPoints: [
      'Social mentions +340%',
      'High volatility (±15% daily)',
      'Community-driven momentum',
      '32% supply burned',
      'Meme coin risk profile',
    ],
    lastUpdated: new Date().toISOString(),
  },
};

function generateAISummary(address: string): AISummary {
  const sentiments: Array<'bullish' | 'bearish' | 'neutral'> = ['bullish', 'bearish', 'neutral'];
  const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
  
  const summaries: Record<string, string> = {
    bullish: 'Token showing positive momentum with increasing volume and smart money accumulation. Technical indicators suggest continued upside potential.',
    bearish: 'Concerning on-chain metrics with declining volume and smart money distribution. Caution advised for new positions.',
    neutral: 'Mixed signals with balanced buy/sell pressure. Awaiting clearer directional catalyst before significant position sizing.',
  };

  return {
    summary: summaries[sentiment],
    sentiment,
    keyPoints: [
      `Volume trend: ${sentiment === 'bullish' ? 'Increasing' : sentiment === 'bearish' ? 'Decreasing' : 'Stable'}`,
      `Smart money flow: ${sentiment === 'bullish' ? 'Positive' : sentiment === 'bearish' ? 'Negative' : 'Neutral'}`,
      'Liquidity adequate for position size',
      'Contract security verified',
    ],
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const chain = searchParams.get('chain');

  if (!token) {
    return NextResponse.json(
      { error: 'Token address required' },
      { status: 400 }
    );
  }

  // Simulate AI processing delay
  await new Promise(r => setTimeout(r, 300 + Math.random() * 400));

  const summary = AI_DATABASE[token] || generateAISummary(token);

  return NextResponse.json(summary, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}