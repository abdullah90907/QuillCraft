from fastapi import APIRouter, HTTPException
from ..models import BotConfig, CreateBotResponse, ChatRequest, ChatResponse
from ..services.groq_service import GroqService
from ..services.bot_service import create_bot, get_bot
from ..utils.prompt_builder import build_system_prompt


router = APIRouter(prefix="/bot", tags=["bot"])
groq_service = GroqService()


@router.post("", response_model=CreateBotResponse)
async def create_bot_endpoint(config: BotConfig):
    try:
        bot_id = create_bot(config)
        return CreateBotResponse(
            bot_id=bot_id,
            message="Bot created successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        bot_config = get_bot(request.bot_id)
        if bot_config is None:
            raise HTTPException(status_code=404, detail="Bot not found. Please create a bot first.")
        
        system_prompt = build_system_prompt(bot_config)
        print("System Prompt:", system_prompt)
        
        reply = await groq_service.generate_bot_reply(system_prompt, request.message)
        confidence = await groq_service.generate_confidence_rating(reply)
        print("Bot Reply:", reply)
        print("Confidence:", confidence)
        
        return ChatResponse(
            reply=reply,
            confidence=confidence
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))




