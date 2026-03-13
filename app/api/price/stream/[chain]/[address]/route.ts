import { NextRequest } from 'next/server';
import { PricePoint } from '@/types/token';

// Server-Sent Events for real-time price streaming
export async function GET(
  request: NextRequest,
  { params }: { params: { chain: string; address: string } }
) {
  const { address } = params;
  
  const basePrice = address.includes('So1111') ? 136.82 : 
                    address.includes('EPjFW') ? 1.00 : 
                    Math.random() * 100;

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      let price = basePrice;
      let interval: NodeJS.Timeout;

      // Send initial data
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`));

      // Stream price updates every 1-3 seconds
      interval = setInterval(() => {
        const volatility = price * 0.002;
        price = price + (Math.random() - 0.5) * volatility;

        const point: PricePoint = {
          time: Date.now(),
          open: price - volatility * 0.2,
          high: price + volatility * 0.5,
          low: price - volatility * 0.5,
          close: price,
          volume: Math.random() * 500000,
        };

        const message = `data: ${JSON.stringify({ type: 'price', payload: point })}\n\n`;
        
        try {
          controller.enqueue(encoder.encode(message));
        } catch {
          clearInterval(interval);
        }
      }, 1000 + Math.random() * 2000);

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}