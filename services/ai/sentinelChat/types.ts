export interface ToolContext {
  clerkId: string | null;
  dbUserId: string | null;
  chatId: string;
  userWalletAddress?: string;
}

export type ToolDisplayKind =
  | "analysis_card"
  | "token_card"
  | "holders_list"
  | "tx_list"
  | "watchlist_card"
  | "portfolio_card"
  | "trade_quote_card"
  | "search_results"
  | "text";

export interface ToolDisplay {
  kind: ToolDisplayKind;
  payload: any;
}

export interface ToolSideEffect {
  updateLastToken?: { address: string; chain: string };
}

export type ToolResult<T = unknown> =
  | { ok: true; data: T; display?: ToolDisplay; sideEffect?: ToolSideEffect }
  | { ok: false; error: string; display?: ToolDisplay };

export type ToolHandler<T = unknown> = (
  args: any,
  ctx: ToolContext
) => Promise<ToolResult<T>>;

export interface ToolSpec {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}
