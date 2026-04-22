"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, MessageSquare, Pencil, Download, Trash2, X } from "lucide-react";
import type { ChatSummary } from "@/store/useSentinelChatStore";

interface Props {
  chats: ChatSummary[];
  activeChatId: string | null;
  loading?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}

export function ChatSidebar({
  chats,
  activeChatId,
  loading,
  mobileOpen,
  onMobileClose,
  onNewChat,
  onSelect,
  onRename,
  onDelete,
  onExport,
}: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <>
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={onMobileClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "w-64 shrink-0 border-r border-border bg-muted/10 flex flex-col",
          "md:static md:translate-x-0",
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="md:hidden flex items-center justify-end px-2 pt-2">
          <button
            type="button"
            onClick={onMobileClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted/60"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      <div className="p-3 border-b border-border">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium py-2 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-1 py-2">
        {loading && chats.length === 0 ? (
          <div className="px-3 py-6 text-xs text-muted-foreground text-center">Loading…</div>
        ) : chats.length === 0 ? (
          <div className="px-3 py-6 text-xs text-muted-foreground text-center">
            No chats yet. Click &ldquo;New chat&rdquo; to start.
          </div>
        ) : (
          <ul className="space-y-0.5">
            {chats.map((c) => {
              const active = c.id === activeChatId;
              return (
                <li key={c.id}>
                  <div
                    className={cn(
                      "group flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors",
                      active ? "bg-primary/10 text-primary" : "hover:bg-muted/40 text-foreground/80"
                    )}
                    onClick={() => onSelect(c.id)}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1 min-w-0 truncate">{c.title || "Untitled"}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "shrink-0 inline-flex items-center justify-center w-6 h-6 rounded hover:bg-muted/60 transition-all",
                            active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )}
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onSelect={() => onRename(c.id)}>
                          <Pencil className="w-3.5 h-3.5" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onExport(c.id)}>
                          <Download className="w-3.5 h-3.5" />
                          Export JSON
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => setConfirmId(c.id)}
                          className="text-rose-400 focus:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

        {confirmId && (
          <DeleteConfirm
            onConfirm={() => {
              onDelete(confirmId);
              setConfirmId(null);
            }}
            onCancel={() => setConfirmId(null)}
          />
        )}
      </aside>
    </>
  );
}

function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="rounded-lg border border-border bg-card p-4 w-full max-w-xs space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-sm font-semibold">Delete chat?</div>
        <p className="text-xs text-muted-foreground">This will remove the chat from your history.</p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted hover:bg-muted/80"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-rose-500 text-white hover:bg-rose-500/90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
