export function useAnalytics() {
  const track = (eventName: string, payload?: Record<string, any>) => {
    // Console log for dev
    console.log(`[Analytics] ${eventName}`, payload);
    
    // Mock endpoint call
    if (typeof window !== 'undefined') {
      fetch('/api/telemetry', {
        method: 'POST',
        body: JSON.stringify({ event: eventName, payload, timestamp: new Date().toISOString() }),
        keepalive: true,
      }).catch(() => {});
    }
  };
  
  return { track };
}