"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Fetches the live SOL/USD price from the backend (/api/price/sol),
 * which proxies CoinGecko with server-side caching.
 *
 * Re-fetches every 60 seconds.
 */
export function useSolPrice() {
    const { data, isLoading, isError } = useQuery<number | null>({
        queryKey: ["sol-price"],
        queryFn: async () => {
            const res = await fetch("/api/price/sol");
            if (!res.ok) throw new Error("Failed to fetch SOL price");
            const json = await res.json();
            return json.price as number;
        },
        staleTime: 60_000,          // treat data as fresh for 60s
        refetchInterval: 60_000,    // re-fetch every 60s in the background
        retry: 2,
        initialData: undefined,
    });

    return { solPrice: data ?? null, isLoading, isError };
}
