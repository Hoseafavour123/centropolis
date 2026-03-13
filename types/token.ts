export interface  TokenMeta {
  chain: string;
  address: string;
  symbol: string;
  name: string;
  logoUrl?: string;
  marketCapUsd?: number;
  totalSupply?: string;
  decimals: number;
  verified?: boolean;
  contractFlags?: string[];
  lastUpdated: string;
  priceUsd?: number;
  change24h?: number;
  volume24h?: number;
  safetyScore?: number;
}

export interface PricePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Holder {
  address: string;
  label?: 'dev' | 'exchange' | 'whale' | 'smart_money' | 'unknown';
  percentage: number;
  amount: string;
  firstSeen?: string;
  lastSeen?: string;
}

export interface PoolInfo {
  poolId: string;
  pair: { tokenA: string; tokenB: string };
  liquidityUsd: number;
  depthScore: number;
  feeTier?: number;
  poolAddress?: string;
  lastUpdated?: string;
  provider?: 'Jupiter' | 'Orca' | 'Raydium' | 'Meteora';
  mevProtected?: boolean;
  jitoProtected?: boolean;
}

export interface FlowEdge {
  from: string;
  to: string;
  amountUsd: number;
  count: number;
  fromLabel?: string;
  toLabel?: string;
}

export interface TradeRoute {
  routeId: string;
  provider: 'Jupiter' | 'Orca' | 'Raydium' | 'Meteora';
  fromToken: string;
  toToken: string;
  expectedOutput: string;
  minimumOutput: string;
  priceImpact: number;
  slippage: number;
  feeUsd: number;
  platformFee: number; // 0.15%
  mevProtected: boolean;
  jitoProtected: boolean;
  steps: { dex: string; from: string; to: string; percent: number }[];
  estimatedTimeMs: number;
}

export interface SocialPost {
  id: string;
  platform: 'twitter' | 'telegram' | 'discord';
  author: string;
  content: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  engagement: number;
}

export interface AISummary {
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  keyPoints: string[];
  lastUpdated: string;
}