"use client";

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import WatchlistCard from '@/components/watchlist/WatchlistCard';
import NotificationsFeed from '@/components/watchlist/NotificationsFeed';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function WatchlistPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['user-watchlists'],
        queryFn: async () => {
            const res = await axios.get('/api/user/watchlists');
            return res.data.watchlists || [];
        }
    });

    const [selectedList, setSelectedList] = useState<string>('all');

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col pt-24">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
                    Watchlists & Alerts
                </h1>
                <button className="hidden flex items-center gap-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                    <Plus className="w-4 h-4" /> Add Token
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">

                {/* Left Drawer (Lists) */}
                <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-24">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-2 mb-4">My Lists</h3>
                        <button
                            onClick={() => setSelectedList('all')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl transition-colors font-medium text-sm ${selectedList === 'all' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                        >
                            All Assets
                        </button>
                        <button
                            onClick={() => setSelectedList('solana')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl transition-colors font-medium text-sm flex justify-between ${selectedList === 'solana' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                        >
                            <span>Solana Ecosystem</span>
                        </button>
                    </div>

                    {/* Notifications Panel */}
                    <NotificationsFeed />
                </div>

                {/* Main Grid */}
                <div className="lg:col-span-9">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-48 w-full bg-white/5 rounded-2xl border border-white/10" />
                            ))}
                        </div>
                    ) : data?.length === 0 ? (
                        <div className="p-12 text-center bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <Plus className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Build your Watchlist</h3>
                            <p className="text-gray-400 max-w-sm mb-6">Track your favorite assets, set up custom alerts, and let Binocs monitor the markets for you.</p>
                            <button className="bg-emerald-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-emerald-400 transition">
                                Search Tokens
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data?.map((item: any) => (
                                <WatchlistCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
