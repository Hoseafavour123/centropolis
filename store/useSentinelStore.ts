import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SentinelResult } from '@/types/sentinel';

interface SentinelState {
    currentAnalysis: SentinelResult | null;
    analysisId: string | null;
    setCurrentAnalysis: (analysis: SentinelResult | null) => void;
    setAnalysisId: (id: string | null) => void;
    clearAnalysis: () => void;
}

export const useSentinelStore = create<SentinelState>()(
    persist(
        (set) => ({
            currentAnalysis: null,
            analysisId: null,
            setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
            setAnalysisId: (id) => set({ analysisId: id }),
            clearAnalysis: () => set({ currentAnalysis: null, analysisId: null }),
        }),
        {
            name: 'sentinel-storage',
        }
    )
);
