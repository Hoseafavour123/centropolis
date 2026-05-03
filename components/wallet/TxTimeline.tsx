"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, ArrowDownRight, ArrowUpRight, Flame, Fingerprint, Coins } from 'lucide-react';

export default function TxTimeline({ address }: { address: string }) {
    const [txLimit, setTxLimit] = useState(50);

    const { data, isLoading, error } = useQuery({
        queryKey: ['wallet-txs', address, txLimit],
        queryFn: async () => {
            const res = await axios.get(`/api/wallet/${address}/txs?limit=${txLimit}`);
            return res.data.transactions || [];
        },
        enabled: !!address,
        staleTime: 60 * 1000, // 1 min
    });

    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 mt-6 md:mt-0">
                Failed to load transactions.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-4 mt-6 md:mt-0">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <Skeleton className="h-5 w-3/4 bg-white/10 mb-2 rounded" />
                        <Skeleton className="h-4 w-1/2 bg-white/10 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="mt-6 md:mt-0">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>

            {(!data || data.length === 0) ? (
                <div className="p-8 text-center bg-white/5 border border-white/10 rounded-2xl text-gray-400">
                    No transactions found.
                </div>
            ) : (
                <div className="relative border-l border-white/10 ml-4 space-y-6 pb-4">
                    {data.map((tx: any) => {
                        const isOutbound = tx.feePayer === address ||
                            tx.nativeTransfers?.some((nt: any) => nt.fromUserAccount === address) ||
                            tx.tokenTransfers?.some((tt: any) => tt.fromUserAccount === address);

                        // Infer tx type
                        let txTypeLabel = tx.type || 'UNKNOWN';
                        let Icon = Fingerprint;
                        let colorClass = 'text-gray-400 bg-gray-500/10 border-gray-500/20';

                        if (txTypeLabel.includes('SWAP')) {
                            Icon = ArrowRightLeft;
                            colorClass = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                        } else if (txTypeLabel === 'TRANSFER') {
                            if (isOutbound) {
                                txTypeLabel = 'SENT';
                                Icon = ArrowUpRight;
                                colorClass = 'text-red-400 bg-red-500/10 border-red-500/20';
                            } else {
                                txTypeLabel = 'RECEIVED';
                                Icon = ArrowDownRight;
                                colorClass = 'text-green-400 bg-green-500/10 border-green-500/20';
                            }
                        } else if (txTypeLabel.includes('BURN')) {
                            Icon = Flame;
                            colorClass = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
                        } else if (txTypeLabel === 'UNKNOWN') {
                            if (tx.nativeTransfers?.length > 0 || tx.tokenTransfers?.length > 0) {
                                // Has transfers but label is unknown
                                txTypeLabel = isOutbound ? 'SENT' : 'RECEIVED';
                                Icon = isOutbound ? ArrowUpRight : ArrowDownRight;
                                colorClass = isOutbound
                                    ? 'text-red-400 bg-red-500/10 border-red-500/20'
                                    : 'text-green-400 bg-green-500/10 border-green-500/20';
                            } else {
                                txTypeLabel = 'INTERACTION';
                                Icon = Coins;
                                colorClass = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
                            }
                        }

                        // Summarize amounts
                        let amountSummary = '';
                        if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
                            const mainTransfer = tx.tokenTransfers[0];
                            amountSummary = `${mainTransfer.tokenAmount} Tokens`;
                        } else if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
                            const mainTransfer = tx.nativeTransfers[0];
                            amountSummary = `${(mainTransfer.amount / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`;
                        }

                        return (
                            <div key={tx.signature} className="relative pl-6 group">
                                <div className={`absolute -left-[18px] top-1.5 w-9 h-9 rounded-full border ${colorClass} flex items-center justify-center bg-[#07050d]`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-white/10 transition-colors overflow-hidden">
                                    <div className="flex justify-between items-start mb-2 gap-2">
                                        <Badge variant="outline" className={`${colorClass} rounded-lg px-2 py-0 border font-bold text-[10px] truncate max-w-[50%]`}>
                                            {txTypeLabel.replace(/_/g, ' ')}
                                        </Badge>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            {new Date(tx.timestamp * 1000).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end mt-3 gap-2">
                                        <div className="text-sm min-w-0 flex-1">
                                            {amountSummary && (
                                                <span className="font-medium text-white block truncate" title={amountSummary}>
                                                    {isOutbound ? '-' : '+'}{amountSummary}
                                                </span>
                                            )}
                                        </div>
                                        <a href={`https://solscan.io/tx/${tx.signature}`} target="_blank" rel="noopener noreferrer"
                                            className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors whitespace-nowrap">
                                            View TX <ArrowUpRight className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {data && data.length >= txLimit && (
                <button
                    onClick={() => setTxLimit(prev => prev + 50)}
                    className="w-full mt-4 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors font-medium"
                >
                    Load More Transactions
                </button>
            )}
        </div>
    );
}
