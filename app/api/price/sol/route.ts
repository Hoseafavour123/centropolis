import { NextResponse } from "next/server";
import axios from "axios";

/**
 * GET /api/price/sol
 * Returns the current SOL/USD price from CoinGecko.
 * Cached for 60 seconds to avoid rate limiting.
 */
export async function GET() {
    try {
        const { data } = await axios.get(
            "https://api.coingecko.com/api/v3/simple/price",
            {
                params: {
                    ids: "solana",
                    vs_currencies: "usd",
                },
                timeout: 8_000,
            }
        );

        const price: number = data?.solana?.usd ?? null;

        if (price === null) {
            return NextResponse.json(
                { error: "SOL price not available" },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { price },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
                },
            }
        );
    } catch (error) {
        console.error("[/api/price/sol] CoinGecko error:", error);
        return NextResponse.json(
            { error: "Failed to fetch SOL price" },
            { status: 502 }
        );
    }
}
