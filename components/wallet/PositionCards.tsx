"use client";

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

export default function PositionCards({ address }: { address: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ['wallet-balances', address],
        queryFn: async () => {
            const res = await axios.get(`/api/wallet/${address}/balances`);
            return res.data;
        },
        enabled: !!address,
        staleTime: 30 * 1000,
    });

    if (isLoading) {
        return (
            <div className="space-y-4 mt-6">
                <h3 className="text-xl font-bold text-white mb-4">Assets</h3>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-full bg-white/10" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-24 bg-white/10 rounded-md" />
                            <Skeleton className="h-4 w-16 bg-white/10 rounded-md" />
                        </div>
                        <div className="space-y-2 text-right">
                            <Skeleton className="h-5 w-20 bg-white/10 rounded-md" />
                            <Skeleton className="h-4 w-16 bg-white/10 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const solBalance = data?.solBalance || 0;
    const solPrice = data?.solPriceUsd || 0;
    const tokens = data?.tokens || [];

    const hasSol = solBalance > 0;

    // Fallback images
    const getImageUrl = (image?: string) => {
        if (!image) return 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
        return image;
    };

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Assets</h3>
            <div className="space-y-3">
                {hasSol && (
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 p-1">
                                <img src={getImageUrl()} alt="SOL" className="w-full h-full rounded-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold group-hover:text-purple-400 transition-colors">Solana</h4>
                                <p className="text-gray-400 text-sm">SOL</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-bold">${(solBalance * solPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="text-gray-400 text-sm">{solBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL</p>
                        </div>
                    </div>
                )}

                {tokens.map((token: any) => (
                    <div key={token.mint} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                                {token.image ? (
                                    <img src={token.image} alt={token.symbol} className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-purple-500/20 text-purple-200 font-bold text-xs">
                                        {token.symbol.slice(0, 2)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-white font-bold group-hover:text-purple-400 transition-colors">{token.name}</h4>
                                <p className="text-gray-400 text-sm">{token.symbol}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-bold">${token.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="text-gray-400 text-sm">{token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {token.symbol}</p>
                        </div>
                    </div>
                ))}

                {!hasSol && tokens.length === 0 && (
                    <div className="p-8 text-center bg-white/5 border border-white/10 rounded-2xl text-gray-400">
                        No assets found for this wallet.
                    </div>
                )}
            </div>
        </div>
    );
}
