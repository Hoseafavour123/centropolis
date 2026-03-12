import { 
  SentinelAnalyzeStart, 
  SentinelResult, 
  SSEMessage, 
  RugDetectionResult,
  Recommendation,
  RugIndicator 
} from '@/types/sentinel';

export const mockAnalysisStart: SentinelAnalyzeStart = {
  analysisId: 'sent-' + Math.random().toString(36).substr(2, 9),
  status: 'started',
};

// Rug Detection Configuration
const createRugDetection = (isSafe: boolean = true): RugDetectionResult => {
  const indicators: RugIndicator[] = [
    {
      id: 'mint-auth',
      name: 'Mint Authority',
      description: 'Ability to create new tokens',
      severity: 'critical',
      status: 'passed',
      details: 'Mint authority revoked. Contract is immutable.',
    },
    {
      id: 'freeze-auth',
      name: 'Freeze Authority',
      description: 'Ability to freeze token transfers',
      severity: 'critical',
      status: 'passed',
      details: 'Freeze authority revoked. No one can freeze wallets.',
    },
    {
      id: 'upgrade-auth',
      name: 'Upgrade Authority',
      description: 'Ability to modify contract code',
      severity: 'critical',
      status: 'passed',
      details: 'Program is immutable. No upgrades possible.',
    },
    {
      id: 'lp-burn',
      name: 'LP Token Burn',
      description: 'Liquidity provider tokens destroyed',
      severity: 'warning',
      status: 'passed',
      details: '95% of LP tokens burned. 5% locked for 2 years.',
    },
    {
      id: 'honeypot',
      name: 'Honeypot Test',
      description: 'Can tokens be sold?',
      severity: 'critical',
      status: 'passed',
      details: 'Sell simulation successful. No sell restrictions detected.',
    },
    {
      id: 'hidden-mint',
      name: 'Hidden Mint Functions',
      description: 'Stealth code to create tokens',
      severity: 'critical',
      status: 'passed',
      details: 'Bytecode scan complete. No hidden mint functions found.',
    },
    {
      id: 'tax-manipulation',
      name: 'Tax Manipulation',
      description: 'Ability to change transfer taxes',
      severity: 'warning',
      status: 'passed',
      details: 'Transfer tax fixed at 0%. No manipulation possible.',
    },
    {
      id: 'owner-renounce',
      name: 'Ownership Renounced',
      description: 'Contract has no owner',
      severity: 'info',
      status: 'passed',
      details: 'Contract ownership renounced. Community controlled.',
    },
  ];

  return {
    isRug: false,
    confidence: 98,
    riskLevel: 'none',
    indicators,
    summary: 'No rug pull indicators detected. Contract is fully immutable with burned liquidity and no admin functions. This is a low-risk deployment pattern.',
  };
};

// Recommendation Engine
const createRecommendation = (score: number): Recommendation => {
  if (score >= 80) {
    return {
      action: 'strong_buy',
      summary: 'Strong accumulation opportunity with institutional backing',
      detailedAdvice: 'SOL exhibits exceptional fundamentals with $314M in deep liquidity, positive smart money flows of +$3.7M, and strong holder distribution. The recent whale accumulation alongside social sentiment surge suggests imminent price appreciation. Recommended for core portfolio allocation with dollar-cost averaging on any dips below $135.',
      entryPoints: {
        conservative: 135.00,
        aggressive: 142.50,
      },
      stopLoss: 128.00,
      takeProfit: [155, 175, 200],
      timeHorizon: 'medium',
      confidence: 92,
    };
  } else if (score >= 60) {
    return {
      action: 'buy',
      summary: 'Favorable risk-reward with manageable concentration',
      detailedAdvice: 'While overall metrics are positive, the 23% holder concentration warrants position sizing discipline. Enter on confirmed support holds with reduced position size (50% of normal). Monitor top wallet movements for distribution signals.',
      entryPoints: {
        conservative: 132.00,
        aggressive: 140.00,
      },
      stopLoss: 125.00,
      takeProfit: [150, 165],
      timeHorizon: 'short',
      confidence: 78,
    };
  } else if (score >= 40) {
    return {
      action: 'hold',
      summary: 'Neutral outlook - await clearer signals',
      detailedAdvice: 'Mixed indicators present. While liquidity is adequate, smart money has turned neutral and social sentiment is cooling. Existing positions should be held but new entries deferred until score improves above 65 or price confirms breakout above $145 with volume.',
      timeHorizon: 'short',
      confidence: 65,
    };
  } else if (score >= 20) {
    return {
      action: 'avoid',
      summary: 'Multiple red flags - capital preservation priority',
      detailedAdvice: 'Significant risks identified including low liquidity depth, high concentration, and concerning smart money outflows. The risk of substantial drawdown outweighs potential upside. Avoid new positions and reduce exposure if held.',
      stopLoss: 0, // Don't add
      timeHorizon: 'short',
      confidence: 82,
    };
  } else {
    return {
      action: 'emergency_exit',
      summary: 'Critical risk - immediate exit recommended',
      detailedAdvice: 'Severe rug pull indicators detected or confirmed. This asset poses existential risk to capital. Immediate exit at market price recommended regardless of loss. Do not attempt to average down or wait for recovery.',
      stopLoss: 0,
      timeHorizon: 'short',
      confidence: 95,
    };
  }
};

