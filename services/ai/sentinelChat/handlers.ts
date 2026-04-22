import axios from "axios";
import { prisma } from "@/lib/prisma";
import { sentinelEngine } from "@/services/sentinelEngine";
import { sentinelAI } from "@/services/ai/sentinelAI";
import { heliusService } from "@/services/heliusService";
import { dexscreenerTokenService } from "@/services/token/dexscreenerTokenService";
import { jupiterTokenService } from "@/services/token/jupiterTokenService";
import { tokenAggregator } from "@/services/token/tokenAggregator";
import type { ToolContext, ToolHandler, ToolResult } from "./types";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";
const FEE_MINTS = new Set([SOL_MINT, USDC_MINT, USDT_MINT]);
const PLATFORM_FEE_BPS = 1500;

function normalizeChain(chain?: string): string {
  return (chain || "solana").toLowerCase();
}

function resolveMint(mintOrSymbol: string): string {
  const v = mintOrSymbol.trim();
  const upper = v.toUpperCase();
  if (upper === "SOL") return SOL_MINT;
  if (upper === "USDC") return USDC_MINT;
  if (upper === "USDT") return USDT_MINT;
  return v;
}

function ok<T>(data: T, extras: Partial<ToolResult<T>> = {}): ToolResult<T> {
  return { ok: true, data, ...extras } as ToolResult<T>;
}
function fail(error: string): ToolResult {
  return { ok: false, error };
}

// ─── analyzeToken ───────────────────────────────────────────────────────────
const analyzeToken: ToolHandler = async (args, ctx) => {
  const address: string | undefined = args?.address;
  const chain = normalizeChain(args?.chain);

  if (!address) return fail("`address` is required.");
  if (chain !== "solana") return fail("Only 'solana' is supported.");

  const analysisId = `sent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    await prisma.sentinelAnalysis.create({
      data: {
        id: analysisId,
        tokenAddress: address,
        userId: ctx.dbUserId,
        status: "processing",
      },
    });

    const data = await sentinelEngine.fetchData(address);
    const [rug, market] = await Promise.all([
      sentinelAI.analyzeRugRisk(data),
      sentinelAI.analyzeMarket(data),
    ]);
    const finalJson = await sentinelAI.finalDecision(data, rug, market);

    const parsedScore = parseInt(finalJson.finalScore, 10);
    const score = isNaN(parsedScore) ? 0 : parsedScore;

    await prisma.sentinelAnalysis.update({
      where: { id: analysisId },
      data: {
        status: "completed",
        score,
        result: finalJson,
      },
    });

    const payload = {
      analysisId,
      tokenAddress: data.token.address,
      tokenSymbol: data.token.symbol,
      tokenName: data.token.name,
      finalScore: score,
      summary: finalJson.summary,
      rugDetection: finalJson.rugDetection,
      recommendation: finalJson.recommendation,
      metrics: finalJson.metrics,
      evidence: finalJson.evidence,
      technicalExplanation: finalJson.technicalExplanation,
    };

    return ok(payload, {
      display: { kind: "analysis_card", payload },
      sideEffect: { updateLastToken: { address, chain } },
    });
  } catch (err: any) {
    await prisma.sentinelAnalysis
      .update({ where: { id: analysisId }, data: { status: "failed" } })
      .catch(() => {});
    return fail(err?.message || "Failed to run Sentinel analysis.");
  }
};

// ─── getTokenSnapshot ───────────────────────────────────────────────────────
const getTokenSnapshot: ToolHandler = async (args, ctx) => {
  const address: string | undefined = args?.address;
  const chain = normalizeChain(args?.chain);
  if (!address) return fail("`address` is required.");
  if (chain !== "solana") return fail("Only 'solana' is supported.");

  const market = await dexscreenerTokenService.getTokenMarketData(address);
  if (!market || !market.priceUsd) {
    return fail("No market data available for this token.");
  }

  const payload = {
    address,
    chain,
    name: market.name || "UNKNOWN",
    symbol: market.symbol || "UNKNOWN",
    priceUsd: market.priceUsd,
    change24h: market.change24h,
    volume24h: market.volume24h,
    liquidity: market.liquidity,
    imageUrl: market.imageUrl,
  };

  return ok(payload, {
    display: { kind: "token_card", payload },
    sideEffect: { updateLastToken: { address, chain } },
  });
};

// ─── getTokenHolders ────────────────────────────────────────────────────────
const getTokenHolders: ToolHandler = async (args, ctx) => {
  const address: string | undefined = args?.address;
  if (!address) return fail("`address` is required.");

  const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC ||
    `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

  try {
    const res = await axios.post(
      rpc,
      {
        jsonrpc: "2.0",
        id: "1",
        method: "getTokenLargestAccounts",
        params: [address],
      },
      { timeout: 15000 }
    );

    const items = res.data?.result?.value || [];
    const holders = items.slice(0, 20).map((h: any, i: number) => ({
      rank: i + 1,
      address: h.address,
      amount: parseFloat(h.uiAmountString || h.uiAmount || "0"),
    }));

    const totalTopAmount = holders.reduce(
      (s: number, h: any) => s + (h.amount || 0),
      0
    );
    const payload = {
      address,
      top: holders,
      topHoldersCombinedAmount: totalTopAmount,
      count: holders.length,
    };

    return ok(payload, {
      display: { kind: "holders_list", payload },
      sideEffect: { updateLastToken: { address, chain: "solana" } },
    });
  } catch (err: any) {
    return fail(err?.message || "Failed to fetch holders from RPC.");
  }
};

