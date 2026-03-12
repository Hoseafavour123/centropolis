export type EntityType = 'token' | 'wallet' | 'tx';
export type Timeframe = '1h' | '24h' | '7d';
export type AnalysisDepth = 'quick' | 'normal' | 'deep';
export type SafetyBand = 'safe' | 'caution' | 'danger';
export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface SentinelMetrics {
  liquidityDepth: number;
  topHoldersPercent: number;
  recentSmartBuys: number;
  volatilityIndex: number;
  [k: string]: any;
}


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

export interface RugDetectionResult {
  isRug: boolean;
  confidence: number; // 0-100
  riskLevel: RiskLevel;
  indicators: RugIndicator[];
  summary: string;
}

export interface RugIndicator {
  id: string;
  name: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'passed' | 'failed' | 'unknown';
  details?: string;
}

export interface Recommendation {
  action: 'strong_buy' | 'buy' | 'hold' | 'avoid' | 'emergency_exit';
  summary: string; // One sentence headline
  detailedAdvice: string; // Paragraph explanation
  entryPoints?: {
    conservative?: number;
    aggressive?: number;
  };
  stopLoss?: number;
  takeProfit?: number[];
  timeHorizon: 'short' | 'medium' | 'long';
  confidence: number; // 0-100
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
        metrics: SentinelMetrics;
        evidence: EvidenceItem[];
        rugDetection: RugDetectionResult;
        recommendation: Recommendation;
      } 
    }
  | { type: 'error'; payload: { message: string } };

export interface EvidenceItem {
  id: string;
  type: 'onchain' | 'tx' | 'social' | 'holder' | 'rug';
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
  metrics: SentinelMetrics;
  rugDetection: RugDetectionResult;
  recommendation: Recommendation;
  evidence: EvidenceItem[];
  dataSources: { source: string; timestamp: string }[];
  createdAt: string;
  streamingText?: string;
}