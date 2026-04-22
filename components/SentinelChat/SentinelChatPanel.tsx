"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Bot, Download, Menu } from "lucide-react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import { useSentinelChat } from "@/hooks/useSentinelChat";
import { useWalletStore } from "@/store/useWalletStore";

export function SentinelChatPanel() {
  const {
    chats,
    chatsLoading,
    activeChatId,
    messages,
    streamingAssistantText,
    streamingToolCalls,
    streamingToolOrder,
    status,
    error,
    createChat,
    renameChat,
    deleteChat,
    loadChat,
    exportChat,
    sendMessage,
    cancelStream,
    retryLastMessage,
  } = useSentinelChat();

  const walletAddress = useWalletStore((s) => s.walletAddress ?? undefined);

  const [initialized, setInitialized] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // On first mount: if chats exist, load most recent; otherwise create one.
  useEffect(() => {
    if (initialized) return;
    if (chatsLoading) return;
    if (activeChatId) {
      setInitialized(true);
      return;
    }
    (async () => {
      try {
        if (chats.length > 0) {
          await loadChat(chats[0].id);
        } else {
          const chat = await createChat();
          await loadChat(chat.id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setInitialized(true);
      }
    })();
  }, [initialized, chatsLoading, activeChatId, chats, loadChat, createChat]);

  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeChatId) || null,
    [chats, activeChatId]
  );

  const handleNewChat = useCallback(async () => {
    try {
      const chat = await createChat();
      await loadChat(chat.id);
    } catch (e: any) {
      toast.error(e?.message || "Failed to create chat");
    }
  }, [createChat, loadChat]);

  const handleSelect = useCallback(
    async (id: string) => {
      setMobileSidebarOpen(false);
      if (id === activeChatId) return;
      try {
        await loadChat(id);
      } catch (e: any) {
        toast.error(e?.message || "Failed to open chat");
      }
    },
    [activeChatId, loadChat]
  );

  const handleRename = useCallback(
    async (id: string) => {
      const current = chats.find((c) => c.id === id);
      const next = window.prompt("Rename chat", current?.title || "");
      if (!next) return;
      try {
        await renameChat(id, next);
      } catch (e: any) {
        toast.error(e?.message || "Failed to rename chat");
      }
    },
    [chats, renameChat]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteChat(id);
        toast.success("Chat deleted");
        // If we deleted the active one, pick next or create fresh
        if (id === activeChatId) {
          const remaining = chats.filter((c) => c.id !== id);
          if (remaining.length > 0) await loadChat(remaining[0].id);
          else {
            const chat = await createChat();
            await loadChat(chat.id);
          }
        }
      } catch (e: any) {
        toast.error(e?.message || "Failed to delete chat");
      }
    },
    [activeChatId, chats, createChat, deleteChat, loadChat]
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!activeChatId) {
        toast.error("No active chat");
        return;
      }
      try {
        await sendMessage(activeChatId, text, { walletAddress });
      } catch (e: any) {
        toast.error(e?.message || "Failed to send");
      }
    },
    [activeChatId, sendMessage, walletAddress]
  );

  const handleRetry = useCallback(async () => {
    try {
      await retryLastMessage();
    } catch (e: any) {
      toast.error(e?.message || "Retry failed");
    }
  }, [retryLastMessage]);

  return (
    <div className="flex h-[75vh] min-h-[540px] overflow-hidden rounded-xl border border-border bg-background">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        loading={chatsLoading}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onNewChat={async () => {
          await handleNewChat();
          setMobileSidebarOpen(false);
        }}
        onSelect={handleSelect}
        onRename={handleRename}
        onDelete={handleDelete}
        onExport={exportChat}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-4 py-2.5 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted/60"
              aria-label="Open chat list"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {activeChat?.title || "Sentinel Chat"}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {status === "streaming" ? "Thinking…" : "Ready"}
              </div>
            </div>
          </div>
          {activeChatId && (
            <button
              type="button"
              onClick={() => exportChat(activeChatId)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Export JSON"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          )}
        </header>

        <ChatMessageList
          messages={messages}
          streamingText={streamingAssistantText}
          streamingToolCalls={streamingToolCalls}
          streamingToolOrder={streamingToolOrder}
          status={status}
          error={error}
          onRetry={handleRetry}
        />

        <ChatInput
          onSend={handleSend}
          onCancel={cancelStream}
          streaming={status === "streaming"}
          disabled={!activeChatId}
        />
      </main>
    </div>
  );
}
