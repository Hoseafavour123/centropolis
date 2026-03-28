"use client";

import { CheckCircle2, XCircle, Clock, ArrowRightLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderList({
    trades,
    isLoading,
    selectedChain,
    setSelectedChain,
    selectedStatus,
    setSelectedStatus,
    onSelectOrder,
    selectedOrderId
}: any) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full bg-white/5 border border-white/10 rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-full flex flex-col">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
                    {['all', 'solana', 'ethereum'].map(chain => (
                        <button
                            key={chain}
                            onClick={() => setSelectedChain(chain)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${selectedChain === chain ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            {chain}
                        </button>
                    ))}
                </div>
                <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
                    {['all', 'SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${selectedStatus === status ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            {status.toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {!trades?.length ? (
                    <div className="text-center py-12 text-gray-500">
                        No orders found for the selected filters.
                    </div>
                ) : (
                    trades.map((trade: any) => (
                        <div
                            key={trade.id}
                            onClick={() => onSelectOrder(trade)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group ${selectedOrderId === trade.id ? 'bg-white/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-[#0f0b1a] border-white/5 hover:border-white/20'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trade.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : trade.status === 'FAILED' ? 'bg-red-500/10 text-red-400' : trade.status === 'REFUNDED' ? 'bg-purple-500/10 text-purple-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                    {trade.status === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> :
                                        trade.status === 'FAILED' ? <XCircle className="w-5 h-5" /> :
                                            trade.status === 'REFUNDED' ? <ArrowRightLeft className="w-5 h-5" /> :
                                                <Clock className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white uppercase flex items-center gap-2">
                                        {trade.type}
                                        {trade.fromToken && trade.toToken && (
                                            <span className="text-gray-400 text-sm font-normal normal-case">
                                                {trade.fromToken} → {trade.toToken}
                                            </span>
                                        )}
                                    </h4>
                                    <p className="text-xs text-gray-500">{new Date(trade.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                {trade.usdValue ? (
                                    <div className="font-bold text-white">${trade.usdValue.toFixed(2)}</div>
                                ) : (
                                    <div className="font-bold text-white">{trade.toAmount ? `${trade.toAmount} ${trade.toToken}` : '—'}</div>
                                )}
                                <div className={`text-[10px] font-bold tracking-widest uppercase mt-1 ${trade.status === 'SUCCESS' ? 'text-emerald-500' : trade.status === 'FAILED' ? 'text-red-500' : trade.status === 'REFUNDED' ? 'text-purple-500' : 'text-yellow-500'}`}>
                                    {trade.status}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
