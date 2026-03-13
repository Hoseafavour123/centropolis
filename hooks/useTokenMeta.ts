'use client';

import { useQuery } from '@tanstack/react-query';
import { TokenMeta } from '@/types/token';

const fetchTokenMeta = async (chain: string, address: string): Promise<TokenMeta> => {
  const res = await fetch(`/api/token/${chain}/${address}/meta`);
  if (!res.ok) throw new Error('Failed to fetch token meta');
  return res.json();
};

export function useTokenMeta(chain: string, address: string) {
  return useQuery<TokenMeta>({
    queryKey: ['tokenMeta', chain, address],
    queryFn: () => fetchTokenMeta(chain, address),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!chain && !!address,
  });
}