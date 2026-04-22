"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, ShieldAlert, TrendingUp, AlertTriangle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import AlertModal from './AlertModal';
import { toast } from 'sonner';

export default function WatchlistCard({ item }: { item: any }) {
    const queryClient = useQueryClient();
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: tokenData, isLoading } = useQuery({
        queryKey: ['token-data', item.address],
        queryFn: async () => {
            const res = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${item.address}`);
            const pairs = res.data.pairs || [];
            return pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
        },
        staleTime: 60 * 1000,
    });

    const activeAlerts: any[] = item.alerts?.filter((a: any) => a.status === 'ACTIVE') || [];
    const hasAlerts = activeAlerts.length > 0;

    const handleDeleteAlert = async (alertId: string) => {
        setDeletingId(alertId);
        try {
            await axios.delete(`/api/alerts/${alertId}/cancel`);
            toast.success('Alert removed');
            queryClient.invalidateQueries({ queryKey: ['user-watchlists'] });
        } catch (e: any) {
            toast.error(e?.response?.data?.error || 'Failed to remove alert');
        } finally {
            setDeletingId(null);
        }
    };

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
            <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                {/* Main Card */}
                <div className="p-5 bg-white/5 hover:bg-white/[0.07] transition-colors group cursor-pointer relative flex flex-col justify-between h-48">
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
                            title="Create alert"
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
                            <button
                                onClick={() => setShowAlerts((v) => !v)}
                                className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider hover:bg-orange-500/20 transition-colors"
                            >
                                <AlertTriangle className="w-3 h-3" />
                                {activeAlerts.length} Active
                                {showAlerts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Alerts Drawer */}
                {hasAlerts && showAlerts && (
                    <div className="bg-black/40 border-t border-white/10 px-4 py-3 space-y-2">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Active Alerts</p>
                        {activeAlerts.map((alert: any) => (
                            <div
                                key={alert.id}
                                className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 border border-white/5"
                            >
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-semibold text-white truncate">{alert.type.replace(/_/g, ' ')}</span>
                                    {alert.thresholdValue != null && (
                                        <span className="text-[10px] text-gray-400">
                                            Threshold: ${parseFloat(alert.thresholdValue).toFixed(6)}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDeleteAlert(alert.id)}
                                    disabled={deletingId === alert.id}
                                    aria-label="Delete alert"
                                    className="ml-3 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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
