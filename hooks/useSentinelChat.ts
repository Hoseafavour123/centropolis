"use client";

import { useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useSentinelChatStore,
  type ChatMessage,
  type ChatSummary,
  type StoredToolCall,
} from "@/store/useSentinelChatStore";
import type { ToolDisplay } from "@/services/ai/sentinelChat";

const API_BASE = "/api/sentinel-chat";
const CHAT_LIST_KEY = ["sentinel-chat", "list"] as const;

type ServerChatMessage = {
  id: string;
  role: string;
  content: string | null;
  toolCalls: unknown;
  toolCallId: string | null;
  toolName: string | null;
  createdAt: string;
};

function normalizeMessage(m: ServerChatMessage): ChatMessage {
  const role = (m.role as ChatMessage["role"]) ?? "assistant";
  // Assistant role uses `toolCalls` as an array of {id, name, arguments}.
  // Tool role re-uses the same Json column to carry an envelope { display }
  // so the UI can re-render inline cards (trade quote, analysis, …) on reload.
  let toolCalls: StoredToolCall[] | null = null;
  let display: ToolDisplay | null = null;
  if (role === "assistant" && Array.isArray(m.toolCalls)) {
    toolCalls = m.toolCalls as StoredToolCall[];
  } else if (
    role === "tool" &&
    m.toolCalls &&
    typeof m.toolCalls === "object" &&
    !Array.isArray(m.toolCalls)
  ) {
    const env = m.toolCalls as { display?: ToolDisplay | null };
    display = env.display ?? null;
  }
  return {
    id: m.id,
    role,
    content: m.content,
    toolCalls,
    toolCallId: m.toolCallId,
    toolName: m.toolName,
    display,
    createdAt: m.createdAt,
  };
}

type SSEEvent =
  | { type: "message_saved"; payload: { role: string; id?: string } }
  | { type: "text_delta"; payload: { text: string } }
  | { type: "tool_call"; payload: { id: string; name: string; arguments: unknown } }
  | {
      type: "tool_result";
      payload: {
        id: string;
        name: string;
        ok: boolean;
        display: ToolDisplay | null;
        error?: string;
      };
    }
  | { type: "done" }
  | { type: "error"; payload: { message: string } };

