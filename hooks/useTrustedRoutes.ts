'use client';

import { useQuery } from '@tanstack/react-query';
import { TradeRoute } from '@/types/token';

const fetchTradeQuote = async (
  chain: string, 
  fromToken: string, 
  toToken: string, 
  amount: string
): Promise<TradeRoute[]> => {
  const res = await fetch(
    `/api/trade/quote?chain=${chain}&from=${fromToken}&to=${toToken}&amount=${amount}`
  );
  if (!res.ok) throw new Error('Failed to fetch trade quote');
  return res.json();
};

export function useTrustedRoutes(
  chain: string, 
  fromToken: string, 
  toToken: string, 
  amount: string,
  enabled: boolean = false
) {
  return useQuery<TradeRoute[]>({
    queryKey: ['tradeQuote', chain, fromToken, toToken, amount],
    queryFn: () => fetchTradeQuote(chain, fromToken, toToken, amount),
    staleTime: 10 * 1000, // 10 seconds - quotes expire quickly
    gcTime: 60 * 1000,
    enabled: enabled && !!chain && !!fromToken && !!toToken && !!amount,
  });
}