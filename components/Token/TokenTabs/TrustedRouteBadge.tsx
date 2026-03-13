'use client';

import { TradeRoute } from '@/types/token';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Zap, Lock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustedRouteBadgeProps {
  route: TradeRoute;
  showDetails?: boolean;
}

export function TrustedRouteBadge({ route, showDetails = false }: TrustedRouteBadgeProps) {
  const isBestRoute = route.provider === 'Jupiter';
  
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Provider Badge */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                "cursor-help",
                route.provider === 'Jupiter' && "bg-pink-500/10 text-pink-500 border-pink-500/30",
                route.provider === 'Orca' && "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
                route.provider === 'Raydium' && "bg-blue-500/10 text-blue-500 border-blue-500/30",
              )}
            >
              <Zap className="w-3 h-3 mr-1" />
              {route.provider}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Route provided by {route.provider}</p>
            <p className="text-xs text-muted-foreground">Estimated time: {route.estimatedTimeMs}ms</p>
          </TooltipContent>
        </Tooltip>

        {/* MEV Protection Badge */}
        {route.jitoProtected && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className="bg-green-500/10 text-green-500 border-green-500/30 cursor-help"
              >
                <Lock className="w-3 h-3 mr-1" />
                Jito
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs font-medium">MEV Protection via Jito</p>
              <p className="text-xs text-muted-foreground max-w-[200px]">
                Your transaction is protected against sandwich attacks and frontrunning through Jito's MEV-aware block building.
              </p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Best Route Indicator */}
        {isBestRoute && (
          <Badge className="bg-primary text-primary-foreground">
            Best Price
          </Badge>
        )}

        {/* Detailed Info */}
        {showDetails && (
          <div className="ml-auto text-xs text-muted-foreground space-y-1">
            <div>Slippage: {route.slippage}%</div>
            <div>Price Impact: {route.priceImpact}%</div>
            <div className="flex items-center gap-1">
              Platform Fee: {route.platformFee}%
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Centropolis platform fee: 0.15%</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}