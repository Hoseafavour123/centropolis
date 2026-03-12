
export type EntityType = 'token' | 'wallet' | 'tx';
export type Timeframe = '1h' | '24h' | '7d';
export type AnalysisDepth = 'quick' | 'normal' | 'deep';
export type SafetyBand = 'safe' | 'caution' | 'danger';

export interface SentinelAnalyzeRequest {
  entityType: EntityType;
  chain: string;
  address: string;
  timeframe: Timeframe;
  depth: AnalysisDepth;
  preferenceFlags?: string[];
}

export interface SentinelAnalyzeStart {
  analysisId: string;
  status: 'started' | 'queued';
}

export type SSEMessage =
  | { type: 'chunk'; payload: { text: string } }
  | { 
      type: 'meta'; 
      payload: { 
        blockHeight?: number; 
        socialScrapeAt?: string; 
        dataSources?: { source: string; timestamp: string }[] 
      } 
    }
  | { 
      type: 'done'; 
      payload: { 
        summary: string; 
        finalScore: number; 
        metrics: Record<string, any>; 
        evidence: EvidenceItem[] 
      } 
    }
  | { type: 'error'; payload: { message: string } };

export interface EvidenceItem {
  id: string;
  type: 'onchain' | 'tx' | 'social' | 'holder';
  title: string;
  timestamp: string;
  content: string;
  metadata?: any;
}

export interface SentinelResult {
  analysisId: string;
  summary: string;
  finalScore: number;
  safetyBand: SafetyBand;
  metrics: {
    liquidityDepth: number;
    topHoldersPercent: number;
    recentSmartBuys: number;
    [k: string]: any;
  };
  evidence: EvidenceItem[];
  dataSources: { source: string; timestamp: string }[];
  createdAt: string;
  streamingText?: string; // Accumulated during stream
}