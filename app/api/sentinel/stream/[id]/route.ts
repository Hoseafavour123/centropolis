import { NextRequest } from 'next/server';
import { createMockStream } from '@/mocks/sentinel.mock';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      createMockStream(
        (msg) => {
          const data = `data: ${JSON.stringify(msg)}\n\n`;
          controller.enqueue(encoder.encode(data));
        },
        () => {
          controller.close();
        }
      );
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