/**
 * ============================================================================
 * MOCK DATA & API CLIENT
 * ============================================================================
 * Description: Realistic mock generators and simulated API latency
 * to mimic a real Web3 backend.
 * ============================================================================
 */

import { Token, ChartPoint, TradeActivity, AIInsight } from "@/lib/types";

// --- Generators ---
export const generateCandleData = (
  basePrice: number,
  points: number = 50,
): ChartPoint[] => {
  let currentPrice = basePrice;
  const data: ChartPoint[] = [];
  const now = new Date();

  for (let i = 0; i < points; i++) {
    const volatility = currentPrice * 0.02;
    const change = (Math.random() - 0.5) * volatility;
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;

    data.push({
      time: new Date(now.getTime() - (points - i) * 60000 * 15).toISOString(), // 15m intervals
      open,
      high,
      low,
      close,
      volume: Math.random() * 10000,
    });
    currentPrice = close;
  }
  return data;
};

export const MOCK_TOKENS: Token[] = [
  {
    id: "1",
    symbol: "MEME",
    name: "MemeCoin",
    price: 0.0148,
    change24h: 12.5,
    volume24h: 45000000,
    marketCap: 120000000,
    logoUrl: "/tokens/meme.png",
    chain: "solana",
    safetyScore: 45,
  },
  {
    id: "2",
    symbol: "SHDW",
    name: "Shadow Token",
    price: 1.83,
    change24h: 9.6,
    volume24h: 12000000,
    marketCap: 85000000,
    logoUrl: "/tokens/shdw.png",
    chain: "solana",
    safetyScore: 82,
  },
  {
    id: "3",
    symbol: "WIF",
    name: "Dog Wif Hat",
    price: 0.248,
    change24h: -5.2,
    volume24h: 89000000,
    marketCap: 250000000,
    logoUrl: "/tokens/wif.png",
    chain: "solana",
    safetyScore: 60,
  },
  {
    id: "4",
    symbol: "BONK",
    name: "Bonk",
    price: 0.00000651,
    change24h: 6.1,
    volume24h: 150000000,
    marketCap: 400000000,
    logoUrl: "/tokens/bonk.png",
    chain: "solana",
    safetyScore: 78,
  },
];

export const MOCK_AI_INSIGHT: AIInsight = {
  tokenSymbol: "SOL",
  sentiment: "bullish",
  summary:
    "SOL looks strong. Recent smart money activity detected. Liquidity is solid. Uptrend likely to continue. Consider entering at key support levels.",
  confidence: 92,
};

// --- API Simulation ---

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const api = {
  getTrending: async (): Promise<Token[]> => {
    await delay(800); // Simulate network
    return MOCK_TOKENS;
  },

  getChartData: async (symbol: string): Promise<ChartPoint[]> => {
    await delay(1000);
    // Base price varies by symbol for realism
    const base = symbol === "SOL" ? 140 : Math.random() * 100;
    return generateCandleData(base);
  },

  getRecentActivity: async (): Promise<TradeActivity[]> => {
    await delay(600);
    return [
      {
        id: "1",
        type: "buy",
        tokenSymbol: "MEME",
        amount: 3500,
        value: 51.8,
        wallet: "7x...9z",
        timestamp: new Date(),
        isSmartMoney: false,
      },
      {
        id: "2",
        type: "buy",
        tokenSymbol: "SHDW",
        amount: 150000,
        value: 150000,
        wallet: "3a...2b",
        timestamp: new Date(),
        isSmartMoney: true,
      },
      {
        id: "3",
        type: "whale_move",
        tokenSymbol: "BONK",
        amount: 200000,
        value: 1.3,
        wallet: "WhaleX",
        timestamp: new Date(),
        isSmartMoney: false,
      },
    ];
  },
};
