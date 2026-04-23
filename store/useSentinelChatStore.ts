import { create } from "zustand";
import type { ToolDisplay } from "@/services/ai/sentinelChat";

export interface ChatSummary {
  id: string;
  title: string;
  lastTokenAddress: string | null;
  lastTokenChain: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredToolCall {
  id: string;
  name: string;
  arguments: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string | null;
  toolCalls?: StoredToolCall[] | null;
  toolCallId?: string | null;
  toolName?: string | null;
  /** Tool-role messages may carry the rendered display payload from the server. */
  display?: ToolDisplay | null;
  createdAt: string;
  pending?: boolean;
}

export type ToolCallStatus = "running" | "done" | "error";

export interface StreamingToolCall {
  id: string;
  name: string;
  arguments?: unknown;
  display?: ToolDisplay | null;
  ok?: boolean;
  error?: string;
  status: ToolCallStatus;
}

export type StreamStatus = "idle" | "streaming" | "error";

interface SentinelChatState {
  chats: ChatSummary[];
  activeChatId: string | null;
  messages: ChatMessage[];
  streamingAssistantText: string;
  streamingToolCalls: Record<string, StreamingToolCall>;
  streamingToolOrder: string[];
  status: StreamStatus;
  error: string | null;

  setChats: (chats: ChatSummary[]) => void;
  upsertChat: (chat: ChatSummary) => void;
  removeChat: (chatId: string) => void;
  renameChatLocal: (chatId: string, title: string) => void;

  setActiveChatId: (chatId: string | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  appendMessage: (message: ChatMessage) => void;

  beginStream: () => void;
  appendStreamingText: (text: string) => void;
  recordToolCall: (tc: { id: string; name: string; arguments?: unknown }) => void;
  recordToolResult: (r: {
    id: string;
    name: string;
    ok: boolean;
    display?: ToolDisplay | null;
    error?: string;
  }) => void;
  finishStream: () => void;
  failStream: (err: string) => void;
  resetStreaming: () => void;
}

export const useSentinelChatStore = create<SentinelChatState>((set) => ({
  chats: [],
  activeChatId: null,
  messages: [],
  streamingAssistantText: "",
  streamingToolCalls: {},
  streamingToolOrder: [],
  status: "idle",
  error: null,

  setChats: (chats) => set({ chats }),
  upsertChat: (chat) =>
    set((s) => {
      const existing = s.chats.findIndex((c) => c.id === chat.id);
      if (existing === -1) return { chats: [chat, ...s.chats] };
      const next = s.chats.slice();
      next[existing] = { ...next[existing], ...chat };
      return { chats: next };
    }),
  removeChat: (chatId) =>
    set((s) => ({
      chats: s.chats.filter((c) => c.id !== chatId),
      activeChatId: s.activeChatId === chatId ? null : s.activeChatId,
      messages: s.activeChatId === chatId ? [] : s.messages,
    })),
  renameChatLocal: (chatId, title) =>
    set((s) => ({
      chats: s.chats.map((c) => (c.id === chatId ? { ...c, title } : c)),
    })),

  setActiveChatId: (chatId) =>
    set({
      activeChatId: chatId,
      messages: [],
      streamingAssistantText: "",
      streamingToolCalls: {},
      streamingToolOrder: [],
      status: "idle",
      error: null,
    }),
  setMessages: (messages) => set({ messages }),
  appendMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),

  beginStream: () =>
    set({
      streamingAssistantText: "",
      streamingToolCalls: {},
      streamingToolOrder: [],
      status: "streaming",
      error: null,
    }),
  appendStreamingText: (text) =>
    set((s) => ({ streamingAssistantText: s.streamingAssistantText + text })),
  recordToolCall: (tc) =>
    set((s) => {
      const existed = !!s.streamingToolCalls[tc.id];
      return {
        streamingToolCalls: {
          ...s.streamingToolCalls,
          [tc.id]: {
            id: tc.id,
            name: tc.name,
            arguments: tc.arguments,
            status: "running",
          },
        },
        streamingToolOrder: existed
          ? s.streamingToolOrder
          : [...s.streamingToolOrder, tc.id],
      };
    }),
  recordToolResult: ({ id, name, ok, display, error }) =>
    set((s) => {
      const prev = s.streamingToolCalls[id];
      return {
        streamingToolCalls: {
          ...s.streamingToolCalls,
          [id]: {
            id,
            name,
            arguments: prev?.arguments,
            display: display ?? null,
            ok,
            error,
            status: ok ? "done" : "error",
          },
        },
      };
    }),
  finishStream: () => set({ status: "idle" }),
  failStream: (err) => set({ status: "error", error: err }),
  resetStreaming: () =>
    set({
      streamingAssistantText: "",
      streamingToolCalls: {},
      streamingToolOrder: [],
      status: "idle",
      error: null,
    }),
}));
