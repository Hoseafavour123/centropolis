'use client';

import { useQuery } from '@tanstack/react-query';
import { Holder } from '@/types/token';

const fetchHolders = async (chain: string, address: string, limit: number = 50): Promise<Holder[]> => {
  const res = await fetch(`/api/holders/${chain}/${address}?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch holders');
  return res.json();
};

export function useHolders(chain: string, address: string, limit: number = 50) {
  return useQuery<Holder[]>({
    queryKey: ['holders', chain, address, limit],
    queryFn: () => fetchHolders(chain, address, limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!chain && !!address,
  });
}