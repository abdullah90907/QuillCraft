import type {
  BotConfig,
  BackendBotConfig,
  CreateBotResponse,
  BackendChatRequest,
} from "@/lib/quillcraft-types";

const API_BASE_URL = "/api"; // Using Vite proxy

// Backend chat response now has confidence as number
interface BackendChatResponse {
  reply: string;
  confidence: number;
}

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

export async function sendChatMessage(botId: string, message: string): Promise<{ reply: string; confidence: number }> {
  const request: BackendChatRequest = {
    bot_id: botId,
    message,
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

  const data: BackendChatResponse = await response.json();
  console.log("Received chat response:", data);

  return {
    reply: data.reply,
    confidence: data.confidence,
  };
}