export function useSentinelChat() {
  const queryClient = useQueryClient();
  const store = useSentinelChatStore();
  const abortRef = useRef<AbortController | null>(null);
  const lastInputRef = useRef<{
    chatId: string;
    content: string;
    walletAddress?: string;
  } | null>(null);

  const chatsQuery = useQuery({
    queryKey: CHAT_LIST_KEY,
    queryFn: async (): Promise<ChatSummary[]> => {
      const res = await fetch(`${API_BASE}/chats`);
      if (!res.ok) throw new Error(`Failed to load chats: ${res.status}`);
      const json = await res.json();
      const chats = (json.chats ?? []) as ChatSummary[];
      store.setChats(chats);
      return chats;
    },
  });

  const createChat = useCallback(
    async (title?: string): Promise<ChatSummary> => {
      const res = await fetch(`${API_BASE}/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(title ? { title } : {}),
      });
      if (!res.ok) throw new Error(`Failed to create chat: ${res.status}`);
      const { chat } = await res.json();
      store.upsertChat(chat);
      queryClient.invalidateQueries({ queryKey: CHAT_LIST_KEY });
      return chat as ChatSummary;
    },
    [queryClient, store]
  );

  const renameChat = useCallback(
    async (chatId: string, title: string): Promise<void> => {
      store.renameChatLocal(chatId, title);
      const res = await fetch(`${API_BASE}/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        queryClient.invalidateQueries({ queryKey: CHAT_LIST_KEY });
        throw new Error(`Failed to rename chat: ${res.status}`);
      }
      queryClient.invalidateQueries({ queryKey: CHAT_LIST_KEY });
    },
    [queryClient, store]
  );

  const deleteChat = useCallback(
    async (chatId: string): Promise<void> => {
      store.removeChat(chatId);
      const res = await fetch(`${API_BASE}/chats/${chatId}`, { method: "DELETE" });
      if (!res.ok) {
        queryClient.invalidateQueries({ queryKey: CHAT_LIST_KEY });
        throw new Error(`Failed to delete chat: ${res.status}`);
      }
      queryClient.invalidateQueries({ queryKey: CHAT_LIST_KEY });
    },
    [queryClient, store]
  );

  const loadChat = useCallback(
    async (chatId: string): Promise<void> => {
      store.setActiveChatId(chatId);
      const res = await fetch(`${API_BASE}/chats/${chatId}/messages`);
      if (!res.ok) throw new Error(`Failed to load chat: ${res.status}`);
      const json = await res.json();
      const messages = (json.messages ?? []).map(normalizeMessage) as ChatMessage[];
      store.setMessages(messages);
      if (json.chat) store.upsertChat(json.chat);
    },
    [store]
  );

  const exportChat = useCallback(async (chatId: string) => {
    try {
      const res = await fetch(`${API_BASE}/chats/${chatId}/export`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to export chat: ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const contentDisposition = res.headers.get("Content-Disposition");
      let filename = `sentinel-chat-export.json`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err.message || "Failed to export chat");
    }
  }, []);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const sendMessage = useCallback(
    async (
      chatId: string,
      content: string,
      opts?: { walletAddress?: string }
    ): Promise<void> => {
      const trimmed = content.trim();
      if (!trimmed) return;

      lastInputRef.current = {
        chatId,
        content: trimmed,
        walletAddress: opts?.walletAddress,
      };

      const optimisticUser: ChatMessage = {
        id: `tmp-user-${Date.now()}`,
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      store.appendMessage(optimisticUser);
      store.beginStream();

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: trimmed,
            ...(opts?.walletAddress ? { walletAddress: opts.walletAddress } : {}),
          }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          let errMsg = `Stream failed: ${res.status}`;
          try {
            const errData = await res.json();
            if (errData?.error) errMsg = errData.error;
          } catch {}
          throw new Error(errMsg);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let sepIdx = buffer.indexOf("\n\n");
          while (sepIdx !== -1) {
            const rawEvent = buffer.slice(0, sepIdx);
            buffer = buffer.slice(sepIdx + 2);
            sepIdx = buffer.indexOf("\n\n");

            const line = rawEvent.split("\n").find((l) => l.startsWith("data:"));
            if (!line) continue;
            const data = line.slice(5).trim();
            if (!data) continue;
            let evt: SSEEvent;
            try {
              evt = JSON.parse(data) as SSEEvent;
            } catch {
              continue;
            }
            handleEvent(evt);
          }
        }
        store.finishStream();
        // Reload chat to reconcile with persisted DB state (ids, tool calls)
        await loadChat(chatId);
        queryClient.invalidateQueries({ queryKey: CHAT_LIST_KEY });
      } catch (err: any) {
        if (err?.name === "AbortError") {
          store.finishStream();
          return;
        }
        store.failStream(err?.message || "Chat request failed");
        throw err;
      } finally {
        abortRef.current = null;
      }
    },
    [loadChat, queryClient, store]
  );

  const retryLastMessage = useCallback(async (): Promise<void> => {
    const last = lastInputRef.current;
    if (!last) return;
    await sendMessage(last.chatId, last.content, {
      walletAddress: last.walletAddress,
    });
  }, [sendMessage]);

  function handleEvent(evt: SSEEvent) {
    switch (evt.type) {
      case "message_saved":
        break;
      case "text_delta":
        store.appendStreamingText(evt.payload.text);
        break;
      case "tool_call":
        store.recordToolCall({
          id: evt.payload.id,
          name: evt.payload.name,
          arguments: evt.payload.arguments,
        });
        break;
      case "tool_result":
        store.recordToolResult({
          id: evt.payload.id,
          name: evt.payload.name,
          ok: evt.payload.ok,
          display: evt.payload.display,
          error: evt.payload.error,
        });
        break;
      case "done":
        store.finishStream();
        break;
      case "error":
        store.failStream(evt.payload.message);
        break;
    }
  }

  return {
    // query
    chats: store.chats,
    chatsLoading: chatsQuery.isLoading,
    chatsError: chatsQuery.error as Error | null,
    refetchChats: chatsQuery.refetch,

    // state
    activeChatId: store.activeChatId,
    messages: store.messages,
    streamingAssistantText: store.streamingAssistantText,
    streamingToolCalls: store.streamingToolCalls,
    streamingToolOrder: store.streamingToolOrder,
    status: store.status,
    error: store.error,

    // actions
    createChat,
    renameChat,
    deleteChat,
    loadChat,
    exportChat,
    sendMessage,
    cancelStream,
    retryLastMessage,
  };
}
