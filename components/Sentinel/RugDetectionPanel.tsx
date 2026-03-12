'use client';

import { RugDetectionResult } from '@/types/sentinel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RugDetectionPanelProps {
  rugDetection: RugDetectionResult;
}

const severityIcons = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
};

const statusIcons = {
  passed: CheckCircle2,
  failed: XCircle,
  unknown: AlertTriangle,
};

const statusColors = {
  passed: 'text-green-500 bg-green-500/10 border-green-500/20',
  failed: 'text-red-500 bg-red-500/10 border-red-500/20',
  unknown: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
};

const riskLevelConfig = {
  none: { color: 'green', icon: ShieldCheck, label: 'CLEAR' },
  low: { color: 'blue', icon: Shield, label: 'LOW RISK' },
  medium: { color: 'yellow', icon: ShieldAlert, label: 'MEDIUM RISK' },
  high: { color: 'orange', icon: ShieldAlert, label: 'HIGH RISK' },
  critical: { color: 'red', icon: ShieldX, label: 'CRITICAL' },
};

export function RugDetectionPanel({ rugDetection }: RugDetectionPanelProps) {
  const config = riskLevelConfig[rugDetection.riskLevel];
  const Icon = config.icon;
  
  const passedCount = rugDetection.indicators.filter(i => i.status === 'passed').length;
  const totalCount = rugDetection.indicators.length;

  return (
    <Card className={cn(
      "border-l-4",
      rugDetection.isRug ? "border-l-red-500" : "border-l-green-500"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              rugDetection.isRug ? "bg-red-500/10" : "bg-green-500/10"
            )}>
              <Icon className={cn(
                "w-6 h-6",
                rugDetection.isRug ? "text-red-500" : "text-green-500"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg">Rug Detection</CardTitle>
              <p className="text-sm text-muted-foreground">
                {passedCount}/{totalCount} security checks passed
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-sm font-bold px-3 py-1",
              config.color === 'green' && "border-green-500 text-green-500",
              config.color === 'blue' && "border-blue-500 text-blue-500",
              config.color === 'yellow' && "border-yellow-500 text-yellow-500",
              config.color === 'orange' && "border-orange-500 text-orange-500",
              config.color === 'red' && "border-red-500 text-red-500",
            )}
          >
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Confidence Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Detection Confidence</span>
            <span className="font-medium">{rugDetection.confidence}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                rugDetection.confidence >= 90 ? "bg-green-500" :
                rugDetection.confidence >= 70 ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `${rugDetection.confidence}%` }}
            />
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {rugDetection.summary}
        </p>

        {/* Indicators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {rugDetection.indicators.map((indicator) => {
            const StatusIcon = statusIcons[indicator.status];
            
            return (
              <div 
                key={indicator.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border text-sm",
                  statusColors[indicator.status]
                )}
              >
                <StatusIcon className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <div className="font-medium">{indicator.name}</div>
                  <div className="text-xs opacity-80">{indicator.description}</div>
                  {indicator.details && (
                    <div className="text-xs opacity-60">{indicator.details}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}