export const mockSentinelResult: SentinelResult = {
  analysisId: 'sent-demo-123',
  summary: 'SOL demonstrates strong liquidity depth ($314M) and positive smart money inflows. However, top 20 holders control 23% of supply, indicating moderate concentration risk.',
  finalScore: 72,
  safetyBand: 'safe',
  metrics: {
    liquidityDepth: 314000000,
    topHoldersPercent: 23,
    recentSmartBuys: 47,
    volatilityIndex: 0.34,
    contractVerified: true,
    whaleInflow24h: 3700000,
    socialSentiment: 0.67,
    priceChange24h: 8.4,
    volumeChange24h: 127,
  },
  rugDetection: createRugDetection(),
  recommendation: createRecommendation(72),
  evidence: [
    {
      id: 'ev-1',
      type: 'rug',
      title: 'Rug Detection: CLEAR',
      timestamp: new Date().toISOString(),
      content: 'All 8 security indicators passed. No mint, freeze, or upgrade authorities present. LP tokens burned. Contract is immutable.',
      metadata: { 
        scanVersion: '2.4.1',
        indicatorsPassed: 8,
        indicatorsFailed: 0,
        indicatorsWarning: 0,
      },
    },
    {
      id: 'ev-2',
      type: 'onchain',
      title: 'Liquidity Lock Verified',
      timestamp: new Date().toISOString(),
      content: 'Liquidity tokens burned at block 236,204,371. 95% of LP locked for 2 years via Streamflow protocol.',
      metadata: { 
        txHash: '5xKp...9zLm', 
        block: 236204371,
        lockDuration: '2 years',
        percentLocked: 95,
        protocol: 'Streamflow',
      },
    },
    {
      id: 'ev-3',
      type: 'holder',
      title: 'Whale Accumulation Detected',
      timestamp: new Date().toISOString(),
      content: 'Top 5 non-exchange wallets increased holdings by 12% ($3.7M) in last 24h. Smart money signal bullish.',
      metadata: { 
        wallets: ['7x9vB2mN...4pQ', '3aK8wX...9zL', '9mN2pQ...7xB'],
        avgIncrease: '12%',
        totalValue: 3700000,
        classification: 'smart_money',
      },
    },
    {
      id: 'ev-4',
      type: 'social',
      title: 'Social Sentiment Shift',
      timestamp: new Date().toISOString(),
      content: 'Twitter sentiment score increased from 0.34 to 0.67 in 6 hours. 12,400 new mentions. Influencer @solana_whale posted positive thread.',
      metadata: { 
        platform: 'Twitter',
        mentionCount: 12400,
        sentimentScore: 0.67,
        keyInfluencers: ['@solana_whale', '@crypto_king'],
        trendingHashtags: ['#SOL', '#SolanaSeason'],
      },
    },
    {
      id: 'ev-5',
      type: 'tx',
      title: 'Institutional Inflow',
      timestamp: new Date().toISOString(),
      content: 'Jump Trading wallet deposited $1.2M USDC to Raydium SOL-USDC pool. Followed by $890K purchase across 3 DEXs.',
      metadata: { 
        institution: 'Jump Trading',
        value: 1200000,
        venues: ['Raydium', 'Orca', 'Meteora'],
        txHashes: ['3x9...', '7a2...', '1k4...'],
      },
    },
  ],
  dataSources: [
    { source: 'Helius RPC', timestamp: new Date().toISOString() },
    { source: 'Birdeye API', timestamp: new Date().toISOString() },
    { source: 'Twitter API', timestamp: new Date().toISOString() },
    { source: 'Nansen Smart Money', timestamp: new Date().toISOString() },
  ],
  createdAt: new Date().toISOString(),
};

