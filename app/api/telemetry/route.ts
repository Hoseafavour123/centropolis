import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsEvent {
  event: string;
  payload?: Record<string, any>;
  timestamp: string;
  sessionId: string;
  userAgent?: string;
  ip?: string;
}

// In-memory store for development (use proper DB in production)
const eventLog: AnalyticsEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const event: AnalyticsEvent = {
      event: body.event,
      payload: body.payload,
      timestamp: body.timestamp || new Date().toISOString(),
      sessionId: body.sessionId || 'anonymous',
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || undefined,
    };

    // Log to console in development
    console.log(`[Analytics] ${event.event}`, event.payload);

    // Store event
    eventLog.push(event);

    // Keep only last 1000 events in memory
    if (eventLog.length > 1000) {
      eventLog.shift();
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid event data' },
      { status: 400 }
    );
  }
}

// GET endpoint to view recent events (development only)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  
  return NextResponse.json({
    events: eventLog.slice(-limit),
    total: eventLog.length,
  });
}