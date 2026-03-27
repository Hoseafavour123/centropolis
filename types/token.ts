export interface TokenMeta {
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

export interface TradeQuoteResponse {
  inAmount: string;
  outAmount: string;
  priceImpact: number;
  route: any; // Raw Jupiter route plan
  estimatedFees: number;
  // Fee routing strategy – tells the swap API which side to collect fees from
  feeMint: string | null;          // The mint whose parameter/account receives the fee
  feeStrategy: 'output' | 'input' | 'none'; // 'output' = standard Jupiter referral, 'input' = manual pre-swap transfer
  manualFeeAtoms?: string;         // Present if feeStrategy === 'input'
  // Sentinel Intelligence Layer
  sentinelScore: number;
  safetyBand: "safe" | "caution" | "danger";
  liquidityScore: number;
  mevRisk: "low" | "medium" | "high";
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