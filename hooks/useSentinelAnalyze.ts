'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  SentinelAnalyzeRequest, 
  SentinelAnalyzeStart, 
  SSEMessage, 
  SentinelResult 
} from '@/types/sentinel';
import { useAnalytics } from './useAnalytics';
import { mockSentinelResult } from '@/mocks/sentinel.mock';

const API_BASE = '/api/sentinel';

export function useSentinelAnalyze() {
  const queryClient = useQueryClient();
  const { track } = useAnalytics();
  const [streamingText, setStreamingText] = useState('');
  const [status, setStatus] = useState<'idle' | 'streaming' | 'ready' | 'failed'>('idle');
  const abortControllerRef = useRef<AbortController | null>(null);

  const startAnalysis = useCallback(async (req: SentinelAnalyzeRequest): Promise<SentinelAnalyzeStart> => {
    track('sentinel_analysis_requested', { entityType: req.entityType, chain: req.chain, depth: req.depth });
    setStreamingText('');
    setStatus('idle');

    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!res.ok) throw new Error('Failed to start analysis');
    return res.json();
  }, [track]);

  const subscribeToStream = useCallback((analysisId: string, onComplete?: (result: SentinelResult) => void) => {
    setStatus('streaming');
    let accumulatedText = '';
    
    // Try SSE first
    if (typeof EventSource !== 'undefined') {
      const es = new EventSource(`${API_BASE}/stream/${analysisId}`);
      
      es.onmessage = (event) => {
        try {
          const msg: SSEMessage = JSON.parse(event.data);
          handleStreamMessage(msg, accumulatedText, setStreamingText, (text) => { accumulatedText = text; });
          
          if (msg.type === 'done') {
            const finalResult: SentinelResult = {
              ...mockSentinelResult, // In real app, construct from msg.payload
              analysisId,
              streamingText: accumulatedText,
            };
            setStatus('ready');
            queryClient.setQueryData(['sentinel', analysisId], finalResult);
            track('sentinel_analysis_complete', { analysisId, finalScore: finalResult.finalScore });
            onComplete?.(finalResult);
            es.close();
          }
          
          if (msg.type === 'error') {
            setStatus('failed');
            es.close();
          }
        } catch (e) {
          console.error('Stream parse error', e);
        }
      };

      es.onerror = () => {
        // Fallback to polling
        es.close();
        pollForResult(analysisId, setStatus, setStreamingText, queryClient, track, onComplete);
      };

      return () => es.close();
    } else {
      // No SSE support, go straight to polling
      return pollForResult(analysisId, setStatus, setStreamingText, queryClient, track, onComplete);
    }
  }, [queryClient, track]);

  const getResult = useCallback((analysisId: string) => {
    return useQuery<SentinelResult>({
      queryKey: ['sentinel', analysisId],
      enabled: !!analysisId,
      staleTime: 60 * 60 * 1000, // 1 hour
      gcTime: 2 * 60 * 60 * 1000,
    });
  }, []);

  return { startAnalysis, subscribeToStream, getResult, streamingText, status };
}

// Helper to handle individual messages
function handleStreamMessage(
  msg: SSEMessage, 
  accumulated: string, 
  setText: (t: string) => void,
  setAccumulated: (t: string) => void
) {
  if (msg.type === 'chunk') {
    const newText = accumulated + msg.payload.text;
    setAccumulated(newText);
    setText(newText);
  }
}

// Polling Fallback
function pollForResult(
  analysisId: string,
  setStatus: (s: any) => void,
  setStreamingText: (t: string) => void,
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
        setStatus('ready');
        setStreamingText(data.summary);
        queryClient.setQueryData(['sentinel', analysisId], data);
        track('sentinel_analysis_complete', { analysisId, finalScore: data.finalScore, method: 'polling' });
        onComplete?.(data);
      }
    } catch (e) {
      // Continue polling
    }
    
    if (attempts >= maxAttempts) {
      clearInterval(interval);
      setStatus('failed');
    }
  }, 3000);
  
  return () => clearInterval(interval);
}