'use client';

import { usePools } from '@/hooks/usePools';
import { useTrustedRoutes } from '@/hooks/useTrustedRoutes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Droplets, ExternalLink, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface PoolsTabProps {
  chain: string;
  address: string;
}

export function PoolsTab({ chain, address }: PoolsTabProps) {
  const { data: pools, isLoading } = usePools(chain, address);
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  
  const { data: routes } = useTrustedRoutes(
    chain,
    'USDC',
    'SOL',
    '1000',
    selectedPool !== null
  );

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pools?.map((pool) => (
        <Card key={pool.poolId} className="hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Droplets className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {pool.pair.tokenA}/{pool.pair.tokenB}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Fee: {(pool.feeTier || 0) * 100}%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <span>Liquidity: <span className="font-mono font-medium">${(pool.liquidityUsd / 1e6).toFixed(1)}M</span></span>
                  <span>Depth Score: <span className="font-mono font-medium">{pool.depthScore}/100</span></span>
                </div>

                <div className="flex items-center gap-2">
                  <ProviderBadge provider={pool.provider} />
                  {pool.jitoProtected && (
                    <Badge variant="outline" className="text-xs border-green-500/30 text-green-500">
                      <Shield className="w-3 h-3 mr-1" />
                      MEV Protected
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a 
                    href={`https://solscan.io/account/${pool.poolAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Pool
                  </a>
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setSelectedPool(pool.poolId)}
                  asChild
                >
                  <Link href={`/trade?chain=${chain}&from=${pool.pair.tokenB}&to=${pool.pair.tokenA}&prefillFrom=token`}>
                    <Zap className="w-4 h-4 mr-2" />
                    Trade
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProviderBadge({ provider }: { provider?: string }) {
  const colors: Record<string, string> = {
    Jupiter: 'bg-pink-500/10 text-pink-500 border-pink-500/30',
    Orca: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
    Raydium: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    Meteora: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  };

  return (
    <Badge variant="outline" className={`text-xs ${colors[provider || ''] || ''}`}>
      {provider}
    </Badge>
  );
}