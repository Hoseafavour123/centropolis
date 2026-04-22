import type { ToolSpec } from "./types";

const chainEnum = { type: "string", enum: ["solana"], default: "solana" };

export const SENTINEL_CHAT_TOOLS: ToolSpec[] = [
  {
    type: "function",
    function: {
      name: "analyzeToken",
      description:
        "Run Sentinel's full rug + market + decision pipeline on a token. Returns a safety score (0-100), rug indicators, recommendation, and evidence. Persists to the Sentinel analysis store so the result also appears in the user's Sentinel page. Slow (~10-20s) — only call when the user asks for a deep analysis.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "Solana mint address of the token (base58, 32-44 chars).",
          },
          chain: chainEnum,
        },
        required: ["address"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getTokenSnapshot",
      description:
        "Fast read-only lookup: name, symbol, price, 24h change, 24h volume, and liquidity. Use for quick follow-up questions ('what's BONK trading at?') or to resolve a token before a heavier call.",
      parameters: {
        type: "object",
        properties: {
          address: { type: "string", description: "Solana mint address." },
          chain: chainEnum,
        },
        required: ["address"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getTokenHolders",
      description:
        "Top 20 holders of a Solana token by balance. Useful for whale concentration questions.",
      parameters: {
        type: "object",
        properties: {
          address: { type: "string", description: "Solana mint address." },
        },
        required: ["address"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getRecentTransactions",
      description:
        "Recent on-chain transactions touching an address (token mint or wallet). Useful for activity questions.",
      parameters: {
        type: "object",
        properties: {
          address: { type: "string", description: "Solana address (token or wallet)." },
          limit: {
            type: "integer",
            minimum: 1,
            maximum: 50,
            default: 20,
          },
        },
        required: ["address"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchToken",
      description:
        "Resolve a token name, symbol, or keyword to candidate Solana mint addresses. Use this when the user names a token without an address (e.g. 'analyze BONK'). Always show the user the top result and confirm before running expensive tools.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Name, symbol, or keyword." },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "addToWatchlist",
      description: "Add a token to the user's watchlist.",
      parameters: {
        type: "object",
        properties: {
          address: { type: "string" },
          chain: chainEnum,
        },
        required: ["address"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "removeFromWatchlist",
      description: "Remove a token from the user's watchlist.",
      parameters: {
        type: "object",
        properties: {
          address: { type: "string" },
          chain: chainEnum,
        },
        required: ["address"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listWatchlist",
      description: "List all tokens currently in the user's watchlist.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getUserPortfolio",
      description:
        "Fetch SOL balance and token holdings for a Solana wallet. Defaults to the user's connected wallet; pass `walletAddress` to inspect a different one.",
      parameters: {
        type: "object",
        properties: {
          walletAddress: {
            type: "string",
            description:
              "Solana wallet address. Omit to use the user's connected wallet.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getJupiterQuote",
      description:
        "Preview a Jupiter swap quote — read-only, does NOT execute. Use to show the user expected output, price impact, and routing before any swap.",
      parameters: {
        type: "object",
        properties: {
          inputMint: {
            type: "string",
            description:
              "Input token mint or symbol (SOL, USDC, USDT are auto-resolved).",
          },
          outputMint: {
            type: "string",
            description: "Output token mint or symbol.",
          },
          amount: {
            type: "number",
            description: "Input amount in whole units (e.g. 0.5 = 0.5 SOL).",
          },
          slippageBps: {
            type: "integer",
            default: 50,
            description: "Slippage in basis points (50 = 0.5%).",
          },
        },
        required: ["inputMint", "outputMint", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "prepareSwap",
      description:
        "Prepare a Jupiter swap for the user to review and sign. Returns an inline trade card in the chat; the user must explicitly click Confirm & Sign in their wallet. You (the assistant) CANNOT execute the trade on your own — hard guard enforced. Only call when the user has expressed clear intent to swap.",
      parameters: {
        type: "object",
        properties: {
          inputMint: {
            type: "string",
            description:
              "Input token mint or symbol (SOL, USDC, USDT are auto-resolved).",
          },
          outputMint: {
            type: "string",
            description: "Output token mint or symbol.",
          },
          amount: {
            type: "number",
            description: "Input amount in whole units.",
          },
          slippageBps: {
            type: "integer",
            default: 50,
            description: "Slippage in basis points.",
          },
        },
        required: ["inputMint", "outputMint", "amount"],
      },
    },
  },
];

export const SENTINEL_CHAT_SYSTEM_PROMPT = `You are Sentinel, a conversational crypto analyst embedded in Centropolis — a Solana trading terminal.

ROLE:
- Help users analyze tokens, monitor watchlists, inspect portfolios, and prepare swaps.
- Be concise, direct, and numeric. Quote concrete figures when you cite them (price, liquidity, concentration %, score).
- Default chain is Solana. The user will rarely specify otherwise.

TOOL USAGE:
- Prefer \`getTokenSnapshot\` for cheap price/liquidity questions.
- Reserve \`analyzeToken\` for explicit user requests for deep analysis — it takes 10-20s and calls expensive AI pipelines.
- Before expensive tools, if the user named a token by symbol instead of address, call \`searchToken\` first and confirm the match with the user in one short sentence.
- When the user expresses swap intent, call \`prepareSwap\` — this shows an inline trade card. Do not claim the swap was executed; the user must sign in their wallet.
- If a tool fails, surface the error in one sentence and suggest the next step.

OUTPUT STYLE:
- Markdown. Use short paragraphs, bullet lists for 3+ items, and bold only for critical figures or warnings.
- Never dump JSON to the user unless they ask.
- When a tool returns data that will be rendered as an inline card (analysis, token snapshot, trade quote, etc.), your text should complement the card — interpret, summarize risk, suggest follow-ups. Don't repeat every field.
- If the user asks to "export" the conversation or an analysis, tell them to use the export button in the chat header.

SAFETY:
- Never recommend a swap without a fresh quote via \`prepareSwap\` or \`getJupiterQuote\`.
- Flag rug indicators, freeze authority, or mintability explicitly.
- If concentration > 50% among top holders, call it out.`;
