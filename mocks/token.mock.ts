import { 
  TokenMeta, 
  PricePoint, 
  Holder, 
  PoolInfo, 
  FlowEdge, 
  TradeRoute,
  SocialPost,
  AISummary 
} from '@/types/token';
import { http, HttpResponse, ws } from 'msw';

// Mock Data Generators
export const generateCandles = (basePrice: number, points: number = 100): PricePoint[] => {
  const data: PricePoint[] = [];
  let price = basePrice;
  const now = Date.now();
  
  for (let i = points; i >= 0; i--) {
    const volatility = price * 0.02;
    const change = (Math.random() - 0.5) * volatility;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    
    data.push({
      time: now - i * 60000 * 15, // 15m intervals
      open,
      high,
      low,
      close,
      volume: Math.random() * 1000000,
    });
    price = close;
  }
  return data;
};

export const mockTokenMeta: TokenMeta = {
  chain: 'solana',
  address: 'So11111111111111111111111111111111111111112',
  symbol: 'SOL',
  name: 'Solana',
  logoUrl: '/tokens/sol.png',
  marketCapUsd: 99400000000,
  totalSupply: '582000000',
  decimals: 9,
  verified: true,
  contractFlags: ['immutable', 'no-mint'],
  lastUpdated: new Date().toISOString(),
  priceUsd: 136.82,
  change24h: 4.12,
  volume24h: 4220000000,
  safetyScore: 72,
};

export const mockHolders: Holder[] = [
  { address: '5D1...BL5w', label: 'dev', percentage: 9.2, amount: '53500000', firstSeen: '2020-03-01', lastSeen: '2024-01-15' },
  { address: 'WBZ...3AE', label: 'whale', percentage: 4.8, amount: '27900000', firstSeen: '2021-06-12', lastSeen: '2024-03-10' },
  { address: 'BSD...5SL', label: 'exchange', percentage: 2.6, amount: '15100000', firstSeen: '2022-01-20', lastSeen: '2024-03-13' },
  { address: '2g5...LD', label: 'smart_money', percentage: 1.8, amount: '10400000', firstSeen: '2023-08-05', lastSeen: '2024-03-13' },
  { address: '7x9...4pQ', label: 'whale', percentage: 1.4, amount: '8100000', firstSeen: '2023-11-12', lastSeen: '2024-03-12' },
];

export const mockPools: PoolInfo[] = [
  { 
    poolId: 'pool-1', 
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
    poolId: 'pool-2', 
    pair: { tokenA: 'SOL', tokenB: 'JitoSOL' }, 
    liquidityUsd: 142400000, 
    depthScore: 88, 
    feeTier: 0.0001,
    provider: 'Orca',
    mevProtected: true,
    jitoProtected: false,
    lastUpdated: new Date().toISOString(),
  },
  { 
    poolId: 'pool-3', 
    pair: { tokenA: 'BONK', tokenB: 'SOL' }, 
    liquidityUsd: 56100000, 
    depthScore: 72, 
    feeTier: 0.003,
    provider: 'Raydium',
    mevProtected: false,
    jitoProtected: false,
    lastUpdated: new Date().toISOString(),
  },
];

export const mockTradeRoutes: TradeRoute[] = [
  {
    routeId: 'route-jupiter-1',
    provider: 'Jupiter',
    fromToken: 'USDC',
    toToken: 'SOL',
    expectedOutput: '3.512',
    minimumOutput: '3.498',
    priceImpact: 0.12,
    slippage: 0.5,
    feeUsd: 0.45,
    platformFee: 0.15,
    mevProtected: true,
    jitoProtected: true,
    steps: [{ dex: 'Jupiter', from: 'USDC', to: 'SOL', percent: 100 }],
    estimatedTimeMs: 800,
  },
  {
    routeId: 'route-orca-1',
    provider: 'Orca',
    fromToken: 'USDC',
    toToken: 'SOL',
    expectedOutput: '3.508',
    minimumOutput: '3.495',
    priceImpact: 0.15,
    slippage: 0.5,
    feeUsd: 0.52,
    platformFee: 0.15,
    mevProtected: true,
    jitoProtected: false,
    steps: [{ dex: 'Orca', from: 'USDC', to: 'SOL', percent: 100 }],
    estimatedTimeMs: 600,
  },
];

export const mockSocialPosts: SocialPost[] = [
  { id: '1', platform: 'twitter', author: '@solana_whale', content: 'SOL breaking $140 resistance with strong volume. Smart money accumulating heavily.', timestamp: new Date().toISOString(), sentiment: 'positive', engagement: 12400 },
  { id: '2', platform: 'telegram', author: 'SolanaNews', content: 'JitoSOL integration now live on major DEXs. LST market heating up.', timestamp: new Date().toISOString(), sentiment: 'positive', engagement: 8900 },
  { id: '3', platform: 'twitter', author: '@crypto_critic', content: 'Concerned about concentration in top holders. 23% is high for a mature chain.', timestamp: new Date().toISOString(), sentiment: 'negative', engagement: 3400 },
];

