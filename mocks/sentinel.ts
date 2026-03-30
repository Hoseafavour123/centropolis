import { SentinelResult } from '@/types/sentinel';

export const mockSentinelResult: SentinelResult = {
    analysisId: 'mock-123',
    summary: 'Solana (SOL) shows strong network health with high liquidity and positive smart money flow. Security audit reveals no critical vulnerabilities.',
    finalScore: 85,
    safetyBand: 'safe',
    metrics: {
        liquidityDepth: 314000000,
        topHoldersPercent: 15.4,
        recentSmartBuys: 1240,
        volatilityIndex: 12.5,
    },
    rugDetection: {
        isRug: false,
        confidence: 98,
        riskLevel: 'low',
        summary: 'Contract is verified and liquidity is locked. No malicious patterns detected.',
        indicators: [
            { id: '1', name: 'Contract Verified', description: 'Source code is public and matches bytecode.', severity: 'info', status: 'passed' },
            { id: '2', name: 'Liquidity Locked', description: 'LP tokens are burned or locked in a verifiable vault.', severity: 'info', status: 'passed' },
        ],
    },
    recommendation: {
        action: 'buy',
        summary: 'Strong fundamentals and low risk profile.',
        detailedAdvice: 'Consider accumulation at current levels with a stop loss below major support.',
        timeHorizon: 'medium',
        confidence: 92,
    },
    evidence: [
        {
            id: 'e1',
            type: 'onchain',
            title: 'Liquidity Depth',
            timestamp: new Date().toISOString(),
            content: 'Consistent liquidity depth across Raydium and Orca pools.',
        },
        {
            id: 'e2',
            type: 'market',
            title: 'Whale Activity',
            timestamp: new Date().toISOString(),
            content: 'Net positive whale transfers over the last 24 hours.',
        },
    ],
    dataSources: [
        { source: 'DexScreener', timestamp: new Date().toISOString() },
        { source: 'Helius', timestamp: new Date().toISOString() },
    ],
    technicalExplanation: 'The Solana (SOL) audit correlated liquidity ratios with holder distribution curves to determine a weighted safety score of 85.',
    createdAt: new Date().toISOString(),
};
