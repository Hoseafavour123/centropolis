"use client";

import type { ToolDisplay } from "@/services/ai/sentinelChat";
import { AnalysisCardDisplay } from "./AnalysisCardDisplay";
import { TokenCardDisplay } from "./TokenCardDisplay";
import { HoldersListDisplay } from "./HoldersListDisplay";
import { TxListDisplay } from "./TxListDisplay";
import { WatchlistDisplay } from "./WatchlistDisplay";
import { PortfolioDisplay } from "./PortfolioDisplay";
import { TradeQuoteCardDisplay } from "./TradeQuoteCardDisplay";
import { SearchResultsDisplay } from "./SearchResultsDisplay";

interface ToolDisplayCardProps {
  display: ToolDisplay;
}

export function ToolDisplayCard({ display }: ToolDisplayCardProps) {
  const { kind, payload } = display;
  switch (kind) {
    case "analysis_card":
      return <AnalysisCardDisplay payload={payload} />;
    case "token_card":
      return <TokenCardDisplay payload={payload} />;
    case "holders_list":
      return <HoldersListDisplay payload={payload} />;
    case "tx_list":
      return <TxListDisplay payload={payload} />;
    case "watchlist_card":
      return <WatchlistDisplay payload={payload} />;
    case "portfolio_card":
      return <PortfolioDisplay payload={payload} />;
    case "trade_quote_card":
      return <TradeQuoteCardDisplay payload={payload} />;
    case "search_results":
      return <SearchResultsDisplay payload={payload} />;
    case "text":
    default:
      return (
        <pre className="text-xs whitespace-pre-wrap break-words text-muted-foreground">
          {typeof payload === "string" ? payload : JSON.stringify(payload, null, 2)}
        </pre>
      );
  }
}
