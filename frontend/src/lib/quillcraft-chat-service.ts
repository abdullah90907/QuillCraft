import type { ChatRequest, ChatResponse } from "@/lib/quillcraft-types";

export interface ChatGateway {
  sendMessage: (payload: ChatRequest) => Promise<ChatResponse>;
}

const mockReplies = [
  "Great start. Before jumping to the answer, what concept from the prompt can you restate in your own words?",
  "You're close. Try breaking the problem into two smaller steps and test each step separately.",
  "Nice reasoning. If this were an exam, I would write a short outline first, then fill in details.",
  "Think of this as a pattern: identify inputs, apply the rule, then verify with a quick check.",
];

function pickMockReply(userMessage: string) {
  const index = userMessage.length % mockReplies.length;
  return mockReplies[index] ?? mockReplies[0];
}

export const mockChatGateway: ChatGateway = {
  async sendMessage(payload) {
    await new Promise((resolve) => setTimeout(resolve, 900));

    const prefixedReply =
      payload.config.answerStyle === "direct-answers"
        ? "Direct answer: "
        : "Hint-first coaching: ";

    return {
      reply: `${prefixedReply}${pickMockReply(payload.userMessage)}`,
      confidence: Math.min(99, Math.max(72, 82 + (payload.history.length % 12))),
      confidenceSource: "ai",
    };
  },
};

/**
 * Backend-ready boundary:
 * swap this implementation to call the existing FastAPI `/chat` endpoint later.
 */
export const quillcraftChatGateway: ChatGateway = mockChatGateway;
