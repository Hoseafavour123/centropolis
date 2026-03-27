"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createChart, IChartApi, ISeriesApi, Time, CandlestickSeries, AreaSeries } from "lightweight-charts";
import { useTheme } from "next-themes";
import axios from "axios";

type ChartInterval = "15m" | "1H" | "4H" | "1D";

export function HeroChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Area"> | null>(null);
  const { theme } = useTheme();

  const [interval, setInterval] = useState<ChartInterval>("1H");
  const [chartType, setChartType] = useState<"candle" | "line">("candle");

  // Fetch OHLCV Data
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sol-ohlcv", interval],
    queryFn: async () => {
      // 1H is our default detailed view. We fetch the last 200 candles for a good view
      const res = await axios.get(`/api/price/sol/ohlcv?interval=${interval}&limit=200`);
      return res.data;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  // Calculate high-level stats based on current loaded data
  const latestPrice = data && data.length > 0 ? data[data.length - 1].close : 0;
  const startPrice = data && data.length > 0 ? data[0].open : 0;
  const change = startPrice > 0 ? ((latestPrice - startPrice) / startPrice) * 100 : 0;
  const isPositive = change >= 0;

  // Init chart — runs once on mount only
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Guard against React Strict Mode double-invocation
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    const isDark = theme === "dark" || document.documentElement.classList.contains("dark");
    const colors = {
      bg: "transparent",
      text: isDark ? "#A3A3A3" : "#525252",
      grid: isDark ? "#262626" : "#E5E5E5",
      up: "#22c55e",
      down: "#ef4444",
      primary: "hsl(var(--primary))",
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: "solid", color: colors.bg } as any,
        textColor: colors.text,
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: colors.grid, style: 1 },
        horzLines: { color: colors.grid, style: 1 },
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
        mode: 0, // Normal mode
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

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
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

  // Sync Data
  useEffect(() => {
    if (!chartRef.current || !data) return;

    const chart = chartRef.current;

    // Remove old series if exists
    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
    }

    const isDark = theme === "dark" || document.documentElement.classList.contains("dark");
    const colors = {
      up: "#22c55e",
      down: "#ef4444",
      areaTop: isDark ? "rgba(168, 85, 247, 0.4)" : "rgba(168, 85, 247, 0.2)", // Primary color with opacity
      areaBottom: isDark ? "rgba(168, 85, 247, 0.0)" : "rgba(168, 85, 247, 0.0)",
      line: "hsl(var(--primary))",
    };

    const formattedData = data.map((d: any) => ({
      time: d.time as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      value: d.close, // for area chart
    }));

    if (chartType === "candle") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: colors.up,
        downColor: colors.down,
        borderVisible: false,
        wickUpColor: colors.up,
        wickDownColor: colors.down,
      });
      series.setData(formattedData);
      seriesRef.current = series;
    } else {
      const series = chart.addSeries(AreaSeries, {
        lineColor: colors.line,
        topColor: colors.areaTop,
        bottomColor: colors.areaBottom,
        lineWidth: 2,
      });
      series.setData(formattedData);
      seriesRef.current = series;
    }

    chart.timeScale().fitContent();

  }, [data, chartType, theme]);

  return (
    <Card className="col-span-2 glass-panel overflow-hidden h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">SOL / USDC</h2>
            {!isError && data && (
              <Badge
                variant={isPositive ? "default" : "destructive"}
                className="font-mono"
              >
                {interval} {isPositive ? "+" : ""}
                {change.toFixed(2)}%
              </Badge>
            )}
            {isLoading && !data && (
              <Badge variant="outline" className="animate-pulse">Loading...</Badge>
            )}
            {isError && (
              <Badge variant="destructive">Data Error</Badge>
            )}
          </div>
          <p className="text-3xl font-bold mt-1">
            ${latestPrice > 0 ? latestPrice.toFixed(2) : "—"}
          </p>
        </div>

        <div className="flex flex-col gap-2 items-end">
          {/* Chart Type Toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={chartType === "candle" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setChartType("candle")}
            >
              Candle
            </Button>
            <Button
              variant={chartType === "line" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setChartType("line")}
            >
              Line
            </Button>
          </div>

          {/* Timeframe Toggle */}
          <div className="flex gap-1">
            {(["15m", "1H", "4H", "1D"] as ChartInterval[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setInterval(tf)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${interval === tf
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 grow min-h-[300px] relative">
        <div ref={chartContainerRef} className="absolute inset-0" />
      </CardContent>
    </Card>
  );
}
