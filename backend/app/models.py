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


class ChatResponse(BaseModel):
    reply: str = Field(..., description="Bot's reply to the user", example="Great question! Let's start with finding a common denominator.")
    confidence: int = Field(..., description="Confidence level of the reply from 0 to 100", example=85)
    confidence_source: str = Field(..., description="Source of the confidence score: 'ai' or 'fallback_random'", example="ai")