export const mockAISummary: AISummary = {
  summary: 'SOL looks strong. Liquidity is healthy and smart money is accumulating. RSI shows overbought conditions. Exercise caution at $140 resistance level.',
  sentiment: 'bullish',
  keyPoints: [
    'Strong liquidity depth ($314M)',
    'Positive smart money inflows (+$3.7M)',
    'RSI overbought at 72',
    'Watch $140 resistance',
  ],
  lastUpdated: new Date().toISOString(),
};

export const mockFlowEdges: FlowEdge[] = [
  { from: 'Exchange Inflow', to: 'Whale Wallets', amountUsd: 15000000, count: 45, fromLabel: 'CEX', toLabel: 'Whale' },
  { from: 'Whale Wallets', to: 'Staking', amountUsd: 8900000, count: 23, fromLabel: 'Whale', toLabel: 'Staking' },
  { from: 'Retail', to: 'DEX', amountUsd: 5600000, count: 1240, fromLabel: 'Retail', toLabel: 'DEX' },
  { from: 'DEX', to: 'Whale Wallets', amountUsd: 3200000, count: 67, fromLabel: 'DEX', toLabel: 'Whale' },
  { from: 'Staking', to: 'Validator', amountUsd: 12000000, count: 89, fromLabel: 'Staking', toLabel: 'Validator' },
];

// MSW Handlers
export const tokenHandlers = [
  // GET /api/token/:chain/:addr/meta
  http.get('/api/token/:chain/:address/meta', async ({ params }) => {
    await new Promise(r => setTimeout(r, 300));
    return HttpResponse.json({
      ...mockTokenMeta,
      chain: params.chain,
      address: params.address,
    });
  }),

  // GET /api/price/:chain/:addr
  http.get('/api/price/:chain/:address', async ({ request }) => {
    const url = new URL(request.url);
    const range = url.searchParams.get('range') || '1d';
    const points = range === '1d' ? 96 : range === '7d' ? 168 : 100;
    
    await new Promise(r => setTimeout(r, 200));
    return HttpResponse.json(generateCandles(136.82, points));
  }),

  // GET /api/holders/:chain/:addr
  http.get('/api/holders/:chain/:address', async ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    await new Promise(r => setTimeout(r, 400));
    return HttpResponse.json(mockHolders.slice(0, limit));
  }),

  // GET /api/liquidity/:chain/:addr/pools
  http.get('/api/liquidity/:chain/:address/pools', async () => {
    await new Promise(r => setTimeout(r, 350));
    return HttpResponse.json(mockPools);
  }),

  // GET /api/trade/quote
  http.get('/api/trade/quote', async ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    
    await new Promise(r => setTimeout(r, 250));
    return HttpResponse.json(mockTradeRoutes.map(r => ({
      ...r,
      fromToken: from || r.fromToken,
      toToken: to || r.toToken,
    })));
  }),

  // GET /api/sentinel/result
  http.get('/api/sentinel/result', async ({ request }) => {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    await new Promise(r => setTimeout(r, 500));
    return HttpResponse.json({
      ...mockAISummary,
      token,
    });
  }),

  // GET /api/social/:chain/:addr
  http.get('/api/social/:chain/:address', async () => {
    await new Promise(r => setTimeout(r, 300));
    return HttpResponse.json(mockSocialPosts);
  }),

  // GET /api/flow/:chain/:addr
  http.get('/api/flow/:chain/:address', async () => {
    await new Promise(r => setTimeout(r, 400));
    return HttpResponse.json(mockFlowEdges);
  }),
];

// WebSocket Price Stream Simulator
export class PriceStreamSimulator {
  private interval: NodeJS.Timeout | null = null;
  private callbacks: ((point: PricePoint) => void)[] = [];
  private lastPrice = 136.82;

  subscribe(callback: (point: PricePoint) => void) {
    this.callbacks.push(callback);
    
    if (!this.interval) {
      this.interval = setInterval(() => {
        const volatility = this.lastPrice * 0.005;
        const change = (Math.random() - 0.5) * volatility;
        const price = this.lastPrice + change;
        
        const point: PricePoint = {
          time: Date.now(),
          open: this.lastPrice,
          high: Math.max(this.lastPrice, price) + Math.random() * volatility * 0.3,
          low: Math.min(this.lastPrice, price) - Math.random() * volatility * 0.3,
          close: price,
          volume: Math.random() * 500000,
        };
        
        this.lastPrice = price;
        this.callbacks.forEach(cb => cb(point));
      }, 1000);
    }

    return () => {
      const idx = this.callbacks.indexOf(callback);
      if (idx > -1) this.callbacks.splice(idx, 1);
      if (this.callbacks.length === 0 && this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    };
  }
}

export const priceSimulator = new PriceStreamSimulator();