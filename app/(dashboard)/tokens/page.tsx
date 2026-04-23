"use client"

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, RefreshCw, ExternalLink } from "lucide-react";
import { Token } from "@/lib/types";
import { TokenAvatar } from "@/components/Shared/TokenAvatar";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCompact(n: number): string {
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
}

function formatPrice(price: number): string {
    if (price < 0.000001) return `$${price.toExponential(2)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
}

// ─── Row Skeleton ────────────────────────────────────────────────────────────

function RowSkeleton() {
    return (
        <div className="flex items-center gap-4 px-4 py-3 animate-pulse">
            <div className="w-4 h-3 bg-muted rounded" />
            <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-muted rounded w-32" />
                <div className="h-2 bg-muted rounded w-16" />
            </div>
            <div className="h-3 bg-muted rounded w-20" />
            <div className="h-3 bg-muted rounded w-16" />
            <div className="h-3 bg-muted rounded w-24 hidden md:block" />
            <div className="h-3 bg-muted rounded w-24 hidden lg:block" />
        </div>
    );
}

// ─── Token Row ────────────────────────────────────────────────────────────────

function TokenRow({ token, rank }: { token: Token; rank: number }) {
    const isPositive = token.change24h >= 0;
    const dexUrl = `https://dexscreener.com/solana/${token.id}`;

    return (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border/40 hover:bg-muted/30 transition-colors group">
            {/* Rank */}
            <span className="text-xs text-muted-foreground w-5 text-right shrink-0 font-mono">
                {rank}
            </span>

            {/* Avatar */}
            <TokenAvatar logoUrl={token.logoUrl} symbol={token.symbol} size="sm" />

            {/* Name + Symbol */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{token.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{token.symbol}</p>
            </div>

            {/* Price */}
            <div className="text-right shrink-0 w-24">
                <p className="text-sm font-mono font-medium">{formatPrice(token.price)}</p>
            </div>

            {/* 24h Change */}
            <div className="shrink-0 w-20 text-right">
                <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                        }`}
                >
                    {isPositive ? "+" : ""}
                    {token.change24h.toFixed(2)}%
                </span>
            </div>

            {/* Volume */}
            <div className="text-right shrink-0 w-28 hidden md:block">
                <p className="text-xs font-mono text-muted-foreground">
                    {formatCompact(token.volume24h)}
                </p>
                <p className="text-[10px] text-muted-foreground/60">Vol 24h</p>
            </div>

            {/* Safety Score */}
            <div className="shrink-0 w-28 hidden lg:block">
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${token.safetyScore}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground w-10">
                        {token.safetyScore}/100
                    </span>
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">Safety</p>
            </div>

            {/* External link */}
            <a
                href={dexUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary shrink-0"
                title="View on DexScreener"
                aria-label={`View ${token.name} on DexScreener`}
            >
                <ExternalLink size={14} />
            </a>
        </div>
    );
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TokensPage() {
    const router = useRouter();

    const { data: tokens, isLoading, isError, refetch, isFetching } = useQuery<Token[]>({
        queryKey: ["trending", 50],
        queryFn: async () => {
            const res = await fetch("/api/dashboard/trending?limit=50");
            if (!res.ok) return [];
            return res.json();
        },
        staleTime: 60_000,
    });

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary" />
                            <h1 className="text-xl font-bold">Trending Solana Tokens</h1>
                        </div>
                    </div>
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
                        {isFetching ? "Refreshing…" : "Refresh"}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Stats bar */}
                {!isLoading && tokens && tokens.length > 0 && (
                    <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
                        <span>
                            <span className="text-foreground font-medium">{tokens.length}</span> tokens
                        </span>
                        <span>
                            <span className="text-green-400 font-medium">
                                {tokens.filter((t) => t.change24h >= 0).length}
                            </span>{" "}
                            gainers
                        </span>
                        <span>
                            <span className="text-red-400 font-medium">
                                {tokens.filter((t) => t.change24h < 0).length}
                            </span>{" "}
                            losers
                        </span>
                    </div>
                )}

                {/* Table */}
                <div className="rounded-xl border border-border overflow-hidden glass-panel">
                    {/* Table header */}
                    <div className="flex items-center gap-4 px-4 py-2.5 bg-muted/40 border-b border-border text-xs text-muted-foreground font-medium">
                        <span className="w-5 text-right">#</span>
                        <span className="w-9 shrink-0" />
                        <span className="flex-1">Token</span>
                        <span className="w-24 text-right">Price</span>
                        <span className="w-20 text-right">24h</span>
                        <span className="w-28 text-right hidden md:block">Volume</span>
                        <span className="w-28 hidden lg:block">Safety</span>
                        <span className="w-4" />
                    </div>

                    {/* Rows */}
                    {isLoading ? (
                        Array.from({ length: 12 }).map((_, i) => <RowSkeleton key={i} />)
                    ) : isError || !tokens?.length ? (
                        <div className="py-16 text-center text-muted-foreground">
                            <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Could not load trending tokens.</p>
                            <button
                                onClick={() => refetch()}
                                className="mt-3 text-xs text-primary hover:underline"
                            >
                                Try again
                            </button>
                        </div>
                    ) : (
                        tokens.map((token, i) => (
                            <TokenRow key={token.id} token={token} rank={i + 1} />
                        ))
                    )}
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                    Data sourced from DexScreener · Updates every 60s
                </p>
            </div>
        </main>
    );
}
