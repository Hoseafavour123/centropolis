// /app/sentinel/client/SentinelPageClient.tsx
'use client';

import { useRouter } from 'next/navigation';
import { SentinelQueryBar } from '@/components/Sentinel/SentinelQueryBar';
import { SentinelPanel } from '@/components/Sentinel/SentinelPanel';
import { ActionsPanel } from '@/components/Sentinel/ActionsPanel';
import { useSentinelAnalyze } from '@/hooks/useSentinelAnalyze';
import { SentinelAnalyzeRequest, SentinelResult } from '@/types/sentinel';
import { useGlobalStore } from '@/lib/store/globalStore';
import { toast } from 'sonner';
import { useSentinelStore } from '@/store/useSentinelStore';

export function SentinelPageClient() {
  const router = useRouter();
  const { selectedChain } = useGlobalStore();
  const { startAnalysis, subscribeToStream, streamingText, status } = useSentinelAnalyze();
  const { currentAnalysis, analysisId, setCurrentAnalysis, setAnalysisId } = useSentinelStore();

  const handleAnalyze = async (req: SentinelAnalyzeRequest) => {
    try {
      const { analysisId: id } = await startAnalysis(req);
      setAnalysisId(id);
      setCurrentAnalysis(null);

      // Start streaming
      const cleanup = subscribeToStream(id, (result) => {
        setCurrentAnalysis(result);
      });

      // Cleanup on unmount handled by hook
    } catch (error) {
      toast.error("Could not start analysis. Please try again.");
    }
  };

  const handleOpenTrade = () => {
    if (!currentAnalysis) return;
    const params = new URLSearchParams({
      chain: selectedChain,
      from: 'USDC',
      to: 'SOL', // Would derive from analysis
      prefill: 'sentinel',
    });
    router.push(`/trade?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left Column - Query */}
      <div className="xl:col-span-3 space-y-6">
        <SentinelQueryBar
          defaultChain={selectedChain}
          onAnalyze={handleAnalyze}
          isLoading={status === 'streaming'}
        />
      </div>

      {/* Main Column - Analysis */}
      <div className="xl:col-span-6">
        <SentinelPanel
          analysis={currentAnalysis}
          streamingText={streamingText}
          status={status}
          onOpenTrade={handleOpenTrade}
          onSaveReport={(id) => console.log('Save', id)}
          onExplain={() => console.log('Explain')}
        />
      </div>

      {/* Right Column - Actions */}
      <div className="xl:col-span-3">
        <div className="sticky top-24">
          {currentAnalysis && (
            <ActionsPanel
              analysis={currentAnalysis}
              onOpenTrade={handleOpenTrade}
              onSave={(id) => console.log('Save', id)}
            />
          )}
        </div>
      </div>
    </div>
  );
}