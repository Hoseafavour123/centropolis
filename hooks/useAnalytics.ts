'use client';

import { useCallback } from 'react';

export function useAnalytics() {
  const sendAnalytics = useCallback((eventName: string, payload?: Record<string, any>) => {
    // Console log for development
    console.log(`[Analytics] ${eventName}`, payload);
    
    // Send to mock endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          payload,
          timestamp: new Date().toISOString(),
          sessionId: 'mock-session',
        }),
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  return { sendAnalytics };
}