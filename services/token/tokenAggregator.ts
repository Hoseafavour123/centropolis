import { TokenMeta } from '@/types/token';
import { heliusTokenService } from './heliusTokenService';
import { dexscreenerTokenService } from './dexscreenerTokenService';
import { prisma } from '@/lib/prisma';

export const tokenAggregator = {
    /**
     * Aggregates token data from Helius and DexScreener.
     */
    getTokenMeta: async (chain: string, address: string): Promise<TokenMeta> => {
        const lastUpdated = new Date().toISOString();

        // 1 & 2. Fetch Helius metadata and DexScreener market data in parallel
        const [heliusResult, marketResult] = await Promise.allSettled([
            chain === 'solana'
                ? heliusTokenService.getTokenMetadata(address)
                : Promise.resolve({}),
            dexscreenerTokenService.getTokenMarketData(address),
        ]);

        const heliusData: any = heliusResult.status === 'fulfilled' ? heliusResult.value : {};
        const marketData = marketResult.status === 'fulfilled' ? marketResult.value : {};

        // 3. Compute Supply and Decimals (fallback to Helius data)
        const totalSupply = heliusData.totalSupply || '0';
        const decimals = heliusData.decimals || 9;
        const price = marketData.priceUsd || 0;

        // 4. Compute Market Cap
        // supply is often a large string (lamports), need to convert to tokens
        const supplyFloat = parseFloat(totalSupply) / Math.pow(10, decimals);
        const marketCapUsd = price * supplyFloat;

        // 5. Compute Contract Flags
        const contractFlags: string[] = [];
        if (chain === 'solana') {
            if (heliusData.mintAuthority) contractFlags.push('mintable');
            if (heliusData.freezeAuthority) contractFlags.push('freezable');
            if (!heliusData.mintAuthority && !heliusData.freezeAuthority) {
                contractFlags.push('immutable');
            }
        } else {
            contractFlags.push('unverified');
        }

        // 6. Compute Safety Score
        let safetyScore = 50;

        try {
            const aggregations = await prisma.sentinelAnalysis.aggregate({
                _avg: { score: true },
                where: {
                    tokenAddress: address,
                    status: 'completed'
                }
            });

            if (aggregations._avg.score !== null) {
                // Use the average of all AI analysis performed by users
                safetyScore = Math.round(aggregations._avg.score);
            } else {
                // Rigorous fallback heuristic
                if ((marketData.liquidity || 0) > 1000000) safetyScore += 15;
                if ((marketData.liquidity || 0) > 5000000) safetyScore += 10;

                if (marketCapUsd > 0 && marketData.volume24h) {
                    const volToMcap = marketData.volume24h / marketCapUsd;
                    if (volToMcap > 0.05 && volToMcap < 0.5) safetyScore += 15;
                }

                if (contractFlags.includes('immutable')) safetyScore += 25;
                if (contractFlags.includes('mintable')) safetyScore -= 30; // High risk
                if (contractFlags.includes('freezable')) safetyScore -= 20; // High risk
                if (contractFlags.includes('unverified')) safetyScore -= 10;
            }
        } catch (error) {
            console.error("[TokenAggregator] Error fetching Sentinel Score", error);
            if ((marketData.liquidity || 0) > 1000000) safetyScore += 20;
            if (contractFlags.includes('immutable')) safetyScore += 20;
            if (contractFlags.includes('mintable')) safetyScore -= 20;
            if (contractFlags.includes('freezable')) safetyScore -= 10;
        }

        // Clamp safety score
        safetyScore = Math.max(0, Math.min(100, safetyScore));

        return {
            chain,
            address,
            symbol: heliusData.symbol || marketData.symbol || 'TKN',
            name: heliusData.name || marketData.name || 'Unknown Token',
            logoUrl: heliusData.logoUrl || marketData.imageUrl || '/tokens/generic.png',
            marketCapUsd: marketCapUsd > 0 ? marketCapUsd : marketData.liquidity ? marketData.liquidity * 2 : 0,
            totalSupply: totalSupply,
            decimals: decimals,
            verified: contractFlags.includes('immutable'),
            contractFlags: contractFlags,
            lastUpdated,
            priceUsd: price,
            change24h: marketData.change24h || 0,
            volume24h: marketData.volume24h || 0,
            safetyScore,
        };
    }
};