'use client';

import { useQuery } from '@tanstack/react-query';
import { FlowEdge } from '@/types/token';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight } from 'lucide-react';

const fetchFlowData = async (chain: string, address: string): Promise<FlowEdge[]> => {
  const res = await fetch(`/api/flow/${chain}/${address}`);
  if (!res.ok) throw new Error('Failed to fetch flow data');
  return res.json();
};

interface FlowTabProps {
  chain: string;
  address: string;
}

export function FlowTab({ chain, address }: FlowTabProps) {
  const { data: edges, isLoading } = useQuery<FlowEdge[]>({
    queryKey: ['flow', chain, address],
    queryFn: () => fetchFlowData(chain, address),
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const maxAmount = Math.max(...(edges?.map(e => e.amountUsd) || [1]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Onchain Flow Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">Major value flows in last 24h</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {edges?.map((edge, index) => {
            const widthPercent = (edge.amountUsd / maxAmount) * 100;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{edge.fromLabel || edge.from}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{edge.toLabel || edge.to}</span>
                  </div>
                  <span className="font-mono">${(edge.amountUsd / 1e6).toFixed(2)}M</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {edge.count} transactions
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}