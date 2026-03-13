import { setupWorker } from 'msw/browser';
import { http, HttpResponse, ws } from 'msw';
import { 
  mockTokenMeta, 
  mockHolders, 
  mockPools, 
  mockTradeRoutes,
  mockSocialPosts,
  mockAISummary,
  mockFlowEdges,
  generateCandles,
} from './token.mock';

// Combine all handlers for MSW
export const handlers = [
  // Token metadata
  http.get('/api/token/:chain/:address/meta', async ({ params }) => {
    await new Promise(r => setTimeout(r, 200));
    return HttpResponse.json({
      ...mockTokenMeta,
      chain: params.chain,
      address: params.address,
    });
  }),

  // Price history
  http.get('/api/price/:chain/:address', async ({ request }) => {
    const url = new URL(request.url);
    const range = url.searchParams.get('range') || '1d';
    const points = range === '1d' ? 96 : range === '7d' ? 168 : 100;
    
    await new Promise(r => setTimeout(r, 150));
    return HttpResponse.json(generateCandles(136.82, points));
  }),

  // Holders
  http.get('/api/holders/:chain/:address', async ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    await new Promise(r => setTimeout(r, 250));
    return HttpResponse.json(mockHolders.slice(0, limit));
  }),

  // Pools
  http.get('/api/liquidity/:chain/:address/pools', async () => {
    await new Promise(r => setTimeout(r, 200));
    return HttpResponse.json(mockPools);
  }),

  // Trade quote
  http.get('/api/trade/quote', async ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    
    await new Promise(r => setTimeout(r, 150));
    return HttpResponse.json(mockTradeRoutes.map(r => ({
      ...r,
      fromToken: from || r.fromToken,
      toToken: to || r.toToken,
    })));
  }),

  // AI Summary
  http.get('/api/sentinel/result', async () => {
    await new Promise(r => setTimeout(r, 300));
    return HttpResponse.json(mockAISummary);
  }),

  // Social
  http.get('/api/social/:chain/:address', async () => {
    await new Promise(r => setTimeout(r, 200));
    return HttpResponse.json(mockSocialPosts);
  }),

  // Flow
  http.get('/api/flow/:chain/:address', async () => {
    await new Promise(r => setTimeout(r, 250));
    return HttpResponse.json(mockFlowEdges);
  }),

  // Telemetry
  http.post('/api/telemetry', async () => {
    return HttpResponse.json({ success: true });
  }),
];

export const worker = setupWorker(...handlers);