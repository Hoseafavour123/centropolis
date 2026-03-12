
'use client';

import { Recommendation } from '@/types/sentinel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  Target,
  Clock,
  Percent,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendationPanelProps {
  recommendation: Recommendation;
  onOpenTrade: () => void;
}

const actionConfig = {
  strong_buy: { color: 'green', icon: TrendingUp, label: 'STRONG BUY', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  buy: { color: 'blue', icon: TrendingUp, label: 'BUY', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  hold: { color: 'yellow', icon: Minus, label: 'HOLD', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  avoid: { color: 'orange', icon: TrendingDown, label: 'AVOID', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  emergency_exit: { color: 'red', icon: AlertTriangle, label: 'EMERGENCY EXIT', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const timeHorizonLabels = {
  short: '1-7 days',
  medium: '1-4 weeks',
  long: '1-6 months',
};

export function RecommendationPanel({ recommendation, onOpenTrade }: RecommendationPanelProps) {
  const config = actionConfig[recommendation.action];
  const Icon = config.icon;
  
  const isPositive = ['strong_buy', 'buy'].includes(recommendation.action);
  const isDanger = ['avoid', 'emergency_exit'].includes(recommendation.action);

  return (
    <Card className={cn("border-2", config.border, config.bg)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg bg-background")}>
              <Icon className={cn("w-6 h-6", 
                config.color === 'green' && "text-green-500",
                config.color === 'blue' && "text-blue-500",
                config.color === 'yellow' && "text-yellow-500",
                config.color === 'orange' && "text-orange-500",
                config.color === 'red' && "text-red-500",
              )} />
            </div>
            <div>
              <CardTitle className="text-lg">AI Recommendation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Confidence: {recommendation.confidence}%
              </p>
            </div>
          </div>
          <Badge 
            className={cn(
              "text-sm font-bold px-4 py-1.5",
              config.color === 'green' && "bg-green-500 text-white",
              config.color === 'blue' && "bg-blue-500 text-white",
              config.color === 'yellow' && "bg-yellow-500 text-black",
              config.color === 'orange' && "bg-orange-500 text-white",
              config.color === 'red' && "bg-red-500 text-white",
            )}
          >
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Headline Summary */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-tight">
            "{recommendation.summary}"
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {recommendation.detailedAdvice}
          </p>
        </div>

        {/* Entry Strategy */}
        {recommendation.entryPoints && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="w-4 h-4 text-primary" />
              Entry Strategy
            </div>
            <div className="grid grid-cols-2 gap-3">
              {recommendation.entryPoints.conservative && (
                <div className="p-3 rounded-lg bg-background/50 border">
                  <div className="text-xs text-muted-foreground mb-1">Conservative</div>
                  <div className="text-lg font-bold font-mono">
                    ${recommendation.entryPoints.conservative.toFixed(2)}
                  </div>
                </div>
              )}
              {recommendation.entryPoints.aggressive && (
                <div className="p-3 rounded-lg bg-background/50 border">
                  <div className="text-xs text-muted-foreground mb-1">Aggressive</div>
                  <div className="text-lg font-bold font-mono">
                    ${recommendation.entryPoints.aggressive.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Risk Management */}
        <div className="grid grid-cols-2 gap-3">
          {recommendation.stopLoss !== undefined && recommendation.stopLoss > 0 && (
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-2 text-xs text-red-400 mb-1">
                <DollarSign className="w-3 h-3" /> Stop Loss
              </div>
              <div className="text-lg font-bold font-mono text-red-500">
                ${recommendation.stopLoss.toFixed(2)}
              </div>
            </div>
          )}
          
          <div className="p-3 rounded-lg bg-background/50 border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" /> Time Horizon
            </div>
            <div className="text-sm font-medium">
              {timeHorizonLabels[recommendation.timeHorizon]}
            </div>
          </div>
        </div>

        {/* Take Profit Levels */}
        {recommendation.takeProfit && recommendation.takeProfit.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Percent className="w-4 h-4 text-green-500" />
              Take Profit Targets
            </div>
            <div className="flex gap-2">
              {recommendation.takeProfit.map((tp, i) => (
                <div 
                  key={i}
                  className="flex-1 p-2 rounded-lg bg-green-500/5 border border-green-500/20 text-center"
                >
                  <div className="text-xs text-muted-foreground">TP{i + 1}</div>
                  <div className="font-bold font-mono text-green-600">
                    ${tp.toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {!isDanger && (
          <Button 
            onClick={onOpenTrade}
            className={cn(
              "w-full h-12 text-lg font-semibold",
              isPositive ? "bg-green-600 hover:bg-green-700" : "bg-primary"
            )}
          >
            Execute {config.label} Strategy
          </Button>
        )}
        
        {isDanger && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-red-500">
              Trading disabled due to critical risk assessment
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}