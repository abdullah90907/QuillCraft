from typing import Literal
from pydantic import BaseModel, Field


class BotConfig(BaseModel):
    name: str = Field(..., description="Bot name", example="Math Tutor")
    role: str = Field(..., description="Subject or topic the bot helps with", example="fractions")
    personality: str = Field(..., description="How the bot should behave", example="patient and encouraging")
    answer_style: str = Field(..., description="Must be either 'hints' or 'direct'", example="hints")
    rules: str = Field(..., description="Specific instructions the bot must follow", example="Always start with a friendly greeting")


class CreateBotResponse(BaseModel):
    bot_id: str = Field(..., description="Unique identifier for the created bot", example="bot-123")
    message: str = Field(..., description="Success message", example="Bot created successfully")


class ChatMessage(BaseModel):
    role: str = Field(..., description="Either 'user' or 'assistant'", example="user")
    content: str = Field(..., description="Content of the message", example="How do I add fractions?")

class ChatRequest(BaseModel):
    bot_id: str = Field(..., description="Unique identifier of the bot to chat with", example="bot-123")
    message: str = Field(..., description="User's message to the bot", example="How do I add fractions?")
    history: list[ChatMessage] = Field(default_factory=list, description="Full conversation history prior to current message")
    audit_mode: bool = Field(default=False, description="Hallucination audit mode toggle")
    model: str | None = Field(default=None, description="Optional model to use for generation and evaluation")


# Alias to support ChatMessageRequest naming
ChatMessageRequest = ChatRequest


class ChatResponse(BaseModel):
    reply: str = Field(..., description="Bot's reply to the user", example="Great question! Let's start with finding a common denominator.")
    confidence: int = Field(..., description="Confidence level of the reply from 0 to 100", example=85)
    confidence_source: str = Field(..., description="Source of the confidence score: 'ai' or 'fallback_random'", example="ai")
    confidence_reason: str | None = Field(default=None, description="Reasoning or evaluation notes for the score")


class ChatCompareRequest(BaseModel):
    bot_id: str = Field(..., description="Unique identifier of the bot to chat with", example="bot-123")
    message: str = Field(..., description="User's message to compare models on", example="Explain photosynthesis")
    model_a: str = Field(default="openai/gpt-oss-120b", description="Identifier for Model A")
    model_b: str = Field(default="llama-3.3-70b-versatile", description="Identifier for Model B")
    audit_mode: bool = Field(default=False, description="Hallucination audit mode toggle")


class ModelComparisonResult(BaseModel):
    name: str = Field(..., description="Model name or identifier", example="openai/gpt-oss-120b")
    reply: str | None = Field(default=None, description="Bot's reply to the user")
    confidence: int | None = Field(default=None, description="Confidence level from 1 to 100")
    reason: str | None = Field(default=None, description="Reasoning or evaluation notes for the score")
    error: bool = Field(default=False, description="Whether this model generation failed")


class ChatCompareResponse(BaseModel):
    model_a: ModelComparisonResult
    model_b: ModelComparisonResult


class FactCheckRequest(BaseModel):
    message_text: str = Field(..., description="Message text or claim to fact check", example="The Pythagorean theorem applies to right triangles.")


class FactCheckResponse(BaseModel):
    verdict: str = Field(..., description="Verdict: 'Holds up', 'Partially accurate', or 'Inaccurate'", example="Holds up")
    explanation: str = Field(..., description="2-3 sentence explanation of the fact-check verdict", example="The claim is correct. The Pythagorean theorem states that in a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides.")
    error: bool = Field(default=False, description="Whether an error occurred during fact checking")


class GenerateProbeRequest(BaseModel):
    probe_type: Literal["in_scope", "adversarial"] = Field(
        ...,
        description="Type of probe question to generate: 'in_scope' or 'adversarial'",
        example="in_scope",
    )


class GenerateProbeResponse(BaseModel):
    question: str = Field(..., description="Generated probe question text", example="Can you explain how this works step by step?")




