"use client";

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { X, ExternalLink, Download, FileText, AlertOctagon } from 'lucide-react';
import { exportToCsv } from '@/lib/utils/csvExport';
import { useState } from 'react';

export default function OrderDetail({ order, onClose }: any) {
    const [disputeReason, setDisputeReason] = useState('');
    const [isDisputing, setIsDisputing] = useState(false);
    const [disputeSubmitted, setDisputeSubmitted] = useState(false);

    // Live status fetch if needed
    const { data: liveStatus } = useQuery({
        queryKey: ['trade-status', order?.txHash],
        queryFn: async () => {
            const res = await axios.get(`/api/trade/status/${order.txHash}`);
            return res.data;
        },
        enabled: !!order?.txHash,
        refetchInterval: order?.status === 'PENDING' ? 5000 : false
    });

    if (!order) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 h-full flex items-center justify-center text-gray-500 text-sm text-center">
                Select an order from the list<br />to view receipt and details.
            </div>
        );
    }

    const handleDownloadReceipt = () => {
        fetch('/api/telemetry', {
            method: 'POST',
            body: JSON.stringify({ event: 'receipt_downloaded', payload: { type: 'single_receipt', txId: order.txHash || order.id } })
        }).catch(console.error);

        exportToCsv(`receipt-${order.id}.csv`, [{
            ReceiptID: order.id,
            Date: new Date(order.createdAt).toISOString(),
            Type: order.type,
            Status: order.status,
            Hash: order.txHash || 'N/A',
            From: `${order.fromAmount || ''} ${order.fromToken || ''}`,
            To: `${order.toAmount || ''} ${order.toToken || ''}`,
            ValueUSD: order.usdValue || 0,
            Chain: order.chain
        }]);
    };

    const handleDispute = async () => {
        if (!disputeReason.trim()) return;
        setIsDisputing(true);
        try {
            await axios.post(`/api/trade/dispute/${order.txHash || order.id}`, { reason: disputeReason });
            setDisputeSubmitted(true);
        } catch (e) {
            console.error('Failed to dispute', e);
        } finally {
            setIsDisputing(false);
        }
    };

    const displayStatus = liveStatus?.onChainStatus || order.status;

    return (
        <div className="bg-[#0f0b1a] border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
            </button>

            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" /> Order Receipt
                </h2>
                <p className="text-xs font-mono text-gray-500 mt-2 truncate pr-8">ID: {order.id}</p>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {/* Status Box */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${displayStatus === 'SUCCESS' ? 'bg-emerald-500/10 border-emerald-500/20' : displayStatus === 'FAILED' ? 'bg-red-500/10 border-red-500/20' : displayStatus === 'REFUNDED' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Status</p>
                        <p className={`font-bold ${displayStatus === 'SUCCESS' ? 'text-emerald-400' : displayStatus === 'FAILED' ? 'text-red-400' : displayStatus === 'REFUNDED' ? 'text-purple-400' : 'text-yellow-400'}`}>{displayStatus}</p>
                    </div>
                    {order.txHash && (
                        <a href={`https://solscan.io/tx/${order.txHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors">
                            Block Explorer <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Type</p>
                        <p className="text-sm font-medium text-white">{order.type}</p>
                    </div>
                    <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Date</p>
                        <p className="text-sm font-medium text-white">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="bg-black/30 p-4 rounded-2xl border border-white/5 col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Trade Route</p>
                        <div className="flex items-center gap-2 mt-1">
                            {order.fromAmount && <span className="text-white font-bold">{order.fromAmount} {order.fromToken}</span>}
                            <span className="text-gray-500">→</span>
                            {order.toAmount && <span className="text-white font-bold">{order.toAmount} {order.toToken}</span>}
                        </div>
                    </div>
                    <div className="bg-black/30 p-4 rounded-2xl border border-white/5 col-span-2 flex justify-between items-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Net Value</p>
                        <p className="text-lg font-black text-emerald-400">${order.usdValue?.toFixed(2) || '0.00'}</p>
                    </div>
                </div>

                {/* Logs / Errors */}
                {order.errorLogs && (
                    <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-2 flex items-center gap-1"><AlertOctagon className="w-3 h-3" /> Error Logs</p>
                        <p className="text-xs font-mono text-red-400/80 max-h-24 overflow-y-auto whitespace-pre-wrap">{order.errorLogs}</p>
                    </div>
                )}

                {/* Dispute Section */}
                {(displayStatus === 'FAILED' || displayStatus === 'REFUNDED') && !disputeSubmitted && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <h3 className="text-sm font-bold text-white mb-3">Request Support / Dispute</h3>
                        <textarea
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 resize-none h-20 mb-3"
                            placeholder="Describe the issue with this transaction..."
                        />
                        <button
                            onClick={handleDispute}
                            disabled={isDisputing || !disputeReason.trim()}
                            className="w-full bg-purple-500/20 text-purple-400 font-bold py-2.5 rounded-xl border border-purple-500/30 hover:bg-purple-500/30 transition-colors disabled:opacity-50 text-sm"
                        >
                            {isDisputing ? 'Submitting...' : 'Submit Dispute'}
                        </button>
                    </div>
                )}

                {disputeSubmitted && (
                    <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                        <p className="text-emerald-400 text-sm font-bold">Dispute Submitted</p>
                        <p className="text-gray-400 text-xs mt-1">Our support team will review this transaction shortly.</p>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-white/5 bg-black/20">
                <button
                    onClick={handleDownloadReceipt}
                    className="w-full flex justify-center items-center gap-2 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors text-sm"
                >
                    <Download className="w-4 h-4" /> Download PDF / CSV Receipt
                </button>
            </div>
        </div>
    );
}
