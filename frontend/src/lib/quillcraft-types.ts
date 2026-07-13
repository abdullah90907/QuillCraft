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
  confidenceSource?: "ai" | "fallback_random";
  createdAt: number;
}

export interface CreateBotResponse {
  bot_id: string;
  message: string;
}

export interface BackendChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BackendChatRequest {
  bot_id: string;
  message: string;
  history: BackendChatMessage[];
}

export interface BackendChatResponse {
  reply: string;
  confidence: number;
  confidence_source: "ai" | "fallback_random";
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
  confidenceSource: "ai" | "fallback_random";
}
