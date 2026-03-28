import { NextResponse } from 'next/server';
import { heliusService } from '@/services/heliusService';
import { coingeckoService } from '@/services/coingeckoService';

export const revalidate = 30; // Next.js ISR: Cache this endpoint for 30 seconds

export async function GET(req: Request, { params }: { params: Promise<{ address: string }> }) {
    try {
        const { address } = await params;
        if (!address) {
            return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
        }

        // Parallelize Helius calls and CoinGecko overview
        const [solBalance, tokens, marketData] = await Promise.all([
            heliusService.getWalletBalance(address).catch(() => 0),
            heliusService.getTokenBalances(address).catch(() => []),
            coingeckoService.getMarketOverview().catch(() => [])
        ]);

        const solMarket = marketData.find(m => m.symbol === 'SOL');
        const solPrice = solMarket?.price || 0;

        let netUsd = solBalance * solPrice;

        const formattedTokens = tokens.map((t: any) => {
            const price = t.token_info?.price_info?.price_per_token || 0;
            const balanceStr = (t.token_info?.balance || 0).toString();
            const decimals = t.token_info?.decimals || 0;
            const uiAmount = parseFloat(balanceStr) / Math.pow(10, decimals);
            const valueUsd = uiAmount * price;

            netUsd += valueUsd;

            return {
                id: t.id,
                mint: t.id,
                name: t.content?.metadata?.name || 'Unknown Token',
                symbol: t.content?.metadata?.symbol || 'UNKNOWN',
                image: t.content?.links?.image || t.content?.files?.[0]?.uri || '',
                balance: uiAmount,
                decimals,
                priceUsd: price,
                valueUsd,
            };
        });

        // Sort tokens by USD value
        formattedTokens.sort((a: any, b: any) => b.valueUsd - a.valueUsd);

        return NextResponse.json({
            address,
            netUsd,
            solBalance,
            solPriceUsd: solPrice,
            tokens: formattedTokens
        });
    } catch (error) {
        console.error('Balances fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch balances' }, { status: 500 });
    }
}
