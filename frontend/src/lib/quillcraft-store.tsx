import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { BotConfig, ChatMessage } from "@/lib/quillcraft-types";
import type { SessionQuestionAttempt } from "@/lib/session-improvement";

interface QuillCraftState {
  botConfig: BotConfig | null;
  botId: string | null;
  messages: ChatMessage[];
  configVersion: number;
  sessionAttempts: SessionQuestionAttempt[];
  auditMode: boolean;
  setAuditMode: (enabled: boolean) => void;
  setBotConfig: (config: BotConfig) => void;
  setBotId: (id: string) => void;
  updateBotConfig: (updater: (prev: BotConfig | null) => BotConfig | null) => void;
  markBotEdited: () => void;
  recordSessionAttempt: (attempt: SessionQuestionAttempt) => void;
  setMessages: (messages: ChatMessage[]) => void;
  appendMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  resetBot: () => void; // New function to reset for creating new bot
}

const QuillCraftContext = createContext<QuillCraftState | undefined>(undefined);

export function QuillCraftProvider({ children }: { children: ReactNode }) {
  const [botConfig, setBotConfigState] = useState<BotConfig | null>(null);
  const [botId, setBotIdState] = useState<string | null>(null);
  const [messages, setMessagesState] = useState<ChatMessage[]>([]);
  const [configVersion, setConfigVersion] = useState<number>(1);
  const [sessionAttempts, setSessionAttempts] = useState<SessionQuestionAttempt[]>([]);
  const [auditMode, setAuditMode] = useState<boolean>(false);

  const value = useMemo<QuillCraftState>(
    () => ({
      botConfig,
      botId,
      messages,
      configVersion,
      sessionAttempts,
      auditMode,
      setAuditMode,
      setBotConfig: (config) => setBotConfigState(config),
      setBotId: (id) => setBotIdState(id),
      updateBotConfig: (updater) => {
        setBotConfigState((prev) => updater(prev));
        setConfigVersion((prev) => prev + 1);
      },
      markBotEdited: () => setConfigVersion((prev) => prev + 1),
      recordSessionAttempt: (attempt) => setSessionAttempts((prev) => [...prev, attempt]),
      setMessages: (nextMessages) => setMessagesState(nextMessages),
      appendMessage: (message) => setMessagesState((prev) => [...prev, message]),
      clearMessages: () => setMessagesState([]),
      resetBot: () => {
        setBotConfigState(null);
        setBotIdState(null);
        setMessagesState([]);
        setConfigVersion(1);
        setSessionAttempts([]);
        setAuditMode(false);
      },
    }),
    [botConfig, botId, messages, configVersion, sessionAttempts, auditMode],
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
