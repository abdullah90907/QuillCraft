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

export interface ModelComparisonResult {
  name: string;
  reply?: string | null;
  confidence?: number | null;
  reason?: string | null;
  error?: boolean;
}

export interface ChatCompareResponse {
  model_a: ModelComparisonResult;
  model_b: ModelComparisonResult;
}

export interface ChatCompareRequest {
  bot_id: string;
  message: string;
  model_a?: string;
  model_b?: string;
}

export interface FactCheckRequest {
  message_text: string;
}

export interface FactCheckResponse {
  verdict: string;
  explanation: string;
  error?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  confidence?: number;
  confidenceSource?: "ai" | "fallback_random";
  confidenceReason?: string;
  createdAt: number;
  isComparison?: boolean;
  comparison?: ChatCompareResponse;
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
  confidence_reason?: string;
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
  confidenceReason?: string;
}
