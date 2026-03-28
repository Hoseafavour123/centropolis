"use client";

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BellRing, CheckCircle2, Clock } from 'lucide-react';

export default function NotificationsFeed() {
    const { data: alerts, isLoading } = useQuery({
        queryKey: ['active-alerts'],
        queryFn: async () => {
            const res = await axios.get('/api/alerts/active');
            return res.data.alerts || [];
        },
        refetchInterval: 10000 // Poll every 10s for updates
    });

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-2 mb-4 flex items-center gap-2">
                <BellRing className="w-4 h-4" /> Activity Feed
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="text-center text-gray-500 text-sm py-4">Loading alerts...</div>
                ) : alerts?.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-4 bg-white/5 rounded-xl">No recent alerts.</div>
                ) : (
                    alerts?.map((alert: any) => (
                        <div key={alert.id} className={`p-3 rounded-xl border ${alert.status === 'TRIGGERED' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-white/10'}`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-white flex items-center gap-1">
                                    {alert.status === 'TRIGGERED' ? <BellRing className="w-3 h-3 text-orange-400" /> : <Clock className="w-3 h-3 text-emerald-400" />}
                                    {alert.type.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                    {new Date(alert.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-300">
                                {alert.status === 'TRIGGERED'
                                    ? `Threshold crossed for ${alert.watchlist?.address.slice(0, 4)}... `
                                    : `Monitoring for ${alert.watchlist?.address.slice(0, 4)}...`}
                            </p>
                            <span className="text-xs font-mono text-gray-400 mt-2 block">
                                Target: {alert.thresholdValue}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
