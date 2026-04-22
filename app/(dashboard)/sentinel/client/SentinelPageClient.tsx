// /app/sentinel/client/SentinelPageClient.tsx
'use client';

import { useState } from 'react';
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

  const handleOpenTrade = () => {
    if (!currentAnalysis) return;
    if (currentAnalysis.tokenAddress) {
      useTradeTokenStore.getState().setSelectedToken({
        symbol: currentAnalysis.tokenSymbol || 'TKN',
        name: currentAnalysis.tokenName || 'Analyzed Token',
        mint: currentAnalysis.tokenAddress,
      });
      toast.success('Token preloaded in Quick Trade panel!');
    } else {
      toast.error('No token address available to trade.');
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
              defaultChain={selectedChain}
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