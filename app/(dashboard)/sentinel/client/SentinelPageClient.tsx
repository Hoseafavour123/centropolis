// /app/sentinel/client/SentinelPageClient.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { SentinelQueryBar } from '@/components/Sentinel/SentinelQueryBar';
import { SentinelPanel } from '@/components/Sentinel/SentinelPanel';
import { ActionsPanel } from '@/components/Sentinel/ActionsPanel';
import { SentinelChatPanel } from '@/components/SentinelChat/SentinelChatPanel';
import { useSentinelAnalyze } from '@/hooks/useSentinelAnalyze';
import { SentinelAnalyzeRequest } from '@/types/sentinel';
import { useGlobalStore } from '@/lib/store/globalStore';
import { toast } from 'sonner';
import { useSentinelStore } from '@/store/useSentinelStore';
import { Activity, Bot } from 'lucide-react';
import { useTradeTokenStore } from '@/store/useTradeTokenStore';
import { cn } from '@/lib/utils';

type ActiveView = 'analyze' | 'chat';

export function SentinelPageClient() {
  const [activeView, setActiveView] = useState<ActiveView>('analyze');
  const { selectedChain } = useGlobalStore();
  const { startAnalysis, subscribeToStream, streamingText, status } = useSentinelAnalyze();
  const { currentAnalysis, setCurrentAnalysis, setAnalysisId } = useSentinelStore();

  // ── Read URL params for auto-trigger ─────────────────────────────────────
  const searchParams = useSearchParams();
  const autoTriggered = useRef(false);

  const handleAnalyze = async (req: SentinelAnalyzeRequest) => {
    try {
      const { analysisId: id } = await startAnalysis(req);
      setAnalysisId(id);
      setCurrentAnalysis(null);

      subscribeToStream(id, (result) => {
        setCurrentAnalysis(result);
        if (result.tokenAddress) {
          useTradeTokenStore.getState().setSelectedToken({
            symbol: result.tokenSymbol || 'TKN',
            name: result.tokenName || 'Analyzed Token',
            mint: result.tokenAddress,
          });
        }
      });
    } catch {
      toast.error('Could not start analysis. Please try again.');
    }
  };

  // Auto-trigger when arriving from a token detail page
  useEffect(() => {
    if (autoTriggered.current) return;

    const tokenAddress = searchParams.get('token');
    const chain = searchParams.get('chain');

    if (tokenAddress && chain) {
      autoTriggered.current = true;
      // Switch to analyze view in case user had chat open
      setActiveView('analyze');

      const req: SentinelAnalyzeRequest = {
        entityType: 'token',
        chain,
        address: tokenAddress,
        timeframe: '24h',
        depth: 'normal',
      };

      // Small delay so the page renders first, then auto-fires
      const timer = setTimeout(() => {
        handleAnalyze(req);
        toast.info(`Auto-analyzing ${tokenAddress.slice(0, 6)}…${tokenAddress.slice(-4)}`, {
          description: 'Triggered from token detail page',
          duration: 3000,
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleOpenTrade = () => {
    if (!currentAnalysis) return;
    const { tokenAddress, tokenSymbol, tokenName } = currentAnalysis;
    if (!tokenAddress) {
      toast.error('No token address available to trade.');
      return;
    }

    const chain = (searchParams.get('chain') || selectedChain || 'solana').toLowerCase();

    // Seed the trade panel immediately with what we know.
    useTradeTokenStore.getState().setSelectedToken({
      symbol: tokenSymbol || 'TKN',
      name: tokenName || 'Analyzed Token',
      mint: tokenAddress,
    });
    toast.success('Token preloaded in Quick Trade panel!');

    // Enrich with logo + price from the meta endpoint in the background so
    // the avatar fills in shortly after.
    fetch(`/api/token/${chain}/${tokenAddress}/meta`)
      .then((res) => (res.ok ? res.json() : null))
      .then((meta) => {
        if (!meta) return;
        useTradeTokenStore.getState().setSelectedToken({
          symbol: meta.symbol || tokenSymbol || 'TKN',
          name: meta.name || tokenName || 'Analyzed Token',
          mint: tokenAddress,
          logoUrl: meta.logoUrl,
          priceUsd: meta.priceUsd,
        });
      })
      .catch(() => {
        // non-fatal — panel still usable without logo
      });

    // On smaller viewports the right panel sits below the analyze view.
    // Bring it into view so the user sees the preload happen.
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      setTimeout(() => {
        document
          .querySelector('[data-right-panel]')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Toggle Buttons */}
      <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
        <button
          onClick={() => setActiveView('analyze')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
            activeView === 'analyze'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          )}
        >
          <Activity className="w-4 h-4" />
          Analyze
        </button>
        <button
          onClick={() => setActiveView('chat')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
            activeView === 'chat'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          )}
        >
          <Bot className="w-4 h-4" />
          Chat
        </button>
      </div>

      {/* Analyze View */}
      {activeView === 'analyze' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column – Query Bar */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <SentinelQueryBar
              defaultChain={searchParams.get('chain') || selectedChain}
              defaultAddress={searchParams.get('token') || undefined}
              onAnalyze={handleAnalyze}
              isLoading={status === 'streaming'}
            />
            {/* Actions panel below query bar on all breakpoints */}
            {currentAnalysis && (
              <ActionsPanel
                analysis={currentAnalysis}
                onOpenTrade={handleOpenTrade}
                onSave={(id) => console.log('Save', id)}
              />
            )}
          </div>

          {/* Right Column – Analysis Results (wider) */}
          <div className="lg:col-span-8 xl:col-span-9">
            <SentinelPanel
              analysis={currentAnalysis}
              streamingText={streamingText}
              status={status}
              onOpenTrade={handleOpenTrade}
              onSaveReport={(id) => console.log('Save', id)}
              onExplain={() => console.log('Explain')}
            />
          </div>
        </div>
      )}

      {/* Chat View – full width */}
      {activeView === 'chat' && (
        <div className="w-full">
          <SentinelChatPanel />
        </div>
      )}
    </div>
  );
}