// ─── getRecentTransactions ──────────────────────────────────────────────────
const getRecentTransactions: ToolHandler = async (args, ctx) => {
  const address: string | undefined = args?.address;
  const limit = Math.min(Math.max(parseInt(args?.limit ?? 20, 10), 1), 50);
  if (!address) return fail("`address` is required.");

  try {
    const raw = await heliusService.getTransactionHistory(address, limit);
    const txs = (raw || []).slice(0, limit).map((tx: any) => ({
      signature: tx.signature,
      timestamp: tx.timestamp,
      type: tx.type,
      source: tx.source,
      fee: tx.fee,
      feePayer: tx.feePayer,
    }));

    const payload = { address, count: txs.length, txs };

    return ok(payload, {
      display: { kind: "tx_list", payload },
      sideEffect: { updateLastToken: { address, chain: "solana" } },
    });
  } catch (err: any) {
    return fail(err?.message || "Failed to fetch transactions.");
  }
};

// ─── searchToken ────────────────────────────────────────────────────────────
const searchToken: ToolHandler = async (args, ctx) => {
  const query: string | undefined = args?.query;
  if (!query) return fail("`query` is required.");

  try {
    const { data } = await axios.get(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`,
      { timeout: 10000 }
    );

    const pairs = (data?.pairs || [])
      .filter((p: any) => p.chainId === "solana" && p.priceUsd)
      .sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0));

    const seen = new Set<string>();
    const results = [];
    for (const p of pairs) {
      const addr = p.baseToken?.address;
      if (!addr || seen.has(addr)) continue;
      seen.add(addr);
      results.push({
        address: addr,
        name: p.baseToken?.name,
        symbol: p.baseToken?.symbol,
        priceUsd: parseFloat(p.priceUsd) || 0,
        liquidity: p.liquidity?.usd || 0,
        volume24h: p.volume?.h24 || 0,
      });
      if (results.length >= 10) break;
    }

    const payload = { query, results };
    return ok(payload, { display: { kind: "search_results", payload } });
  } catch (err: any) {
    return fail(err?.message || "Search failed.");
  }
};

// ─── addToWatchlist ─────────────────────────────────────────────────────────
const addToWatchlist: ToolHandler = async (args, ctx) => {
  const address: string | undefined = args?.address;
  const chain = normalizeChain(args?.chain);
  if (!address) return fail("`address` is required.");
  if (!ctx.dbUserId) return fail("You must be signed in to use the watchlist.");

  const existing = await prisma.watchlist.findUnique({
    where: {
      userId_chain_address: { userId: ctx.dbUserId, chain, address },
    },
  });
  if (existing) {
    return ok(
      { already: true, watchlistId: existing.id, address, chain },
      { display: { kind: "watchlist_card", payload: { action: "already_in", address, chain } } }
    );
  }

  const created = await prisma.watchlist.create({
    data: { userId: ctx.dbUserId, chain, address },
  });

  return ok(
    { watchlistId: created.id, address, chain },
    { display: { kind: "watchlist_card", payload: { action: "added", address, chain } } }
  );
};

// ─── removeFromWatchlist ────────────────────────────────────────────────────
const removeFromWatchlist: ToolHandler = async (args, ctx) => {
  const address: string | undefined = args?.address;
  const chain = normalizeChain(args?.chain);
  if (!address) return fail("`address` is required.");
  if (!ctx.dbUserId) return fail("You must be signed in to use the watchlist.");

  const existing = await prisma.watchlist.findUnique({
    where: { userId_chain_address: { userId: ctx.dbUserId, chain, address } },
  });
  if (!existing) {
    return ok(
      { removed: false, address, chain },
      { display: { kind: "watchlist_card", payload: { action: "not_in", address, chain } } }
    );
  }

  await prisma.watchlist.delete({ where: { id: existing.id } });
  return ok(
    { removed: true, address, chain },
    { display: { kind: "watchlist_card", payload: { action: "removed", address, chain } } }
  );
};

// ─── listWatchlist ──────────────────────────────────────────────────────────
const listWatchlist: ToolHandler = async (_args, ctx) => {
  if (!ctx.dbUserId) return fail("You must be signed in to use the watchlist.");

  const items = await prisma.watchlist.findMany({
    where: { userId: ctx.dbUserId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const payload = {
    count: items.length,
    items: items.map((w) => ({
      id: w.id,
      chain: w.chain,
      address: w.address,
      createdAt: w.createdAt.toISOString(),
    })),
  };

  return ok(payload, {
    display: { kind: "watchlist_card", payload: { action: "list", ...payload } },
  });
};

// ─── getUserPortfolio ───────────────────────────────────────────────────────
const getUserPortfolio: ToolHandler = async (args, ctx) => {
  const wallet: string | undefined = args?.walletAddress || ctx.userWalletAddress;
  if (!wallet) {
    return fail(
      "No wallet connected. Ask the user to connect a Solana wallet or provide `walletAddress`."
    );
  }

  try {
    const [sol, tokens] = await Promise.all([
      heliusService.getWalletBalance(wallet).catch(() => 0),
      heliusService.getTokenBalances(wallet).catch(() => []),
    ]);

    const fungible = (tokens || [])
      .filter(
        (t: any) =>
          t?.interface === "FungibleToken" || t?.interface === "FungibleAsset"
      )
      .map((t: any) => ({
        mint: t.id,
        symbol: t.content?.metadata?.symbol,
        name: t.content?.metadata?.name,
        amount: t.token_info?.balance
          ? parseFloat(t.token_info.balance) /
            Math.pow(10, t.token_info.decimals || 0)
          : 0,
        priceUsd: t.token_info?.price_info?.price_per_token,
        valueUsd: t.token_info?.price_info?.total_price,
      }))
      .filter((t: any) => t.amount > 0)
      .slice(0, 30);

    const payload = {
      wallet,
      solBalance: sol,
      tokens: fungible,
      tokenCount: fungible.length,
    };

    return ok(payload, { display: { kind: "portfolio_card", payload } });
  } catch (err: any) {
    return fail(err?.message || "Failed to fetch portfolio.");
  }
};

// ─── getJupiterQuote ────────────────────────────────────────────────────────
const getJupiterQuote: ToolHandler = async (args, ctx) => {
  const inputMint = resolveMint(args?.inputMint || "");
  const outputMint = resolveMint(args?.outputMint || "");
  const amount: number | undefined =
    typeof args?.amount === "string" ? parseFloat(args.amount) : args?.amount;
  const slippageBps = parseInt(args?.slippageBps ?? 50, 10);

  if (!inputMint || !outputMint || !amount || amount <= 0) {
    return fail("`inputMint`, `outputMint`, and positive `amount` are required.");
  }

  try {
    const inputMeta = await tokenAggregator
      .getTokenMeta("solana", inputMint)
      .catch(() => null);
    const inputDecimals = inputMeta?.decimals ?? (inputMint === USDC_MINT ? 6 : 9);
    const atoms = Math.floor(amount * Math.pow(10, inputDecimals));

    const outputMeta = await tokenAggregator
      .getTokenMeta("solana", outputMint)
      .catch(() => null);
    const outputDecimals = outputMeta?.decimals ?? 9;

    const quote = await jupiterTokenService.getRawQuote(
      inputMint,
      outputMint,
      atoms,
      slippageBps
    );

    if (!quote || quote.error) {
      return fail(quote?.error || "Jupiter returned no quote.");
    }

    const payload = {
      inputMint,
      outputMint,
      inputSymbol: inputMeta?.symbol,
      outputSymbol: outputMeta?.symbol,
      inAmount: amount,
      outAmount: parseInt(quote.outAmount) / Math.pow(10, outputDecimals),
      priceImpactPct: parseFloat(quote.priceImpactPct) || 0,
      slippageBps,
      route: (quote.routePlan || []).map((s: any) => s.swapInfo?.label).filter(Boolean),
    };

    return ok(payload, { display: { kind: "trade_quote_card", payload } });
  } catch (err: any) {
    return fail(err?.message || "Failed to fetch Jupiter quote.");
  }
};

// ─── prepareSwap ────────────────────────────────────────────────────────────
// Hard guard: returns the quote + fee routing metadata only. The inline UI
// card executes the actual swap via the existing /api/trade/swap flow after
// the user signs in their wallet. The LLM never sees a signed transaction.
const prepareSwap: ToolHandler = async (args, ctx) => {
  const inputMint = resolveMint(args?.inputMint || "");
  const outputMint = resolveMint(args?.outputMint || "");
  const amount: number | undefined =
    typeof args?.amount === "string" ? parseFloat(args.amount) : args?.amount;
  const slippageBps = parseInt(args?.slippageBps ?? 50, 10);

  if (!inputMint || !outputMint || !amount || amount <= 0) {
    return fail("`inputMint`, `outputMint`, and positive `amount` are required.");
  }

  try {
    const inputMeta = await tokenAggregator
      .getTokenMeta("solana", inputMint)
      .catch(() => null);
    const inputDecimals = inputMeta?.decimals ?? (inputMint === USDC_MINT ? 6 : 9);
    const fullAmountInAtoms = Math.floor(amount * Math.pow(10, inputDecimals));

    let feeMint: string | null = null;
    let feeStrategy: "output" | "input" | "none" = "none";
    if (FEE_MINTS.has(outputMint)) {
      feeMint = outputMint;
      feeStrategy = "output";
    } else if (FEE_MINTS.has(inputMint)) {
      feeMint = inputMint;
      feeStrategy = "input";
    }
    const platformFeeBps = feeStrategy === "output" ? PLATFORM_FEE_BPS : undefined;

    let swapAmountInAtoms = fullAmountInAtoms;
    let manualFeeAtoms: string | undefined;
    if (feeStrategy === "input") {
      swapAmountInAtoms = Math.floor(fullAmountInAtoms * 0.85);
      manualFeeAtoms = (fullAmountInAtoms - swapAmountInAtoms).toString();
    }

    const rawQuote = await jupiterTokenService.getRawQuote(
      inputMint,
      outputMint,
      swapAmountInAtoms,
      slippageBps,
      platformFeeBps
    );
    if (!rawQuote || rawQuote.error) {
      return fail(rawQuote?.error || "Jupiter returned no quote.");
    }

    const outputMeta = await tokenAggregator
      .getTokenMeta("solana", outputMint)
      .catch(() => null);
    const outputDecimals = outputMeta?.decimals ?? 9;

    const cached = await prisma.sentinelAnalysis.findFirst({
      where: { tokenAddress: outputMint },
      orderBy: { createdAt: "desc" },
    });
    const sentinelScore = cached?.score ?? null;

    const payload = {
      // Full quoteResponse is required by /api/trade/swap
      quoteResponse: rawQuote,
      userPublicKey: ctx.userWalletAddress || null,
      inputMint,
      outputMint,
      inputSymbol: inputMeta?.symbol,
      outputSymbol: outputMeta?.symbol,
      inAmount: amount,
      outAmount: parseInt(rawQuote.outAmount) / Math.pow(10, outputDecimals),
      priceImpactPct: parseFloat(rawQuote.priceImpactPct) || 0,
      slippageBps,
      feeMint,
      feeStrategy,
      manualFeeAtoms,
      sentinelScore,
      route: (rawQuote.routePlan || [])
        .map((s: any) => s.swapInfo?.label)
        .filter(Boolean),
      // The UI must require an explicit user click; never auto-execute.
      requiresUserConfirmation: true,
    };

    // Don't echo the full quoteResponse back to the LLM — too big and noisy.
    // The LLM gets a summary; the UI card keeps the full quoteResponse.
    const llmPayload = {
      inputSymbol: payload.inputSymbol,
      outputSymbol: payload.outputSymbol,
      inAmount: payload.inAmount,
      outAmount: payload.outAmount,
      priceImpactPct: payload.priceImpactPct,
      slippageBps: payload.slippageBps,
      route: payload.route,
      sentinelScore,
      feeStrategy,
      requiresUserConfirmation: true,
      hint: "An inline trade card has been shown to the user for confirmation.",
    };

    return {
      ok: true,
      data: llmPayload,
      display: { kind: "trade_quote_card", payload },
    };
  } catch (err: any) {
    return fail(err?.message || "Failed to prepare swap.");
  }
};

export const toolHandlers: Record<string, ToolHandler> = {
  analyzeToken,
  getTokenSnapshot,
  getTokenHolders,
  getRecentTransactions,
  searchToken,
  addToWatchlist,
  removeFromWatchlist,
  listWatchlist,
  getUserPortfolio,
  getJupiterQuote,
  prepareSwap,
};

export async function runTool(
  name: string,
  args: any,
  ctx: ToolContext
): Promise<ToolResult> {
  const handler = toolHandlers[name];
  if (!handler) return fail(`Unknown tool: ${name}`);
  try {
    return await handler(args, ctx);
  } catch (err: any) {
    return fail(err?.message || `Tool ${name} threw an exception.`);
  }
}
