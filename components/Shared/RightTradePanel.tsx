'use client';

import { useState } from 'react';
import { TradeRoute } from '@/types/token';
import { useTrustedRoutes } from '@/hooks/useTrustedRoutes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrustedRouteBadge } from "@/components/Token/TokenTabs/TrustedRouteBadge"
import { ArrowDown, Loader2, Settings, Info } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RightTradePanelProps {
  chain: string;
  fromToken?: string;
  toToken?: string;
  amountUsd?: string;
}

export function RightTradePanel({ 
  chain, 
  fromToken = 'USDC', 
  toToken = 'SOL',
  amountUsd = '1000'
}: RightTradePanelProps) {
  const [from, setFrom] = useState(fromToken);
  const [to, setTo] = useState(toToken);
  const [amount, setAmount] = useState(amountUsd);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  const { data: routes, isLoading } = useTrustedRoutes(
    chain,
    from,
    to,
    amount,
    isQuoteOpen
  );

  const bestRoute = routes?.[0];

  return (
    <div className="hidden space-y-4">
      {/* Main Trade Card */}
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
          {/* From Token */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">From</Label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                  {from[0]}
                </div>
                <span className="font-semibold">{from}</span>
              </div>
              <Input 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-24 text-right bg-transparent border-0 font-mono"
              />
            </div>
            <div className="text-xs text-muted-foreground text-right">
              Balance: ~1,365.50 USDC
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center -my-2 relative z-10">
            <button 
              onClick={() => { setFrom(to); setTo(from); }}
              className="p-2 rounded-full bg-card border border-border shadow-lg hover:bg-muted transition-colors"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">To</Label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                  {to[0]}
                </div>
                <span className="font-semibold">{to}</span>
              </div>
              <span className="font-mono text-muted-foreground">
                {bestRoute ? `~${parseFloat(bestRoute.expectedOutput).toFixed(3)}` : '—'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground text-right">
              Balance: ~32 SOL
            </div>
          </div>

          {/* Route Info */}
          {bestRoute && (
            <div className="p-3 rounded-lg bg-muted/30 space-y-2">
              <TrustedRouteBadge route={bestRoute} showDetails />
            </div>
          )}

          {/* Platform Fee */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              Platform Fee: 0.15%
              <Info className="w-3 h-3" />
            </span>
            <span>~${(parseFloat(amount) * 0.0015).toFixed(2)}</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              className="w-full h-12 text-lg font-semibold"
              onClick={() => setIsQuoteOpen(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Get Quote'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              asChild
            >
              <Link href={`/trade?chain=${chain}&from=${from}&to=${to}&amount=${amount}&prefillFrom=token`}>
                Advanced Trade
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Trade Options */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Route Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {routes?.slice(0, 3).map((route, i) => (
            <div 
              key={route.routeId}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-colors",
                i === 0 ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30"
              )}
            >
              <div className="flex items-center justify-between">
                <TrustedRouteBadge route={route} />
                <span className="font-mono text-sm">
                  {parseFloat(route.expectedOutput).toFixed(4)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                via {route.steps.map(s => s.dex).join(' → ')}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}