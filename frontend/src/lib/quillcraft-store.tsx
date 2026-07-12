import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { BotConfig, ChatMessage } from "@/lib/quillcraft-types";

interface QuillCraftState {
  botConfig: BotConfig | null;
  botId: string | null;
  messages: ChatMessage[];
  setBotConfig: (config: BotConfig) => void;
  setBotId: (id: string) => void;
  updateBotConfig: (updater: (prev: BotConfig | null) => BotConfig | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  appendMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}

const QuillCraftContext = createContext<QuillCraftState | undefined>(undefined);

export function QuillCraftProvider({ children }: { children: ReactNode }) {
  const [botConfig, setBotConfigState] = useState<BotConfig | null>(null);
  const [botId, setBotIdState] = useState<string | null>(null);
  const [messages, setMessagesState] = useState<ChatMessage[]>([]);

  const value = useMemo<QuillCraftState>(
    () => ({
      botConfig,
      botId,
      messages,
      setBotConfig: (config) => setBotConfigState(config),
      setBotId: (id) => setBotIdState(id),
      updateBotConfig: (updater) => setBotConfigState((prev) => updater(prev)),
      setMessages: (nextMessages) => setMessagesState(nextMessages),
      appendMessage: (message) => setMessagesState((prev) => [...prev, message]),
      clearMessages: () => setMessagesState([]),
    }),
    [botConfig, botId, messages],
  );

  return <QuillCraftContext.Provider value={value}>{children}</QuillCraftContext.Provider>;
}

export function useQuillCraftStore() {
  const context = useContext(QuillCraftContext);
  if (!context) {
    throw new Error("useQuillCraftStore must be used inside QuillCraftProvider");
  }
  return context;
}
