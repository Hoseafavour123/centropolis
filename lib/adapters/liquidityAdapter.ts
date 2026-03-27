import { DexScreenerPair } from "../services/dexscreener";
import { PoolInfo } from "../../types/token";

/**
 * ============================================================================
 * LIQUIDITY ADAPTER
 * ============================================================================
 * Description: Transforms DexScreener pairs into internal PoolInfo models.
 * ============================================================================
 */

export const liquidityAdapter = {
    /**
     * Map a single DexScreener pair to a PoolInfo
     */
    mapPairToPool(pair: DexScreenerPair): PoolInfo {
        const liquidityUsd = pair.liquidity?.usd || 0;

        return {
            poolId: pair.pairAddress,
            pair: {
                tokenA: pair.baseToken.symbol,
                tokenB: pair.quoteToken.symbol
            },
            liquidityUsd,
            depthScore: this.calculateDepthScore(liquidityUsd),
            feeTier: this.estimateFeeTier(pair.dexId),
            poolAddress: pair.pairAddress,
            provider: this.normalizeProvider(pair.dexId),
            mevProtected: this.isMevProtected(pair.dexId),
            jitoProtected: this.isJitoProtected(pair.dexId),
            lastUpdated: new Date().toISOString()
        };
    },

    /**
     * Map multiple pairs and filter out those with no liquidity
     */
    mapPairs(pairs: DexScreenerPair[]): PoolInfo[] {
        return pairs
            .map(p => this.mapPairToPool(p))
            .filter(pool => pool.liquidityUsd > 0);
    },

    /**
     * Logic: > $100M (90+), > $50M (85+), > $10M (75+), > $1M (65+), else (40)
     */
    calculateDepthScore(liquidityUsd: number): number {
        if (liquidityUsd > 100_000_000) return 90 + Math.floor(Math.random() * 10);
        if (liquidityUsd > 50_000_000) return 85 + Math.floor(Math.random() * 5);
        if (liquidityUsd > 10_000_000) return 75 + Math.floor(Math.random() * 10);
        if (liquidityUsd > 1_000_000) return 65 + Math.floor(Math.random() * 10);
        return 40;
    },

    /**
     * Estimate fee tier based on DEX defaults
     */
    estimateFeeTier(dexId: string): number {
        const id = dexId.toLowerCase();
        if (id.includes('orca')) return 0.0001;
        if (id.includes('raydium')) return 0.0025;
        if (id.includes('meteora')) return 0.00025;
        return 0.003; // Default 0.3%
    },

    /**
     * Map raw DEX ID to canonical provider names
     */
    normalizeProvider(dexId: string): PoolInfo['provider'] {
        const id = dexId.toLowerCase();
        if (id.includes('raydium')) return 'Raydium';
        if (id.includes('orca')) return 'Orca';
        if (id.includes('meteora')) return 'Meteora';
        if (id.includes('jupiter')) return 'Jupiter';

        // Match string literals from the union type
        const providers: PoolInfo['provider'][] = ['Raydium', 'Orca', 'Meteora', 'Jupiter'];
        return providers.find(p => p && id.includes(p.toLowerCase())) || 'Jupiter'; // Fallback
    },

    /**
     * MEV protection status
     */
    isMevProtected(dexId: string): boolean {
        const id = dexId.toLowerCase();
        return id.includes('jupiter') || id.includes('orca');
    },

    /**
     * Jito protection status
     */
    isJitoProtected(dexId: string): boolean {
        const id = dexId.toLowerCase();
        return id.includes('jupiter');
    }
};
