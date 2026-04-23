/**
 * Canonical Solana token mint addresses. Import from here everywhere instead
 * of hard-coding strings — mismatched mints have caused "Invalid link, this
 * contains a token you don't know" errors from wallets and broken swap routes.
 */

export const SOL_MINT = "So11111111111111111111111111111111111111112";

/** Circle USDC on Solana mainnet. */
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

/** Tether USDT on Solana mainnet. */
export const USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

/** Stablecoin mints the platform accepts as fee tokens. */
export const FEE_MINTS = new Set([SOL_MINT, USDC_MINT, USDT_MINT]);

export function isSol(mint: string): boolean {
    return mint === SOL_MINT;
}

export function isUsdc(mint: string): boolean {
    return mint === USDC_MINT;
}

export function isUsdt(mint: string): boolean {
    return mint === USDT_MINT;
}
