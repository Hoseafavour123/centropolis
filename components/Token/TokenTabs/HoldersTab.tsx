'use client';

import { useHolders } from '@/hooks/useHolders';
import { Holder } from '@/types/token';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface HoldersTabProps {
  chain: string;
  address: string;
}

const labelColors: Record<string, string> = {
  dev: 'bg-purple-500/10 text-purple-500',
  exchange: 'bg-blue-500/10 text-blue-500',
  whale: 'bg-amber-500/10 text-amber-500',
  smart_money: 'bg-green-500/10 text-green-500',
  unknown: 'bg-muted text-muted-foreground',
};

export function HoldersTab({ chain, address }: HoldersTabProps) {
  const { data: holders, isLoading } = useHolders(chain, address, 50);

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top Holders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rank</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Wallet</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Label</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">%</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holders?.map((holder, index) => (
                <tr key={holder.address} className="border-b border-border/30 hover:bg-muted/50">
                  <td className="py-3 px-4 font-mono text-muted-foreground">{index + 1}</td>
                  <td className="py-3 px-4 font-mono">{holder.address}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className={labelColors[holder.label || 'unknown']}>
                      {holder.label || 'Unknown'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {(parseInt(holder.amount) / 1e9).toFixed(2)}M
                  </td>
                  <td className="py-3 px-4 text-right font-mono">{holder.percentage}%</td>
                  <td className="py-3 px-4 text-right">
                    <Link 
                      href={`/wallet/${holder.address}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}