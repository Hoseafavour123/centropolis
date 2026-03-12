import { SentinelAnalyzeRequest, SentinelAnalyzeStart, SSEMessage, SentinelResult } from '@/types/sentinel';

export const mockAnalysisStart: SentinelAnalyzeStart = {
  analysisId: 'sent-12345',
  status: 'started',
};

export const mockSentinelResult: SentinelResult = {
  analysisId: 'sent-12345',
  summary: 'SOL demonstrates strong liquidity depth ($314M) and positive smart money inflows. However, top 20 holders control 23% of supply, indicating moderate concentration risk.',
  finalScore: 72,
  safetyBand: 'safe',
  metrics: {
    liquidityDepth: 314000000,
    topHoldersPercent: 23,
    recentSmartBuys: 47,
    volatilityIndex: 0.34,
    contractVerified: true,
  },
  evidence: [
    {
      id: 'ev-1',
      type: 'onchain',
      title: 'Liquidity Lock Verified',
      timestamp: new Date().toISOString(),
      content: 'Liquidity tokens burned at block 236,204,371. 95% of LP locked for 2 years.',
      metadata: { txHash: '0xabc...', block: 236204371 },
    },
    {
      id: 'ev-2',
      type: 'holder',
      title: 'Whale Accumulation',
      timestamp: new Date().toISOString(),
      content: 'Top 5 wallets increased holdings by 12% in last 24h.',
      metadata: { wallets: ['7x9...', '3a2...'] },
    },
  ],
  dataSources: [
    { source: 'Helius RPC', timestamp: new Date().toISOString() },
    { source: 'Twitter API', timestamp: new Date().toISOString() },
  ],
  createdAt: new Date().toISOString(),
};

// SSE Stream Simulator
export function createMockStream(onMessage: (msg: SSEMessage) => void, onComplete: () => void) {
  const chunks = [
    { type: 'chunk', payload: { text: 'Initializing contract scanner...\n' } },
    { type: 'chunk', payload: { text: 'Scanning for mint authority risks... ' } },
    { type: 'chunk', payload: { text: 'None found.\n' } },
    { type: 'meta', payload: { blockHeight: 236204371, dataSources: [{ source: 'Helius', timestamp: new Date().toISOString() }] } },
    { type: 'chunk', payload: { text: 'Analyzing holder distribution... ' } },
    { type: 'chunk', payload: { text: '23% concentration detected.\n' } },
    { type: 'chunk', payload: { text: 'Fetching smart money signals... ' } },
    { type: 'chunk', payload: { text: '+$3.7M net inflow.\n' } },
    { type: 'done', payload: { summary: mockSentinelResult.summary, finalScore: 72, metrics: mockSentinelResult.metrics, evidence: mockSentinelResult.evidence } },
  ];

  let index = 0;
  const interval = setInterval(() => {
    if (index >= chunks.length) {
      clearInterval(interval);
      onComplete();
      return;
    }
    onMessage(chunks[index] as SSEMessage);
    index++;
  }, 800); // Simulate network delay
}

// MSW Handlers
export const sentinelHandlers = [
  // POST /api/sentinel/analyze
  http.post('/api/sentinel/analyze', async () => {
    await new Promise((r) => setTimeout(r, 500));
    return HttpResponse.json(mockAnalysisStart);
  }),

  // GET /api/sentinel/stream/:id
  http.get('/api/sentinel/stream/:id', () => {
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        createMockStream(
          (msg) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
          },
          () => controller.close()
        );
      },
    });
    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
      },
    });
  }),

  // GET /api/sentinel/result/:id
  http.get('/api/sentinel/result/:id', () => {
    return HttpResponse.json(mockSentinelResult);
  }),
];

// Helper for imports
import { http, HttpResponse } from 'msw';