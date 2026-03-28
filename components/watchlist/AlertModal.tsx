"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import axios from 'axios';
import { BellRing, TrendingUp, TrendingDown, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    tokenSymbol: string;
    currentPrice: number;
}

export default function AlertModal({ isOpen, onClose, item, tokenSymbol, currentPrice }: AlertModalProps) {
    const [alertType, setAlertType] = useState('PRICE_ABOVE');
    const [targetPrice, setTargetPrice] = useState(currentPrice.toString());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await axios.post(`/api/watchlist/${item.id}/alerts`, {
                type: alertType,
                thresholdValue: parseFloat(targetPrice)
            }, {
                timeout: 5000 // 5s timeout to prevent hanging UI
            });

            onClose();
            // In a real app we'd dispatch a toast or invalidate the query to re-fetch alerts
            window.location.reload(); // Simple refresh to show new alert in feed
        } catch (error: any) {
            console.error('Failed to create alert', error);
            // Alert user of failure
            const message = error.code === 'ECONNABORTED'
                ? 'Request timed out. Please check your connection.'
                : 'Failed to create schedule. Is the database/redis online?';

            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[#0f0b1a] border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <BellRing className="w-5 h-5 text-emerald-400" /> Create Alert: {tokenSymbol}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Set conditions to receive notifications when this asset moves.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-300">Alert Type</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setAlertType('PRICE_ABOVE')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${alertType === 'PRICE_ABOVE' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                            >
                                <TrendingUp className="w-5 h-5" />
                                <span className="text-xs font-bold">Price Goes Above</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAlertType('PRICE_BELOW')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${alertType === 'PRICE_BELOW' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                            >
                                <TrendingDown className="w-5 h-5" />
                                <span className="text-xs font-bold">Price Drops Below</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAlertType('VOLUME_SPIKE')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${alertType === 'VOLUME_SPIKE' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                            >
                                <TrendingUp className="w-5 h-5" />
                                <span className="text-xs font-bold">Volume Spike (24h)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAlertType('AI_RISK_HIGH')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${alertType === 'AI_RISK_HIGH' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                            >
                                <ShieldAlert className="w-5 h-5" />
                                <span className="text-xs font-bold">Sentinel AI Risk</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-300 flex justify-between">
                            Target Threshold (USD)
                            <span className="text-gray-500">Current: ${currentPrice}</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                            <input
                                type="number"
                                step="any"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white font-mono focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-emerald-500 text-black font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Scheduling...' : 'Create Alert'}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
