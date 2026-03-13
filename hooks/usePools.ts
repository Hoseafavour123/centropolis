'use client';

import { useQuery } from '@tanstack/react-query';
import { PoolInfo } from '@/types/token';

const fetchPools = async (chain: string, address: string): Promise<PoolInfo[]> => {
  const res = await fetch(`/api/liquidity/${chain}/${address}/pools`);
  if (!res.ok) throw new Error('Failed to fetch pools');
  return res.json();
};

export function usePools(chain: string, address: string) {
  return useQuery<PoolInfo[]>({
    queryKey: ['pools', chain, address],
    queryFn: () => fetchPools(chain, address),
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    enabled: !!chain && !!address,
  });
}