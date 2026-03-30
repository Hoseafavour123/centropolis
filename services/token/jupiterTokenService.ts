import axios from 'axios';
import { TradeRoute } from '@/types/token';

const JUPITER_QUOTE_API = 'https://public.jupiterapi.com/quote';

export const jupiterTokenService = {
    /**
     * Fetch a raw trade quote from Jupiter V6.
     */
    getRawQuote: async (
        inputMint: string,
        outputMint: string,
        amountInAtoms: number, // in atoms
        slippageBps: number = 50,
        platformFeeBps?: number // Optional: e.g. 1500 = 15%
    ): Promise<any> => {
        try {
            let url = `${JUPITER_QUOTE_API}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountInAtoms}&slippageBps=${slippageBps}`;
            if (platformFeeBps !== undefined) {
                url += `&platformFeeBps=${platformFeeBps}`;
            }
            const response = await axios.get(url, { timeout: 15000 });
            return response.data;
        } catch (error) {
            console.error('[JupiterService] Error fetching raw quote:', error);
            return null;
        }
    },

    /**
     * Fetch a trade quote from Jupiter and map to legacy TradeRoute format.
     */
    getQuote: async (
        inputMint: string,
        outputMint: string,
        amount: number, // in floating tokens (e.g., 0.1 SOL)
        inputDecimals: number = 9,
        outputDecimals: number = 9,
        slippageBps: number = 50
    ): Promise<TradeRoute[]> => {
        try {
            // Convert to atoms (atoms = amount * 10^decimals)
            const atoms = Math.floor(amount * Math.pow(10, inputDecimals));

            const quote = await jupiterTokenService.getRawQuote(inputMint, outputMint, atoms, slippageBps);

            if (!quote || quote.error) {
                console.error('[JupiterService] Quote error:', quote?.error);
                return [];
            }

            // Map Jupiter response to our TradeRoute type
            const route: TradeRoute = {
                routeId: `jup-${Date.now()}-${quote.outAmount}`,
                provider: 'Jupiter',
                fromToken: inputMint,
                toToken: outputMint,
                expectedOutput: (parseInt(quote.outAmount) / Math.pow(10, outputDecimals)).toFixed(6), // Fallback decimals if needed
                minimumOutput: (parseInt(quote.otherAmountThreshold) / Math.pow(10, outputDecimals)).toFixed(6),
                priceImpact: parseFloat(quote.priceImpactPct) || 0,
                slippage: slippageBps / 100,
                feeUsd: 0, // Fee calculation would need price data
                platformFee: 0.15,
                mevProtected: true,
                jitoProtected: true,
                steps: quote.routePlan.map((s: any) => ({
                    dex: s.swapInfo.label,
                    from: s.swapInfo.inputMint,
                    to: s.swapInfo.outputMint,
                    percent: parseFloat(s.percent) || 100
                })),
                estimatedTimeMs: 400
            };

            return [route];
        } catch (error) {
            console.error('[JupiterService] Error fetching quote:', error);
            return [];
        }
    }
};