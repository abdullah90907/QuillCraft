export type AnswerStyle = "hints-first" | "direct-answers";

// Frontend BotConfig
export interface BotConfig {
  botName: string;
  roleSubject: string;
  personality: string;
  answerStyle: AnswerStyle;
  rules: string;
}

// Backend BotConfig (different field names)
export interface BackendBotConfig {
  name: string;
  role: string;
  personality: string;
  answer_style: string;
  rules: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  confidence?: number;
  createdAt: number;
}

export interface CreateBotResponse {
  bot_id: string;
  message: string;
}

export interface BackendChatRequest {
  bot_id: string;
  message: string;
}

export interface BackendChatResponse {
  reply: string;
  confidence: string; // Backend returns a string like "Confidence: XX% - ..."
}

// Legacy types for existing code
export interface ChatRequest {
  config: BotConfig;
  history: ChatMessage[];
  userMessage: string;
}

export interface ChatResponse {
  reply: string;
  confidence: number;
}
