/**
 * ============================================================================
 * TYPES & INTERFACES
 * ============================================================================
 * Description: Centralized TypeScript definitions for the entire application.
 * ============================================================================
 */

export interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  logoUrl: string;
  chain: "solana" | "ethereum" | "base";
  safetyScore: number; // 0-100
}

export interface ChartPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradeActivity {
  id: string;
  type: "buy" | "sell" | "whale_move";
  tokenSymbol: string;
  amount: number;
  value: number;
  wallet: string;
  timestamp: Date;
  isSmartMoney: boolean;
}

export interface AIInsight {
  tokenSymbol: string;
  sentiment: "bullish" | "bearish" | "neutral";
  summary: string;
  confidence: number;
}

export interface UserWallet {
  address: string;
  balance: number;
  holdings: { token: Token; amount: number; value: number }[];
}
