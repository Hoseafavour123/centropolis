// src/hooks/usePriceStream.ts

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PricePoint } from '@/types/token';
import { priceSimulator } from '@/mocks/token.mock';

const fetchPriceHistory = async (chain: string, address: string, range: string): Promise<PricePoint[]> => {
  const res = await fetch(`/api/price/${chain}/${address}?range=${range}`);
  if (!res.ok) throw new Error('Failed to fetch price history');
  return res.json();
};

export function usePriceStream(chain: string, address: string, range: string = '1d') {
  const queryClient = useQueryClient();
  const throttleRef = useRef<NodeJS.Timeout | null>(null);
  const bufferRef = useRef<PricePoint[]>([]);

  const { data: historicalData, isLoading, isError } = useQuery<PricePoint[]>({
    queryKey: ['price', chain, address, range],
    queryFn: () => fetchPriceHistory(chain, address, range),
    staleTime: 3000,
    gcTime: 30000,
    enabled: !!chain && !!address,
  });

  useEffect(() => {
    if (!chain || !address) return;

    const unsubscribe = priceSimulator.subscribe((point) => {
      bufferRef.current.push(point);
      
      if (throttleRef.current) return;
      
      throttleRef.current = setTimeout(() => {
        const newPoints = bufferRef.current;
        bufferRef.current = [];
        
        queryClient.setQueryData<PricePoint[]>(
          ['price', chain, address, range],
          (old) => {
            if (!old) return newPoints;
            // Merge and keep last 500 points for performance
            const merged = [...old, ...newPoints].slice(-500);
            return merged;
          }
        );
        
        throttleRef.current = null;
      }, 500);
    });

    return () => {
      unsubscribe();
      if (throttleRef.current) clearTimeout(throttleRef.current);
    };
  }, [chain, address, range, queryClient]);

  return { data: historicalData, isLoading, isError };
}