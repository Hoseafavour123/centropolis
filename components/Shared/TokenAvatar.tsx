"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// Deterministic colour from symbol string
function symbolColor(symbol: string): string {
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
    "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
    "#a855f7", "#f97316", "#06b6d4", "#84cc16",
  ];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++)
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const SIZE_MAP = {
  xs:  "w-6  h-6  text-[8px]",
  sm:  "w-8  h-8  text-[10px]",
  md:  "w-10 h-10 text-xs",
  lg:  "w-12 h-12 text-sm",
  xl:  "w-16 h-16 text-2xl",
} as const;

interface TokenAvatarProps {
  /** URL of the token logo (from DexScreener / Helius / Jupiter etc.) */
  logoUrl?: string | null;
  /** Token ticker, used for the fallback letter avatar */
  symbol: string;
  size?: keyof typeof SIZE_MAP;
  className?: string;
}

/**
 * TokenAvatar
 *
 * Renders the token's actual logo image when available.
 * Falls back gracefully to a coloured letter-circle on error or when no URL
 * is provided — so the UI never shows a broken <img> tag.
 */
export function TokenAvatar({
  logoUrl,
  symbol,
  size = "md",
  className,
}: TokenAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClass = SIZE_MAP[size];
  const bg = symbolColor(symbol);
  const initials = (symbol || "?").slice(0, size === "xl" ? 1 : 3).toUpperCase();

  // Show image when we have a URL and it hasn't errored
  const showImage = !!logoUrl && !imgError;

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center shrink-0 overflow-hidden font-bold text-white",
        sizeClass,
        className
      )}
      style={showImage ? undefined : { background: bg }}
    >
      {showImage ? (
        // Using <img> instead of Next <Image> to avoid needing exact dimensions
        // and to support all CDN domains without width/height props.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl!}
          alt={`${symbol} logo`}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
