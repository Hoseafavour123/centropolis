'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowDown, Loader2, Settings, Info, ShieldCheck,
  AlertTriangle, ShieldAlert, RefreshCw, Clock, Zap,
  ChevronDown, ChevronUp, CheckCircle2, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useWalletData } from '@/hooks/useWalletData';
import { useTrade } from '@/hooks/useTrade';
import { useWalletStore } from '@/store/useWalletStore';

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFW36DP7mVQC7i57K6BgnUpWMT8Dz6enwbp9z96Utm";

// Quote expires after 30 seconds (Jupiter quotes are short-lived)
const QUOTE_TTL_SECONDS = 30;

interface RightTradePanelProps {
  chain: string;
  fromToken?: string;
  toToken?: string;
  toAddress?: string;
  amountUsd?: string;
}

export function RightTradePanel({
  chain,
  fromToken = 'SOL',
  toToken = 'BONK',
  toAddress,
  amountUsd = '0.0'
}: RightTradePanelProps) {
  // Helper to format long addresses into 4-letter symbols
  // Helper to format symbols robustly
  const formatSymbol = (sym?: string) => {
    if (!sym) return 'TKN';
    if (sym === 'Unknown Token') return 'TKN';
    return sym.length > 16 ? sym.slice(0, 4).toUpperCase() : sym;
  };

  const [from, setFrom] = useState(fromToken);
  const [to, setTo] = useState(toAddress || toToken);

  const [toSymbol, setToSymbol] = useState(formatSymbol(toToken));
  const [fromSymbol, setFromSymbol] = useState(formatSymbol(fromToken));

  const [amount, setAmount] = useState(amountUsd);
  const [showDetails, setShowDetails] = useState(true);

  // Quote expiry countdown
  const [quoteAge, setQuoteAge] = useState(0);
  const [quoteTimestamp, setQuoteTimestamp] = useState<number | null>(null);

  const { balance: solBalance, tokens } = useWalletData();
  const { isConnected } = useWalletStore();
  const { tradeState, quote, error, fetchQuote, executeSwap, resetTrade } = useTrade();

  const usdcBalance = useMemo(() => {
    if (!tokens) return 0;
    const token = tokens.find((t: any) => t.id === USDC_MINT);
    if (!token?.token_info) return 0;
    return token.token_info.balance / Math.pow(10, token.token_info.decimals);
  }, [tokens]);

  // Sync state with props when they change (important for global selector)
  useEffect(() => {
    setFrom(fromToken);
    setFromSymbol(formatSymbol(fromToken));
  }, [fromToken]);

  useEffect(() => {
    const target = toAddress || toToken;
    setTo(target);
    setToSymbol(formatSymbol(toToken));
    // Reset quote if target changes
    resetTrade();
  }, [toToken, toAddress, resetTrade]);

  const fromMint = useMemo(() => from === 'SOL' ? SOL_MINT : from === 'USDC' ? USDC_MINT : from, [from]);
  const toMint = useMemo(() => to === 'SOL' ? SOL_MINT : to === 'USDC' ? USDC_MINT : to, [to]);

  const isLoading = tradeState === 'quoting';
  const isSwapping = tradeState === 'swapping';
  const hasQuote = tradeState === 'quoted' && !!quote;
  const isUnsafe = !!(quote && (quote.safetyBand === "danger" || quote.liquidityScore < 20));
  const quoteExpired = quoteAge >= QUOTE_TTL_SECONDS;

  const fromBalance = from === 'USDC' ? usdcBalance : from === 'SOL' ? (solBalance || 0) : 0;
  const isOverBalance = fromBalance > 0 && parseFloat(amount || "0") > fromBalance;

  // Tick the quote age counter every second
  useEffect(() => {
    if (!quoteTimestamp) { setQuoteAge(0); return; }
    const interval = setInterval(() => {
      const age = Math.floor((Date.now() - quoteTimestamp) / 1000);
      setQuoteAge(age);
    }, 1000);
    return () => clearInterval(interval);
  }, [quoteTimestamp]);

  const handleGetQuote = useCallback(() => {
    setQuoteAge(0);
    setQuoteTimestamp(null);
    fetchQuote(fromMint, toMint, amount).then(() => {
      setQuoteTimestamp(Date.now());
    });
  }, [fetchQuote, fromMint, toMint, amount]);

  const handleRefreshQuote = useCallback(() => {
    handleGetQuote();
  }, [handleGetQuote]);

  // Parsed output amount with correct decimals
  const outDecimals = to === "USDC" ? 6 : 9;
  const outAmountRaw = quote ? parseInt(quote.outAmount) / Math.pow(10, outDecimals) : 0;
  const inAmountRaw = parseFloat(amount || "0");

  const toAmountFormatted = useMemo(() => {
    if (isLoading) return null;
    if (!quote) return null;
    return isNaN(outAmountRaw) ? null : outAmountRaw.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: outDecimals === 6 ? 4 : 6
    });
  }, [quote, isLoading, outAmountRaw, outDecimals]);

  // Rate: X toToken per 1 fromToken
  const exchangeRate = useMemo(() => {
    if (!outAmountRaw || !inAmountRaw) return null;
    const rate = outAmountRaw / inAmountRaw;
    return rate > 1000
      ? rate.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : rate.toLocaleString(undefined, { maximumFractionDigits: 6 });
  }, [outAmountRaw, inAmountRaw]);

  // Minimum received (accounting for 0.5% slippage = 50bps default)
  const minReceived = useMemo(() => {
    if (!outAmountRaw) return null;
    const slippageFactor = 1 - (quote?.route?.slippageBps ?? 50) / 10000;
    return (outAmountRaw * slippageFactor).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }, [outAmountRaw, quote]);

  // Route steps from Jupiter's routePlan
  const routeSteps: { label: string; percent: number }[] = useMemo(() => {
    if (!quote?.route?.routePlan) return [];
    return quote.route.routePlan.map((step: any) => ({
      label: step.swapInfo?.label || step.swapInfo?.ammKey?.slice(0, 6) || 'DEX',
      percent: Math.round(step.percent || 100),
    }));
  }, [quote]);

  // Safety color helpers
  const safetyColor = {
    safe: 'text-green-500',
    caution: 'text-yellow-500',
    danger: 'text-red-500',
  }[quote?.safetyBand ?? 'caution'];

  const mevColor = {
    low: 'text-green-500',
    medium: 'text-yellow-500',
    high: 'text-red-500',
  }[quote?.mevRisk ?? 'medium'];

  const timeLeft = Math.max(0, QUOTE_TTL_SECONDS - quoteAge);
  const timerPct = (timeLeft / QUOTE_TTL_SECONDS) * 100;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Quick Trade</CardTitle>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          <Badge variant="secondary" className="w-fit">
            Trusted Routes: <span className="text-primary ml-1">Jupiter</span>
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {tradeState === 'success' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Swap confirmed on-chain!
            </div>
          )}

          {/* FROM */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">From</Label>
            <div className={cn(
              "flex items-center justify-between p-3 rounded-xl bg-muted/50 border transition-colors",
              isOverBalance ? "border-red-500/50" : "border-border"
            )}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                  {fromSymbol[0]}
                </div>
                <span className="font-semibold">{fromSymbol}</span>
              </div>
              <Input
                value={amount}
                onChange={(e) => { setAmount(e.target.value); }}
                className="w-28 text-right bg-transparent border-0 font-mono text-lg p-0 h-auto focus-visible:ring-0"
                placeholder="0.00"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span className={isOverBalance ? 'text-red-400 font-medium' : ''}>
                {isOverBalance ? 'Insufficient balance' : ''}
              </span>
              <button
                className="hover:text-foreground transition-colors"
                onClick={() => setAmount(fromBalance.toFixed(4))}
              >
                Balance: {from === 'USDC' || fromSymbol === 'USDC'
                  ? `~${usdcBalance.toLocaleString()} USDC`
                  : from === 'SOL' || fromSymbol === 'SOL'
                    ? `~${solBalance?.toFixed(4) || '0'} SOL`
                    : '—'}
              </button>
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center -my-1 relative z-10">
            <button
              onClick={() => {
                setFrom(to);
                setTo(from);
                setFromSymbol(toSymbol);
                setToSymbol(fromSymbol);
              }}
              className="p-2 rounded-full bg-card border border-border shadow-lg hover:bg-muted hover:rotate-180 transition-all duration-300"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* TO */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">To (estimated)</Label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                  {toSymbol[0]}
                </div>
                <span className="font-semibold">{toSymbol}</span>
              </div>
              {isLoading ? (
                <div className="flex items-center gap-1.5 text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm animate-pulse">Routing…</span>
                </div>
              ) : toAmountFormatted ? (
                <span className="font-mono text-lg font-semibold text-foreground">
                  ~{toAmountFormatted}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground text-right px-1">
              Balance: {to === 'USDC'
                ? `~${usdcBalance.toLocaleString()} USDC`
                : to === 'SOL'
                  ? `~${solBalance?.toFixed(4) || '0'} SOL`
                  : '—'}
            </div>
          </div>

          {/* ── QUOTE RESULTS PANEL ── */}
          {hasQuote && !quoteExpired && (
            <div className="rounded-xl border border-border/60 overflow-hidden bg-muted/20">

              {/* Quote timer bar */}
              <div className="relative h-1 bg-muted">
                <div
                  className={cn(
                    "absolute left-0 top-0 h-1 transition-all duration-1000",
                    timeLeft > 15 ? "bg-green-500" : timeLeft > 5 ? "bg-yellow-500" : "bg-red-500"
                  )}
                  style={{ width: `${timerPct}%` }}
                />
              </div>

              {/* Rate row + expiry */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span>
                    1 {from} = <span className="text-foreground font-mono font-medium">
                      {exchangeRate} {toSymbol}
                    </span>
                  </span>
                </div>
                <button
                  onClick={handleRefreshQuote}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Clock className={cn("w-3 h-3", timeLeft <= 5 && "text-red-400 animate-pulse")} />
                  <span className={cn(timeLeft <= 5 && "text-red-400")}>{timeLeft}s</span>
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              {/* Collapsible details */}
              <div className="px-3 py-2">
                <button
                  onClick={() => setShowDetails(v => !v)}
                  className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="font-medium">Quote Details</span>
                  {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showDetails && (
                  <div className="mt-2 space-y-1.5 text-xs">
                    {/* Core swap details */}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price Impact</span>
                      <span className={cn(
                        "font-mono font-medium",
                        quote.priceImpact > 5 ? "text-red-400" :
                          quote.priceImpact > 1 ? "text-yellow-400" : "text-foreground"
                      )}>
                        {quote.priceImpact < 0.01 ? '<0.01' : quote.priceImpact.toFixed(2)}%
                        {quote.priceImpact > 3 && <span className="ml-1 text-red-400">⚠</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min. Received</span>
                      <span className="font-mono text-foreground">{minReceived} {toSymbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Slippage Tolerance</span>
                      <span className="font-mono text-foreground">
                        {((quote.route?.slippageBps ?? 50) / 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Fee (15%)</span>
                      <span className="font-mono text-foreground">
                        {(inAmountRaw * 0.15).toFixed(4)} {from}
                      </span>
                    </div>

                    {/* Route steps */}
                    {routeSteps.length > 0 && (
                      <>
                        <Separator className="my-1 opacity-40" />
                        <div className="flex justify-between items-start">
                          <span className="text-muted-foreground">Route</span>
                          <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                            {routeSteps.map((step, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-[10px] h-4 px-1.5 font-mono"
                              >
                                {step.label}
                                {routeSteps.length > 1 && ` ${step.percent}%`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Sentinel Intelligence */}
                    <Separator className="my-1 opacity-40" />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        {quote.safetyBand === 'safe'
                          ? <ShieldCheck className="w-3 h-3 text-green-500" />
                          : quote.safetyBand === 'caution'
                            ? <AlertTriangle className="w-3 h-3 text-yellow-500" />
                            : <ShieldAlert className="w-3 h-3 text-red-500" />}
                        Sentinel Score
                      </span>
                      <span className={cn("font-mono font-bold", safetyColor)}>
                        {quote.sentinelScore}/100
                        <span className="font-normal ml-1 capitalize">({quote.safetyBand})</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Liquidity Score</span>
                      <span className={cn(
                        "font-mono",
                        quote.liquidityScore > 60 ? "text-green-500" :
                          quote.liquidityScore > 30 ? "text-yellow-400" : "text-red-400"
                      )}>
                        {quote.liquidityScore}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MEV Risk</span>
                      <span className={cn("font-mono capitalize font-medium", mevColor)}>
                        {quote.mevRisk}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Danger alert */}
              {isUnsafe && (
                <div className="flex items-start gap-2 mx-3 mb-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>High-risk token detected. Swap is blocked to protect your funds.</span>
                </div>
              )}
            </div>
          )}

          {/* Expired quote notice */}
          {hasQuote && quoteExpired && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Quote expired
              </div>
              <button onClick={handleRefreshQuote} className="flex items-center gap-1 underline underline-offset-2 hover:text-yellow-300">
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
          )}

          {/* Platform Fee line (pre-quote) */}
          {!hasQuote && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                Platform Fee: 15%
                <Info className="w-3 h-3" />
              </span>
              <span>~{(parseFloat(amount || "0") * 0.15).toFixed(4)} {from}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {!hasQuote || quoteExpired ? (
              <Button
                className="w-full h-11 text-base font-semibold"
                onClick={handleGetQuote}
                disabled={isLoading || !amount || parseFloat(amount) <= 0}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Finding best route…
                  </span>
                ) : quoteExpired ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh Quote
                  </span>
                ) : (
                  'Get Quote'
                )}
              </Button>
            ) : (
              <Button
                className={cn(
                  "w-full h-11 text-base font-semibold transition-all",
                  isUnsafe
                    ? "bg-red-500 hover:bg-red-600 ring-1 ring-red-500/50"
                    : "bg-primary hover:bg-primary/90"
                )}
                onClick={() => executeSwap()}
                disabled={
                  !isConnected ||
                  isOverBalance ||
                  isSwapping ||
                  isUnsafe
                }
              >
                {isSwapping ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing & Swapping…
                  </span>
                ) : isOverBalance ? (
                  "Insufficient Balance"
                ) : isUnsafe ? (
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    Swap Blocked (High Risk)
                  </span>
                ) : !isConnected ? (
                  "Connect Wallet to Swap"
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Swap {fromSymbol} → {toSymbol}
                  </span>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}