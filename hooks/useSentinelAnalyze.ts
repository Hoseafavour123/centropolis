'use client';

import { useState, useCallback, useRef } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  SentinelAnalyzeRequest, 
  SentinelAnalyzeStart, 
  SSEMessage, 
  SentinelResult 
} from '@/types/sentinel';
import { useAnalytics } from './useAnalytics';
import { mockSentinelResult } from '@/mocks/sentinel.mock';  // Import mock
import { send } from 'process';

const API_BASE = '/api/sentinel';

export function useSentinelAnalyze() {
  const queryClient = useQueryClient();
  const { sendAnalytics } = useAnalytics();
  const [streamingText, setStreamingText] = useState('');
  const [status, setStatus] = useState<'idle' | 'streaming' | 'ready' | 'failed'>('idle');
  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedTextRef = useRef('');  // Use ref for reliable accumulation

  const startAnalysis = useCallback(async (req: SentinelAnalyzeRequest): Promise<SentinelAnalyzeStart> => {
    sendAnalytics('sentinel_analysis_requested', { entityType: req.entityType, chain: req.chain, depth: req.depth });
    
    // Reset state
    setStreamingText('');
    accumulatedTextRef.current = '';
    setStatus('idle');

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      if (!res.ok) {
        throw new Error(`Failed to start analysis: ${res.status}`);
      }

      const data = await res.json();
      return data as SentinelAnalyzeStart;
    } catch (error) {
      setStatus('failed');
      throw error;
    }
  }, [sendAnalytics])

  const subscribeToStream = useCallback((analysisId: string, onComplete?: (result: SentinelResult) => void) => {
    setStatus('streaming');
    accumulatedTextRef.current = '';
    
    // Try SSE first
    if (typeof EventSource !== 'undefined') {
      const es = new EventSource(`${API_BASE}/stream/${analysisId}`);
      
      es.onmessage = (event) => {
        try {
          const msg: SSEMessage = JSON.parse(event.data);
          
          if (msg.type === 'chunk') {
            // Append to accumulated text
            accumulatedTextRef.current += msg.payload.text;
            setStreamingText(accumulatedTextRef.current);
            sendAnalytics('sentinel_stream_chunk', { analysisId, chunkLength: msg.payload.text.length });
          }
          
          else if (msg.type === 'meta') {
            // Store metadata if needed
            console.log('Stream metadata:', msg.payload);
          }
          
          else if (msg.type === 'done') {
            // Construct final result
            const finalResult: SentinelResult = {
              analysisId,
              summary: msg.payload.summary,
              finalScore: msg.payload.finalScore,
              safetyBand: getSafetyBand(msg.payload.finalScore),
              metrics: msg.payload.metrics,
              rugDetection: msg.payload.rugDetection, // Add this
              recommendation: msg.payload.recommendation, // Add this
              evidence: msg.payload.evidence,
              dataSources: [], // Would come from meta
              createdAt: new Date().toISOString(),
              streamingText: accumulatedTextRef.current,
            };
            
            setStatus('ready');
            queryClient.setQueryData(['sentinel', analysisId], finalResult);
            sendAnalytics('sentinel_analysis_complete', { analysisId, finalScore: finalResult.finalScore });
            
            onComplete?.(finalResult);
            es.close();
          }
          
          else if (msg.type === 'error') {
            setStatus('failed');
            es.close();
          }
        } catch (e) {
          console.error('Stream parse error:', e);
        }
      };

      es.onerror = (error) => {
        console.log('SSE error, falling back to polling:', error);
        es.close();
        // Fallback to polling
        pollForResult(
          analysisId, 
          setStatus, 
          setStreamingText, 
          accumulatedTextRef,
          queryClient, 
          sendAnalytics, 
          onComplete
        );
      };

      return () => {
        es.close();
      };
    } else {
      // No SSE support, use polling
      return pollForResult(
        analysisId, 
        setStatus, 
        setStreamingText, 
        accumulatedTextRef,
        queryClient, 
        sendAnalytics, 
        onComplete
      );
    }
  }, [queryClient, sendAnalytics]);

  const getResult = useCallback((analysisId: string) => {
    return useQuery<SentinelResult>({
      queryKey: ['sentinel', analysisId],
      enabled: !!analysisId,
      staleTime: 60 * 60 * 1000, // 1 hour
      gcTime: 2 * 60 * 60 * 1000,
    });
  }, []);

  return { 
    startAnalysis, 
    subscribeToStream, 
    getResult, 
    streamingText, 
    status,
    analysisId: null as string | null, // Expose if needed
  };
}

// Helper to determine safety band
function getSafetyBand(score: number): 'safe' | 'caution' | 'danger' {
  if (score >= 70) return 'safe';
  if (score >= 40) return 'caution';
  return 'danger';
}

// Polling fallback implementation
function pollForResult(
  analysisId: string,
  setStatus: (s: any) => void,
  setStreamingText: (t: string) => void,
  textRef: React.MutableRefObject<string>,
  queryClient: any,
  track: any,
  onComplete?: (r: SentinelResult) => void
) {
  let attempts = 0;
  const maxAttempts = 40;
  
  const interval = setInterval(async () => {
    attempts++;
    
    try {
      const res = await fetch(`/api/sentinel/result/${analysisId}`);
      
      if (res.ok) {
        const data: SentinelResult = await res.json();
        
        clearInterval(interval);
        
        // Update text if we have streaming text
        if (data.streamingText) {
          setStreamingText(data.streamingText);
        } else {
          setStreamingText(data.summary);
        }
        
        setStatus('ready');
        queryClient.setQueryData(['sentinel', analysisId], data);
        track('sentinel_analysis_complete', { 
          analysisId, 
          finalScore: data.finalScore,
          method: 'polling' 
        });
        
        onComplete?.(data);
        return;
      }
    } catch (e) {
      // Continue polling on network errors
      console.log(`Poll attempt ${attempts} failed, retrying...`);
    }
    
    if (attempts >= maxAttempts) {
      clearInterval(interval);
      setStatus('failed');
      console.error('Polling timeout after 120 seconds');
    }
  }, 3000);
  
  // Return cleanup function
  return () => clearInterval(interval);
}