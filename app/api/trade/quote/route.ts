import { NextRequest, NextResponse } from 'next/server';
import { jupiterTokenService } from '@/services/token/jupiterTokenService';
import { tokenAggregator } from '@/services/token/tokenAggregator';
import { TradeQuoteResponse } from '@/types/token';
import { prisma } from '@/lib/prisma';
import { SOL_MINT, USDC_MINT, USDT_MINT, FEE_MINTS } from '@/lib/solana/constants';

const PLATFORM_FEE_BPS = 1500; // 15%

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  let inputMint = searchParams.get('inputMint') || searchParams.get('from');
  let outputMint = searchParams.get('outputMint') || searchParams.get('to');
  const amount = searchParams.get('amount');
  const slippageBps = parseInt(searchParams.get('slippageBps') || '50', 10);

  if (!inputMint || !outputMint || !amount) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Map simple symbols → mints for backwards compatibility
  inputMint = inputMint === 'SOL' ? SOL_MINT : inputMint === 'USDC' ? USDC_MINT : inputMint;
  outputMint = outputMint === 'SOL' ? SOL_MINT : outputMint === 'USDC' ? USDC_MINT : outputMint;

  try {
    // Fetch decimals for input token to convert amount to atoms
    const inputMeta = await tokenAggregator.getTokenMeta('solana', inputMint).catch(() => null);
    const inputDecimals = inputMeta?.decimals ?? (inputMint === USDC_MINT ? 6 : 9);

    const fullAmountInAtoms = Math.floor(parseFloat(amount) * Math.pow(10, inputDecimals));

    // ─── Fee strategy ────────────────────────────────────────────────────────
    // Prefer collecting fees from the OUTPUT token (standard Jupiter referral).
    // When the output is a non-major token (e.g. BONK), fall back to collecting
    // from the INPUT token if it is a major token (SOL/USDC/USDT).
    // Jupiter accepts a referral token account for either side — it deducts fees
    // from whichever mint the provided feeAccount belongs to.
    let feeMint: string | null = null;
    let feeStrategy: 'output' | 'input' | 'none' = 'none';

    if (FEE_MINTS.has(outputMint)) {
      feeMint = outputMint;
      feeStrategy = 'output';
    } else if (FEE_MINTS.has(inputMint)) {
      feeMint = inputMint;
      feeStrategy = 'input';
    }

    // Only pass platformFeeBps to Jupiter if the fee is being collected on the OUTPUT token
    const platformFeeBps = feeStrategy === 'output' ? PLATFORM_FEE_BPS : undefined;

    let swapAmountInAtoms = fullAmountInAtoms;
    let manualFeeAtoms: string | undefined = undefined;

    if (feeStrategy === 'input') {
      // Manual fee deduction for ExactIn swaps when we can't use Jupiter's output fee
      swapAmountInAtoms = Math.floor(fullAmountInAtoms * 0.85);
      manualFeeAtoms = (fullAmountInAtoms - swapAmountInAtoms).toString();
    }

    // Get raw Jupiter quote
    const rawQuote = await jupiterTokenService.getRawQuote(
      inputMint,
      outputMint,
      swapAmountInAtoms,
      slippageBps,
      platformFeeBps
    );

    if (!rawQuote || rawQuote.error) {
      console.error('[TradeQuoteAPI] Jupiter quote error:', rawQuote?.error);
      return NextResponse.json({ error: 'Failed to fetch quote from Jupiter', details: rawQuote?.error }, { status: 500 });
    }

    // Production Sentinel & Token Data
    const outputMeta = await tokenAggregator.getTokenMeta('solana', outputMint).catch(() => null);

    // Check Sentinel Analysis history
    const sentinelAnalysis = await prisma.sentinelAnalysis.findFirst({
      where: { tokenAddress: outputMint },
      orderBy: { createdAt: 'desc' }
    });

    let sentinelScore = 50;
    let safetyBand: "safe" | "caution" | "danger" = "caution";
    let liquidityScore = 50;
    let mevRisk: "low" | "medium" | "high" = "medium";

    if (sentinelAnalysis && sentinelAnalysis.score !== null) {
      sentinelScore = sentinelAnalysis.score;
      safetyBand = sentinelScore > 80 ? 'safe' : sentinelScore > 50 ? 'caution' : 'danger';

      const resData = sentinelAnalysis.result as any;
      if (resData?.metrics) {
        liquidityScore = resData.metrics.liquidityDepth
          ? Math.min(100, (resData.metrics.liquidityDepth / 1_000_000) * 100)
          : 50;
      }
      if (resData?.rugDetection) {
        mevRisk = resData.rugDetection.riskLevel === 'high' || resData.rugDetection.riskLevel === 'critical'
          ? 'high' : 'low';
      }
    } else if (outputMeta?.safetyScore) {
      sentinelScore = outputMeta.safetyScore;
      safetyBand = sentinelScore > 80 ? 'safe' : sentinelScore > 50 ? 'caution' : 'danger';
    } else if (outputMint === USDC_MINT || outputMint === SOL_MINT || outputMint === USDT_MINT) {
      sentinelScore = 99;
      safetyBand = 'safe';
      liquidityScore = 99;
      mevRisk = 'low';
    }

    const enrichedQuote: TradeQuoteResponse = {
      inAmount: fullAmountInAtoms.toString(),
      outAmount: rawQuote.outAmount,
      priceImpact: parseFloat(rawQuote.priceImpactPct) || 0,
      route: rawQuote,
      estimatedFees: platformFeeBps ? parseFloat(rawQuote.platformFee?.amount || '0') : manualFeeAtoms ? parseFloat(manualFeeAtoms) : 0,

      // Fee routing metadata — forwarded through the client to the swap API
      feeMint,
      feeStrategy,
      manualFeeAtoms,

      sentinelScore,
      safetyBand,
      liquidityScore,
      mevRisk,
    };

    return NextResponse.json(enrichedQuote, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error('[TradeQuoteAPI] Route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}