// SSE Stream Simulator with Rug Detection & Recommendation
export function createMockStream(
  onMessage: (msg: SSEMessage) => void, 
  onComplete: () => void
) {
  const analysisId = 'sent-' + Math.random().toString(36).substr(2, 9);
  
  const rugResult = createRugDetection();
  const recResult = createRecommendation(72);
  
  const chunks: SSEMessage[] = [
    { type: 'chunk', payload: { text: '🔍 Initializing Sentinel v2.4.1...\n' } },
    { type: 'chunk', payload: { text: '⏳ Establishing secure RPC connection...\n' } },
    { type: 'chunk', payload: { text: '✅ Connected to Helius dedicated node\n' } },
    { type: 'chunk', payload: { text: '📡 Block height: 236,204,371 | Latency: 12ms\n\n' } },
    
    // RUG DETECTION PHASE
    { type: 'chunk', payload: { text: '🛡️  STARTING RUG DETECTION PROTOCOL\n' } },
    { type: 'chunk', payload: { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' } },
    { type: 'chunk', payload: { text: '🔒 Checking mint authority... ' } },
    { type: 'chunk', payload: { text: 'REVOKED ✅\n' } },
    { type: 'chunk', payload: { text: '🔒 Checking freeze authority... ' } },
    { type: 'chunk', payload: { text: 'REVOKED ✅\n' } },
    { type: 'chunk', payload: { text: '🔒 Checking upgrade authority... ' } },
    { type: 'chunk', payload: { text: 'REVOKED ✅\n' } },
    { type: 'chunk', payload: { text: '🔍 Scanning bytecode for hidden functions... ' } },
    { type: 'chunk', payload: { text: 'CLEAN ✅\n' } },
    { type: 'chunk', payload: { text: '🧪 Honeypot simulation (sell test)... ' } },
    { type: 'chunk', payload: { text: 'SUCCESS ✅\n' } },
    { type: 'chunk', payload: { text: '💧 Verifying LP token status... ' } },
    { type: 'chunk', payload: { text: '95% BURNED ✅\n' } },
    { type: 'chunk', payload: { text: '👤 Checking ownership renouncement... ' } },
    { type: 'chunk', payload: { text: 'RENOUNCED ✅\n\n' } },
    
    { type: 'chunk', payload: { text: '🎯 RUG DETECTION RESULT: ' } },
    { type: 'chunk', payload: { text: 'CLEAR 🟢\n' } },
    { type: 'chunk', payload: { text: `   Confidence: ${rugResult.confidence}%\n` } },
    { type: 'chunk', payload: { text: `   Risk Level: ${rugResult.riskLevel.toUpperCase()}\n` } },
    { type: 'chunk', payload: { text: `   Indicators Passed: 8/8\n\n` } },
    
    // FUNDAMENTAL ANALYSIS
    { type: 'chunk', payload: { text: '📊 ANALYZING FUNDAMENTALS\n' } },
    { type: 'chunk', payload: { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' } },
    { type: 'chunk', payload: { text: '💧 Liquidity Analysis:\n' } },
    { type: 'chunk', payload: { text: '   • Raydium V4:        $142,000,000\n' } },
    { type: 'chunk', payload: { text: '   • Orca Whirlpool:     $98,000,000\n' } },
    { type: 'chunk', payload: { text: '   • Meteora DLMM:       $74,000,000\n' } },
    { type: 'chunk', payload: { text: '   ─────────────────────────────\n' } },
    { type: 'chunk', payload: { text: '   • TOTAL DEPTH:       $314M (Excellent)\n' } },
    { type: 'chunk', payload: { text: '   • Health Score:      88/100\n\n' } },
    
    { type: 'chunk', payload: { text: '🐋 Holder Distribution:\n' } },
    { type: 'chunk', payload: { text: '   • Total Holders:     1,247,893\n' } },
    { type: 'chunk', payload: { text: '   • Top 20 Wallets:    23.0% (Moderate)\n' } },
    { type: 'chunk', payload: { text: '   • Gini Coefficient:  0.67\n' } },
    { type: 'chunk', payload: { text: '   • Concentration:     Medium Risk ⚠️\n\n' } },
    
    { type: 'meta', payload: { 
      blockHeight: 236204371, 
      socialScrapeAt: new Date().toISOString(),
      dataSources: [
        { source: 'Helius', timestamp: new Date().toISOString() }
      ] 
    }},
    
    // SMART MONEY
    { type: 'chunk', payload: { text: '💰 Smart Money Intelligence:\n' } },
    { type: 'chunk', payload: { text: '   • Net Inflow 24h:    +$3,700,000\n' } },
    { type: 'chunk', payload: { text: '   • New Smart Buyers:  47 wallets\n' } },
    { type: 'chunk', payload: { text: '   • Avg Position Δ:    +12%\n' } },
    { type: 'chunk', payload: { text: '   • Signal Strength:   BULLISH 📈\n\n' } },
    
    // SOCIAL SENTIMENT
    { type: 'chunk', payload: { text: '📱 Social Sentiment Analysis:\n' } },
    { type: 'chunk', payload: { text: '   • Twitter Mentions:  +340% (12,400)\n' } },
    { type: 'chunk', payload: { text: '   • Sentiment Score:   0.67 → 0.89\n' } },
    { type: 'chunk', payload: { text: '   • Key Influencers:   @solana_whale (+)\n' } },
    { type: 'chunk', payload: { text: '   • Trending:          #SOL #SolanaSeason\n\n' } },
    
    // SCORE CALCULATION
    { type: 'chunk', payload: { text: '⚖️  COMPUTING FINAL SAFETY SCORE\n' } },
    { type: 'chunk', payload: { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' } },
    { type: 'chunk', payload: { text: '   Contract Security:    95/100  🟢\n' } },
    { type: 'chunk', payload: { text: '   Liquidity Health:     88/100  🟢\n' } },
    { type: 'chunk', payload: { text: '   Holder Distribution:  58/100  🟡\n' } },
    { type: 'chunk', payload: { text: '   Smart Money Flow:     91/100  🟢\n' } },
    { type: 'chunk', payload: { text: '   Social Momentum:      85/100  🟢\n' } },
    { type: 'chunk', payload: { text: '   ─────────────────────────────\n' } },
    { type: 'chunk', payload: { text: '   WEIGHTED SCORE:       72/100  🟢 SAFE\n\n' } },
    
    // RECOMMENDATION
    { type: 'chunk', payload: { text: '🎯 SENTINEL RECOMMENDATION\n' } },
    { type: 'chunk', payload: { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' } },
    { type: 'chunk', payload: { text: `   ACTION: ${recResult.action.toUpperCase().replace('_', ' ')}\n` } },
    { type: 'chunk', payload: { text: `   CONFIDENCE: ${recResult.confidence}%\n\n` } },
    { type: 'chunk', payload: { text: `   "${recResult.summary}"\n\n` } },
    { type: 'chunk', payload: { text: `   ${recResult.detailedAdvice}\n\n` } },
    
    { type: 'chunk', payload: { text: '📍 ENTRY STRATEGY:\n' } },
    { type: 'chunk', payload: { text: `   Conservative Entry:  $${recResult.entryPoints?.conservative}\n` } },
    { type: 'chunk', payload: { text: `   Aggressive Entry:    $${recResult.entryPoints?.aggressive}\n` } },
    { type: 'chunk', payload: { text: `   Stop Loss:           $${recResult.stopLoss}\n` } },
    { type: 'chunk', payload: { text: `   Take Profits:        $${recResult.takeProfit?.join(' → $')}\n` } },
    { type: 'chunk', payload: { text: `   Time Horizon:        ${recResult.timeHorizon.toUpperCase()}\n\n` } },
    
    { type: 'chunk', payload: { text: '✅ Analysis complete. Report generated.\n' } },
    
    { type: 'done', payload: { 
      summary: mockSentinelResult.summary,
      finalScore: 72,
      metrics: mockSentinelResult.metrics,
      evidence: mockSentinelResult.evidence,
      rugDetection: rugResult,
      recommendation: recResult,
    }},
  ];

  let index = 0;
  
  const sendNextChunk = () => {
    if (index >= chunks.length) {
      onComplete();
      return;
    }
    
    onMessage(chunks[index]);
    index++;
    
    const delay = Math.random() * 300 + 150; // 150-450ms for faster feel
    setTimeout(sendNextChunk, delay);
  };
  
  setTimeout(sendNextChunk, 300);
}