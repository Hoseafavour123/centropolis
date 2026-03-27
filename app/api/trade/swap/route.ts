import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const USDT_MINT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';

// Use the public Jupiter API — quote-api.jup.ag requires an API key
const JUPITER_SWAP_URL = 'https://public.jupiterapi.com/swap';

// Pre-created Jupiter referral token accounts (one per supported mint).

export async function POST(request: NextRequest) {
    try {
        console.log('\n[TradeSwapAPI] ---------------------------------------');
        console.log('[TradeSwapAPI] 📥 Received swap request');
        const { userId: clerkId } = await auth();
        const body = await request.json();

        // The client forwards:
        //   - quoteResponse : raw Jupiter quote (from /api/trade/quote)
        //   - feeMint       : the mint whose referral account should receive the fee
        //   - feeStrategy   : 'output' | 'input' | 'none'
        // feeMint is whichever of (inputMint, outputMint) is SOL/USDC/USDT,
        // so the swap always collects fees in a token we have a referral account for.
        const { quoteResponse, userPublicKey, feeMint, feeStrategy } = body;

        if (!quoteResponse) {
            return NextResponse.json(
                { error: 'quoteResponse is required. Pass the Jupiter quote object returned by /api/trade/quote.' },
                { status: 400 }
            );
        }

        if (!userPublicKey) {
            return NextResponse.json({ error: 'Missing userPublicKey' }, { status: 400 });
        }

        // ─── Resolve fee account ──────────────────────────────────────────────────
        // feeMint is the mint the quote API selected (input or output, whichever is major).
        // Jupiter's feeAccount accepts a referral token account for either the input
        // or output mint — it deducts fees from whichever mint the account belongs to.
        const FEE_ACCOUNTS: Record<string, string | undefined> = {
            [SOL_MINT]: process.env.PLATFORM_FEE_ACCOUNT_SOL,
            [USDC_MINT]: process.env.PLATFORM_FEE_ACCOUNT_USDC,
            [USDT_MINT]: process.env.PLATFORM_FEE_ACCOUNT_USDT,
        };

        const feeAccount = feeMint ? FEE_ACCOUNTS[feeMint as string] : undefined;
        const hasFeeAccount = !!feeAccount && !feeAccount.startsWith('REPLACE_WITH');

        if (hasFeeAccount) {
            console.info(
                `[TradeSwapAPI] ✅ Platform fee → ${feeStrategy} strategy | Mint: ${feeMint} | Account: ${feeAccount}`
            );
        } else {
            console.info(
                `[TradeSwapAPI] ⚠️ No configured referral account for feeMint="${feeMint ?? 'none'}" ` +
                `(strategy: ${feeStrategy ?? 'none'}). Swap proceeds without platform fee.`
            );
        }

        // ─── Build Jupiter swap payload ───────────────────────────────────────────
        const swapPayload: Record<string, any> = {
            quoteResponse,
            userPublicKey,
            wrapAndUnwrapSol: true,
            computeUnitPriceMicroLamports: 'auto',
            dynamicComputeUnitLimit: true,
        };

        if (hasFeeAccount) {
            swapPayload.feeAccount = feeAccount;
        }

        console.log('[TradeSwapAPI] 🚀 Sending payload to Jupiter Swap API:', JSON.stringify({
            userPublicKey: swapPayload.userPublicKey,
            feeAccount: swapPayload.feeAccount,
            wrapAndUnwrapSol: swapPayload.wrapAndUnwrapSol
        }));

        const swapResult = await axios.post(JUPITER_SWAP_URL, swapPayload, {
            timeout: 20_000,
            headers: { 'Content-Type': 'application/json' },
        });

        const { swapTransaction } = swapResult.data;

        if (!swapTransaction) {
            console.error('[TradeSwapAPI] ❌ Failed to generate swap transaction from Jupiter');
            return NextResponse.json({ error: 'Failed to generate swap transaction' }, { status: 500 });
        }

        console.log('[TradeSwapAPI] ✅ Successfully received swapTransaction (base64). Length:', swapTransaction.length);

        // ─── Persist swap intent ──────────────────────────────────────────────────
        let txRecordId = null;
        if (clerkId) {
            const dbUser = await prisma.user.findUnique({ where: { clerkId } });
            if (dbUser) {
                const record = await prisma.transaction.create({
                    data: {
                        userId: dbUser.id,
                        chain: 'solana',
                        type: 'swap',
                        txHash: 'pending_' + Date.now().toString(),
                    },
                });
                txRecordId = record.id;
            }
        }

        return NextResponse.json({ swapTransaction, recordId: txRecordId }, { status: 200 });

    } catch (error: any) {
        const detail = error?.response?.data ?? error.message;
        console.error('[TradeSwapAPI] Route error:', detail);
        return NextResponse.json(
            { error: 'Internal server error', details: typeof detail === 'string' ? detail : JSON.stringify(detail) },
            { status: 500 }
        );
    }
}
