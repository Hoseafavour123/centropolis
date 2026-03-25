"use client"

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Token } from "@/lib/types";
import { Info } from "lucide-react";
import { useTradeTokenStore } from "@/store/useTradeTokenStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function symbolColor(symbol: string): string {
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
    "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
  ];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

// ─── Safety Score Tooltip ─────────────────────────────────────────────────────

function SafetyTooltip() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
        aria-label="How is Safety Score calculated?"
      >
        <Info size={14} />
      </button>

      {open && (
        <div className="absolute left-6 top-0 z-50 w-64 rounded-xl border border-border bg-card shadow-xl p-4 text-xs space-y-2">
          <p className="font-semibold text-foreground">How Safety Score is calculated</p>
          <p className="text-muted-foreground leading-relaxed">
            A quick heuristic (0–100) based on three on-chain signals:
          </p>
          <ul className="text-muted-foreground space-y-1 list-none">
            <li className="flex gap-2">
              <span className="text-green-400 font-bold">+20</span>
              <span>24h trading volume above $1M (high market interest)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-400 font-bold">+10</span>
              <span>Price trending upward (positive 24h change)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-400 font-bold">-20</span>
              <span>Liquidity below $50K (thin pools = higher slippage risk)</span>
            </li>
          </ul>
          <p className="text-muted-foreground/60 italic">
            Starts at 50 · Range: 0–100 · Not financial advice.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Token Card ───────────────────────────────────────────────────────────────

function TokenCard({ token, isSelected, onClick }: {
  token: Token;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isPositive = token.change24h >= 0;
  const bg = symbolColor(token.symbol);
  const initials = token.symbol.slice(0, 3).toUpperCase();

  return (
    <Card
      onClick={onClick}
      className={`glass-panel transition-all cursor-pointer group ${isSelected
          ? "border-primary ring-1 ring-primary/50 shadow-lg shadow-primary/10"
          : "hover:border-primary/50"
        }`}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar with initials */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 transition-transform group-hover:scale-110"
              style={{ background: bg }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold truncate leading-tight">{token.name}</h4>
              <p className="text-xs text-muted-foreground font-mono">{token.symbol}</p>
            </div>
          </div>
          <div
            className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ml-2 ${isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
              }`}
          >
            {isPositive ? "+" : ""}
            {token.change24h.toFixed(2)}%
          </div>
        </div>

        {/* Price + Volume */}
        <div className="mt-3">
          <p className="text-sm font-semibold font-mono">
            ${token.price.toFixed(token.price < 0.01 ? 6 : token.price < 1 ? 4 : 2)}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Vol {formatCompact(token.volume24h)}
          </p>
        </div>

        {/* Safety Score bar */}
        <div className="mt-3 h-1 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${token.safetyScore}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">Safety Score</span>
          <span className="text-[10px] font-mono">{token.safetyScore}/100</span>
        </div>

        {/* Click hint */}
        {isSelected ? (
          <p className="text-[10px] text-primary font-medium mt-2 text-center">
            ✓ Selected in Quick Trade
          </p>
        ) : (
          <p className="text-[10px] text-muted-foreground/0 group-hover:text-muted-foreground/70 mt-2 text-center transition-colors">
            Click to trade
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <Card className="glass-panel">
      <CardContent className="p-4 space-y-3 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-muted rounded w-3/4" />
            <div className="h-2 bg-muted rounded w-1/2" />
          </div>
        </div>
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-1 bg-muted rounded" />
      </CardContent>
    </Card>
  );
}

// ─── TrendingGrid ─────────────────────────────────────────────────────────────

export function TrendingGrid() {
  const router = useRouter();
  const { selectedToken, setSelectedToken } = useTradeTokenStore();

  const { data: tokens, isLoading, isError } = useQuery<Token[]>({
    queryKey: ["trending", 8],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/trending?limit=8");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30_000,
  });

  function handleTokenClick(token: Token) {
    // If already selected, deselect (reset to default SOL/USDC)
    if (selectedToken?.symbol === token.symbol) {
      setSelectedToken(null);
    } else {
      setSelectedToken({
        symbol: token.symbol,
        name: token.name,
        priceUsd: token.price,
        // pairAddress used as id — not a mint; QuickTrade will show symbol only
        mint: token.id,
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Trending Tokens</h3>
          <SafetyTooltip />
        </div>
        <button
          onClick={() => router.push("/tokens")}
          className="text-xs text-primary hover:underline hover:opacity-80 transition-opacity"
        >
          View All →
        </button>
      </div>

      {/* Active selection hint */}
      {selectedToken && (
        <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
          <p className="text-xs text-primary font-medium">
            Quick Trade set to <span className="font-bold">{selectedToken.name} ({selectedToken.symbol})</span>
          </p>
          <button
            onClick={() => setSelectedToken(null)}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Reset to SOL/USDC
          </button>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : isError || !tokens?.length ? (
        <div className="text-sm text-muted-foreground py-8 text-center">
          Unable to load trending tokens. Try refreshing.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tokens.map((token) => (
            <TokenCard
              key={token.id}
              token={token}
              isSelected={selectedToken?.symbol === token.symbol}
              onClick={() => handleTokenClick(token)}
            />
          ))}
        </div>
      )}
    </div>
  );
}