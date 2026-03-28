"use client";

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, ShieldAlert, TrendingUp, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import AlertModal from './AlertModal';

export default function WatchlistCard({ item }: { item: any }) {
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

    const { data: tokenData, isLoading } = useQuery({
        queryKey: ['token-data', item.address],
        queryFn: async () => {
            const res = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${item.address}`);
            const pairs = res.data.pairs || [];
            return pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
        },
        staleTime: 60 * 1000,
    });

    const activeAlerts = item.alerts?.filter((a: any) => a.status === 'ACTIVE') || [];
    const hasAlerts = activeAlerts.length > 0;

    if (isLoading) {
        return <Skeleton className="h-48 w-full bg-white/5 rounded-2xl border border-white/10" />;
    }

    if (!tokenData) {
        return (
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between h-48 opacity-50">
                <p className="text-gray-400 text-sm break-all">Unknown Token: {item.address}</p>
            </div>
        );
    }

    const priceUsd = parseFloat(tokenData.priceUsd);
    const change24h = tokenData.priceChange?.h24 || 0;
    const isPositive = change24h >= 0;

    return (
        <>
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group cursor-pointer relative overflow-hidden flex flex-col justify-between h-48 shadow-lg">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                            {tokenData.info?.imageUrl ? (
                                <img src={tokenData.info.imageUrl} alt={tokenData.baseToken.symbol} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-emerald-500/20 text-emerald-300">
                                    {tokenData.baseToken.symbol.slice(0, 2)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg leading-tight">{tokenData.baseToken.symbol}</h3>
                            <p className="text-xs text-gray-400">{tokenData.baseToken.name}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsAlertModalOpen(true)}
                        className={`p-2 rounded-full transition-colors ${hasAlerts ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    >
                        <Bell className="w-4 h-4" />
                    </button>
                </div>

                <div className="mt-4">
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-white">${priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                    </div>
                    <div className={`text-sm font-medium mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
                        <TrendingUp className={`w-3 h-3 ${!isPositive && 'rotate-180'}`} />
                        {isPositive ? '+' : ''}{change24h}%
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                        <ShieldAlert className="w-3 h-3" /> Safe
                    </div>
                    {hasAlerts && (
                        <div className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                            <AlertTriangle className="w-3 h-3" /> {activeAlerts.length} Active
                        </div>
                    )}
                </div>
            </div>

            <AlertModal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
                item={item}
                tokenSymbol={tokenData.baseToken.symbol}
                currentPrice={priceUsd}
            />
        </>
    );
}
