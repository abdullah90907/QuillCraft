import type {
  AnswerStyle,
  BotConfig,
  BackendBotConfig,
  CreateBotResponse,
  BackendChatRequest,
  ChatMessage as FrontendChatMessage,
  ChatCompareResponse,
  FactCheckResponse,
  ProbeType,
  GenerateProbeResponse,
} from "@/lib/quillcraft-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Backend chat response now has confidence as number
import type { BackendChatResponse as BackendChatResponseType } from "@/lib/quillcraft-types";

export function backendAnswerStyleToFrontend(answerStyle: string | undefined | null): AnswerStyle {
  return answerStyle === "hints" ? "hints-first" : "direct-answers";
}

export function frontendAnswerStyleToBackend(answerStyle: AnswerStyle): "hints" | "direct" {
  return answerStyle === "hints-first" ? "hints" : "direct";
}

export async function createBot(config: BotConfig): Promise<CreateBotResponse> {
  // Convert frontend config to backend format
  const backendConfig: BackendBotConfig = {
    name: config.botName,
    role: config.roleSubject,
    personality: config.personality,
    answer_style: frontendAnswerStyleToBackend(config.answerStyle),
    rules: config.rules,
  };

  const response = await fetch(`${API_BASE_URL}/api/v1/bot`, {
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
  const response = await fetch(`${API_BASE_URL}/api/v1/bot`);
  if (!response.ok) {
    throw new Error("Failed to fetch bots");
  }
  return response.json();
}

export async function getBot(botId: string): Promise<BotConfig> {
  const response = await fetch(`${API_BASE_URL}/api/v1/bot/${botId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch bot");
  }
  const botData = await response.json();
  return {
    botName: botData.name,
    roleSubject: botData.role,
    personality: botData.personality,
    answerStyle: backendAnswerStyleToFrontend(botData.answer_style),
    rules: botData.rules,
  };
}

export async function getMessagesForBot(botId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/bot/${botId}/messages`);
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  return response.json();
}

export async function clearMessagesForBot(botId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/bot/${botId}/messages`, {
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
    answer_style: frontendAnswerStyleToBackend(config.answerStyle),
    rules: config.rules,
  };

  const response = await fetch(`${API_BASE_URL}/api/v1/bot/${botId}`, {
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
  const response = await fetch(`${API_BASE_URL}/api/v1/bot/${botId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete bot");
  }
}

export async function sendChatMessage(
  botId: string,
  message: string,
  history: FrontendChatMessage[],
  auditMode?: boolean,
  model?: string
): Promise<{ reply: string; confidence: number; confidenceSource: "ai" | "fallback_random"; confidenceReason?: string }> {
  // Convert frontend history to backend format
  const backendHistory = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const request: BackendChatRequest = {
    bot_id: botId,
    message,
    history: backendHistory,
    audit_mode: Boolean(auditMode),
    ...(model ? { model } : {}),
  };

  const response = await fetch(`${API_BASE_URL}/api/v1/bot/chat`, {
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
    confidenceReason: data.confidence_reason,
  };
}

export async function compareChatModels(
  botId: string,
  message: string,
  modelA?: string,
  modelB?: string,
  auditMode?: boolean,
  history?: FrontendChatMessage[]
): Promise<ChatCompareResponse> {
  const backendHistory = history
    ? history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
    : undefined;

  const payload = {
    bot_id: botId,
    message,
    ...(modelA ? { model_a: modelA } : {}),
    ...(modelB ? { model_b: modelB } : {}),
    audit_mode: Boolean(auditMode),
    ...(backendHistory ? { history: backendHistory } : {}),
  };

  // Try root /chat/compare first, fallback to /api/v1/bot/chat/compare if needed
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/chat/compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok && response.status === 404) {
      response = await fetch(`${API_BASE_URL}/api/v1/bot/chat/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }
  } catch (err) {
    // If root path fails with network error, try the api prefix
    response = await fetch(`${API_BASE_URL}/api/v1/bot/chat/compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to compare models");
  }

  return response.json();
}

export async function factCheckMessage(messageText: string): Promise<FactCheckResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/fact-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message_text: messageText }),
    });

    if (!response.ok && response.status === 404) {
      response = await fetch(`${API_BASE_URL}/api/v1/bot/fact-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message_text: messageText }),
      });
    }
  } catch (err) {
    response = await fetch(`${API_BASE_URL}/api/v1/bot/fact-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message_text: messageText }),
    });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fact check message");
  }

  return response.json();
}

export async function generateProbeQuestion(botId: string, probeType: ProbeType): Promise<string> {
  const payload = { probe_type: probeType };
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/bot/${botId}/generate-probe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok && response.status === 404) {
      response = await fetch(`${API_BASE_URL}/bot/${botId}/generate-probe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }
  } catch (err) {
    response = await fetch(`${API_BASE_URL}/bot/${botId}/generate-probe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to generate probe question");
  }

  const data: GenerateProbeResponse = await response.json();
  return data.question;
}

