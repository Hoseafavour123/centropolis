"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { PricePoint } from "@/types/token";
import { usePriceStream } from "@/hooks/usePriceStream";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createChart, IChartApi, ISeriesApi, Time, LineStyle, CrosshairMode, CandlestickSeries, LineSeries } from "lightweight-charts";
import { useTheme } from "next-themes";

interface PriceChartProps {
  chain: string;
  address: string;
  initialData?: PricePoint[];
  range: "1d" | "7d" | "30d" | "all";
  onRangeChange?: (range: "1d" | "7d" | "30d" | "all") => void;
}

export function PriceChart({
  chain,
  address,
  initialData,
  range,
  onRangeChange,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const ma20SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma50SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const { theme } = useTheme();
  const { data: priceData, isLoading } = usePriceStream(chain, address, range);

  const [showMA, setShowMA] = useState({ ma20: false, ma50: false });
  const data = useMemo(() => priceData || initialData || [], [priceData, initialData]);

  // Init chart — runs once on mount only
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Destroy any existing chart instance before creating a new one
    // (guards against React Strict Mode double-invocation in dev)
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      ma20SeriesRef.current = null;
      ma50SeriesRef.current = null;
    }

    const isDark = theme === "dark" || document.documentElement.classList.contains("dark");
    const colors = {
      bg: "transparent",
      text: isDark ? "#A3A3A3" : "#525252",
      grid: isDark ? "#262626" : "#E5E5E5",
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: "solid", color: colors.bg } as any,
        textColor: colors.text,
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: colors.grid, style: LineStyle.SparseDotted },
        horzLines: { color: colors.grid, style: LineStyle.SparseDotted },
      },
      rightPriceScale: {
        borderVisible: false,
        autoScale: true,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      autoSize: true,
    });

    chartRef.current = chart;

    // Series
    const upColor = "#22c55e";
    const downColor = "#ef4444";
    candleSeriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      borderVisible: false,
      wickUpColor: upColor,
      wickDownColor: downColor,
    });

    ma20SeriesRef.current = chart.addSeries(LineSeries, {
      color: "#3b82f6",
      lineWidth: 2,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    ma50SeriesRef.current = chart.addSeries(LineSeries, {
      color: "#f59e0b",
      lineWidth: 2,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      ma20SeriesRef.current = null;
      ma50SeriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount only — theme changes handled separately below

  // Sync chart colors when theme changes without recreating the chart
  useEffect(() => {
    if (!chartRef.current) return;
    const isDark = theme === "dark" || document.documentElement.classList.contains("dark");
    chartRef.current.applyOptions({
      layout: {
        textColor: isDark ? "#A3A3A3" : "#525252",
      },
      grid: {
        vertLines: { color: isDark ? "#262626" : "#E5E5E5" },
        horzLines: { color: isDark ? "#262626" : "#E5E5E5" },
      },
    });
  }, [theme]);

  // Update Data
  useEffect(() => {
    if (!candleSeriesRef.current || data.length === 0) return;

    // Map to Lightweight Charts format
    const formattedData = data.map((d) => ({
      time: Math.floor(d.time / 1000) as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })).sort((a, b) => (a.time as number) - (b.time as number));

    // Remove duplicates
    const uniqueData = formattedData.filter((v, i, a) =>
      i === 0 || v.time !== a[i - 1].time
    );

    candleSeriesRef.current.setData(uniqueData);

    // Calculate MAs
    if (ma20SeriesRef.current) {
      if (showMA.ma20) {
        ma20SeriesRef.current.setData(calculateSMA(uniqueData, 20));
      } else {
        ma20SeriesRef.current.setData([]);
      }
    }

    if (ma50SeriesRef.current) {
      if (showMA.ma50) {
        ma50SeriesRef.current.setData(calculateSMA(uniqueData, 50));
      } else {
        ma50SeriesRef.current.setData([]);
      }
    }

    // Fit content after first load
    if (data.length > 0 && uniqueData.length > 0) {
      chartRef.current?.timeScale().fitContent();
    }
  }, [data, showMA]);

  const ranges: ("1d" | "7d" | "30d" | "all")[] = ["1d", "7d", "30d", "all"];

  return (
    <Card className="overflow-hidden glass-panel flex flex-col">
      <CardHeader className="pb-2 shrink-0 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            {ranges.map((r) => (
              <Button
                key={r}
                variant={range === r ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onRangeChange?.(r)}
                className={`text-xs h-7 px-3 ${range === r ? 'shadow-sm bg-background' : 'text-muted-foreground'}`}
              >
                {r === "all" ? "All" : r.toUpperCase()}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showMA.ma20 ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowMA((p) => ({ ...p, ma20: !p.ma20 }))}
              className={`text-xs h-7 border-blue-500/20 ${showMA.ma20 ? 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20' : 'text-muted-foreground hover:bg-blue-500/5 hover:text-blue-500'}`}
            >
              MA20
            </Button>
            <Button
              variant={showMA.ma50 ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowMA((p) => ({ ...p, ma50: !p.ma50 }))}
              className={`text-xs h-7 border-amber-500/20 ${showMA.ma50 ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20' : 'text-muted-foreground hover:bg-amber-500/5 hover:text-amber-500'}`}
            >
              MA50
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 grow relative min-h-[350px] h-[350px]">
        {isLoading && data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : null}

        <div
          ref={chartContainerRef}
          className="absolute inset-0 z-0"
          aria-label={`Price chart for ${address} on ${chain}. Last price $${data[data.length - 1]?.close?.toFixed(4) ?? '0'}`}
        />
      </CardContent>
    </Card>
  );
}

// Simple SMA calculator
function calculateSMA(data: { time: Time; close: number }[], period: number) {
  const result: { time: Time; value: number }[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({
      time: data[i].time,
      value: sum / period,
    });
  }
  return result;
}