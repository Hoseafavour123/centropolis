'use client';

import { useEffect, useRef, useState } from 'react';
import { PricePoint } from '@/types/token';
import { usePriceStream } from '@/hooks/usePriceStream';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PriceChartProps {
  chain: string;
  address: string;
  initialData?: PricePoint[];
  range: '1d' | '7d' | '30d' | 'all';
  onRangeChange?: (range: '1d' | '7d' | '30d' | 'all') => void;
}

// Lightweight chart implementation using canvas
export function PriceChart({ 
  chain, 
  address, 
  initialData, 
  range, 
  onRangeChange 
}: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data: priceData, isLoading } = usePriceStream(chain, address, range);
  const [hoverData, setHoverData] = useState<PricePoint | null>(null);
  const [showMA, setShowMA] = useState({ ma20: true, ma50: false });

  const data = priceData || initialData || [];

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Calculate scales
    const padding = { top: 20, right: 60, bottom: 30, left: 10 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    const prices = data.map(d => [d.open, d.high, d.low, d.close]).flat();
    const minPrice = Math.min(...prices) * 0.995;
    const maxPrice = Math.max(...prices) * 1.005;
    const priceRange = maxPrice - minPrice;

    const timeRange = data[data.length - 1].time - data[0].time;

    // Helper functions
    const x = (time: number) => padding.left + ((time - data[0].time) / timeRange) * chartWidth;
    const y = (price: number) => padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const yPos = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(padding.left + chartWidth, yPos);
      ctx.stroke();
    }

    // Draw candles
    const candleWidth = Math.max(2, (chartWidth / data.length) * 0.7);

    data.forEach((point, i) => {
      const xPos = x(point.time);
      const isGreen = point.close >= point.open;
      
      ctx.fillStyle = isGreen ? '#22c55e' : '#ef4444';
      ctx.strokeStyle = isGreen ? '#22c55e' : '#ef4444';

      // Wick
      ctx.beginPath();
      ctx.moveTo(xPos, y(point.high));
      ctx.lineTo(xPos, y(point.low));
      ctx.stroke();

      // Body
      const bodyTop = y(Math.max(point.open, point.close));
      const bodyBottom = y(Math.min(point.open, point.close));
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);
      
      ctx.fillRect(xPos - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

    // Draw price labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    for (let i = 0; i <= 4; i++) {
      const price = minPrice + (priceRange / 4) * (4 - i);
      const yPos = padding.top + (chartHeight / 4) * i;
      ctx.fillText(`$${price.toFixed(2)}`, padding.left + chartWidth + 5, yPos + 4);
    }

    // Draw hover line
    if (hoverData) {
      const hx = x(hoverData.time);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(hx, padding.top);
      ctx.lineTo(hx, padding.top + chartHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [data, hoverData]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || data.length === 0) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { left: 10, right: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    
    const ratio = (x - padding.left) / chartWidth;
    const index = Math.floor(ratio * data.length);
    const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
    
    setHoverData(data[clampedIndex]);
  };

  const handleMouseLeave = () => setHoverData(null);

  const ranges: ('1d' | '7d' | '30d' | 'all')[] = ['1d', '7d', '30d', 'all'];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {ranges.map((r) => (
              <Button
                key={r}
                variant={range === r ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onRangeChange?.(r)}
                className="text-xs"
              >
                {r === 'all' ? 'All' : r}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showMA.ma20 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMA(p => ({ ...p, ma20: !p.ma20 }))}
              className="text-xs"
            >
              MA20
            </Button>
            <Button
              variant={showMA.ma50 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMA(p => ({ ...p, ma50: !p.ma50 }))}
              className="text-xs"
            >
              MA50
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && data.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-[400px] cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              role="img"
              aria-label={`Price chart for ${address} on ${chain}. Last price $${data[data.length - 1]?.close.toFixed(2)}`}
            />
            {hoverData && (
              <div className="absolute top-4 left-4 bg-card/90 backdrop-blur border rounded-lg p-3 text-xs space-y-1 shadow-lg">
                <div className="text-muted-foreground">{new Date(hoverData.time).toLocaleString()}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-muted-foreground">Open:</span>
                  <span className="font-mono">${hoverData.open.toFixed(4)}</span>
                  <span className="text-muted-foreground">High:</span>
                  <span className="font-mono text-green-500">${hoverData.high.toFixed(4)}</span>
                  <span className="text-muted-foreground">Low:</span>
                  <span className="font-mono text-red-500">${hoverData.low.toFixed(4)}</span>
                  <span className="text-muted-foreground">Close:</span>
                  <span className="font-mono">${hoverData.close.toFixed(4)}</span>
                  <span className="text-muted-foreground">Vol:</span>
                  <span className="font-mono">{(hoverData.volume / 1e6).toFixed(2)}M</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}