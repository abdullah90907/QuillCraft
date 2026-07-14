import type {
  BotConfig,
  BackendBotConfig,
  CreateBotResponse,
  BackendChatRequest,
  ChatMessage as FrontendChatMessage,
} from "@/lib/quillcraft-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Backend chat response now has confidence as number
import type { BackendChatResponse as BackendChatResponseType } from "@/lib/quillcraft-types";

export async function createBot(config: BotConfig): Promise<CreateBotResponse> {
  // Convert frontend config to backend format
  const backendConfig: BackendBotConfig = {
    name: config.botName,
    role: config.roleSubject,
    personality: config.personality,
    answer_style: config.answerStyle === "hints-first" ? "hints" : "direct",
    rules: config.rules,
  };

  const response = await fetch(`${API_BASE_URL}/v1/bot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(backendConfig),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create bot");
  }

  return response.json();
}

export async function getAllBots(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/v1/bot`);
  if (!response.ok) {
    throw new Error("Failed to fetch bots");
  }
  return response.json();
}

export async function getBot(botId: string): Promise<BotConfig> {
  const response = await fetch(`${API_BASE_URL}/v1/bot/${botId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch bot");
  }
  return response.json();
}

export async function getMessagesForBot(botId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/v1/bot/${botId}/messages`);
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  return response.json();
}

export async function clearMessagesForBot(botId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/v1/bot/${botId}/messages`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to clear messages");
  }
}

export async function updateBot(botId: string, config: BotConfig): Promise<void> {
  // Convert frontend config to backend format
  const backendConfig: BackendBotConfig = {
    name: config.botName,
    role: config.roleSubject,
    personality: config.personality,
    answer_style: config.answerStyle === "hints-first" ? "hints" : "direct",
    rules: config.rules,
  };

  const response = await fetch(`${API_BASE_URL}/v1/bot/${botId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(backendConfig),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to update bot");
  }
}

export async function deleteBot(botId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/v1/bot/${botId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete bot");
  }
}

export async function sendChatMessage(botId: string, message: string, history: FrontendChatMessage[]): Promise<{ reply: string; confidence: number; confidenceSource: "ai" | "fallback_random" }> {
  // Convert frontend history to backend format
  const backendHistory = history.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  const request: BackendChatRequest = {
    bot_id: botId,
    message,
    history: backendHistory,
  };

  const response = await fetch(`${API_BASE_URL}/v1/bot/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to send message");
  }

  const data: BackendChatResponseType = await response.json();
  console.log("Received chat response:", data);

  return {
    reply: data.reply,
    confidence: data.confidence,
    confidenceSource: data.confidence_source,
  };
}
