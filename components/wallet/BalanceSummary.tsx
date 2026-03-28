"use client";

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { Cpu, Wifi } from 'lucide-react';

export default function BalanceSummary({ address }: { address: string }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['wallet-balances', address],
        queryFn: async () => {
            const res = await axios.get(`/api/wallet/${address}/balances`);
            return res.data;
        },
        enabled: !!address,
        staleTime: 30 * 1000,
    });

    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                Failed to load balances.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="p-8 border border-white/10 rounded-3xl space-y-4 aspect-[1.586/1] bg-white/5 flex flex-col justify-between">
                <Skeleton className="h-6 w-32 bg-white/10 rounded-full" />
                <Skeleton className="h-12 w-48 bg-white/10 rounded-xl mt-auto" />
                <Skeleton className="h-4 w-full bg-white/10 rounded-xl" />
            </div>
        );
    }

    const netUsd = data?.netUsd || 0;

    return (
        <div className="relative p-6 sm:p-8 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-tr from-gray-900 via-indigo-950 to-black border border-white/10 aspect-[1.586/1] flex flex-col justify-between group">
            {/* Background effects */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full mix-blend-screen transition-opacity duration-500 opacity-60 group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-blue-500/20 blur-[60px] rounded-full mix-blend-screen transition-opacity duration-500 opacity-40 group-hover:opacity-80" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>

            {/* Top row: Bank name and contactless icon */}
            <div className="relative z-10 flex justify-between items-start">
                <span className="text-white/90 font-bold tracking-[0.25em] text-xs sm:text-sm drop-shadow-sm">CENTROPOLIS</span>
                <Wifi className="w-6 h-6 text-white/60 rotate-90 opacity-80" />
            </div>

            {/* Chip */}
            <div className="relative z-10 mt-4 mb-2">
                <div className="w-12 h-9 sm:h-10 rounded-md bg-gradient-to-br from-yellow-100 via-yellow-400 to-yellow-600 opacity-90 flex items-center justify-center relative overflow-hidden shadow-inner">
                    {/* Chip lines */}
                    <div className="absolute inset-0 border border-yellow-800/40 rounded-md"></div>
                    <div className="absolute inset-x-0 top-1/2 h-px bg-yellow-800/30"></div>
                    <div className="absolute inset-y-0 left-1/3 w-px bg-yellow-800/30"></div>
                    <div className="absolute inset-y-0 right-1/3 w-px bg-yellow-800/30"></div>
                    <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-900/30 relative z-10" />
                </div>
            </div>

            {/* Balance area */}
            <div className="relative z-10 mt-auto">
                <p className="text-white/60 text-[10px] sm:text-xs tracking-widest uppercase mb-1 font-medium">Net Worth</p>
                <div className="flex items-end gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                        ${netUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-green-400 font-semibold mb-1.5 flex items-center bg-green-500/10 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs backdrop-blur-md border border-green-500/20">
                        +0.00% (24h)
                    </span>
                </div>
            </div>

            {/* Bottom row: Address and Network */}
            <div className="relative z-10 mt-6 flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="text-white/40 text-[8px] sm:text-[10px] tracking-widest uppercase mb-1">Account</span>
                    <span className="text-white/90 font-mono text-xs sm:text-sm tracking-widest drop-shadow-md">
                        {address ? `${address.slice(0, 4)} ${address.slice(4, 8)} •••• ${address.slice(-4)}` : 'UNKN OWN• •••• ••••'}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-white/40 text-[8px] sm:text-[10px] tracking-widest uppercase mb-1">Network</span>
                    <span className="text-white/90 font-bold tracking-[0.2em] text-xs sm:text-sm italic">SOL</span>
                </div>
            </div>
        </div>
    );
}
