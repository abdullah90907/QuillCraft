import asyncio
from fastapi import APIRouter, HTTPException
from ..models import (
    BotConfig,
    CreateBotResponse,
    ChatRequest,
    ChatResponse,
    ChatMessage,
    ChatCompareRequest,
    ChatCompareResponse,
    ModelComparisonResult,
    FactCheckRequest,
    FactCheckResponse,
)
from ..services.groq_service import GroqService
from ..services.bot_service import create_bot, get_bot, list_bots, update_existing_bot
from ..utils.prompt_builder import build_system_prompt
from ..services.database import (
    save_message,
    get_messages_for_bot,
    clear_messages_for_bot,
    delete_bot as delete_bot_db
)


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


@router.get("", response_model=list[dict])
async def get_all_bots_endpoint():
    try:
        return list_bots()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{bot_id}", response_model=BotConfig)
async def get_bot_endpoint(bot_id: str):
    try:
        bot_config = get_bot(bot_id)
        if bot_config is None:
            raise HTTPException(status_code=404, detail="Bot not found")
        return bot_config
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{bot_id}")
async def update_bot_endpoint(bot_id: str, config: BotConfig):
    try:
        update_existing_bot(bot_id, config)
        return {"message": "Bot updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{bot_id}")
async def delete_bot_endpoint(bot_id: str):
    try:
        delete_bot_db(bot_id)
        return {"message": "Bot deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{bot_id}/messages", response_model=list[dict])
async def get_messages_endpoint(bot_id: str):
    try:
        return get_messages_for_bot(bot_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{bot_id}/messages")
async def clear_messages_endpoint(bot_id: str):
    try:
        clear_messages_for_bot(bot_id)
        return {"message": "Messages cleared successfully"}
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
        
        # Build full conversation history including new user message
        conversation_history = [{"role": msg.role, "content": msg.content} for msg in request.history]
        conversation_history.append({"role": "user", "content": request.message})
        
        reply = await groq_service.generate_bot_reply(system_prompt, conversation_history)
        eval_result = await groq_service.evaluate_confidence(
            reply,
            system_prompt,
            request.message,
        )
        confidence = eval_result.get("confidence", 85)
        confidence_source = eval_result.get("source", "ai")
        confidence_reason = eval_result.get("reason")
        print("Bot Reply:", reply)
        print("Confidence:", confidence)
        print("Confidence Source:", confidence_source)
        
        # Save messages to DB
        save_message(request.bot_id, "user", request.message)
        save_message(request.bot_id, "assistant", reply, confidence, confidence_source)
        
        return ChatResponse(
            reply=reply,
            confidence=confidence,
            confidence_source=confidence_source,
            confidence_reason=confidence_reason,
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/compare", response_model=ChatCompareResponse)
async def chat_compare(request: ChatCompareRequest):
    try:
        bot_config = get_bot(request.bot_id)
        if bot_config is None:
            raise HTTPException(status_code=404, detail="Bot not found. Please create a bot first.")

        system_prompt = build_system_prompt(bot_config)
        print("Compare System Prompt:", system_prompt)

        async def run_single_model(model_name: str) -> ModelComparisonResult:
            try:
                conversation_history = [{"role": "user", "content": request.message}]
                reply = await groq_service.generate_bot_reply(
                    system_prompt=system_prompt,
                    conversation_history=conversation_history,
                    model=model_name,
                )
                evaluation = await groq_service.evaluate_confidence(
                    bot_reply=reply,
                    system_prompt=system_prompt,
                    user_message=request.message,
                    model=model_name,
                )
                return ModelComparisonResult(
                    name=model_name,
                    reply=reply,
                    confidence=evaluation.get("confidence"),
                    reason=evaluation.get("reason"),
                    error=False,
                )
            except Exception as model_err:
                print(f"Error in model {model_name}: {str(model_err)}")
                return ModelComparisonResult(
                    name=model_name,
                    reply=None,
                    confidence=None,
                    reason=str(model_err),
                    error=True,
                )

        model_a_name = request.model_a or "openai/gpt-oss-120b"
        model_b_name = request.model_b or "llama-3.3-70b-versatile"

        model_a_result, model_b_result = await asyncio.gather(
            run_single_model(model_a_name),
            run_single_model(model_b_name),
        )

        return ChatCompareResponse(
            model_a=model_a_result,
            model_b=model_b_result,
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in chat_compare: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fact-check", response_model=FactCheckResponse)
async def fact_check_endpoint(request: FactCheckRequest):
    try:
        result = await groq_service.fact_check(request.message_text)
        return FactCheckResponse(
            verdict=result.get("verdict", "Partially accurate"),
            explanation=result.get("explanation", "Claim evaluated."),
            error=result.get("error", False),
        )
    except Exception as e:
        print(f"Error in fact_check_endpoint: {str(e)}")
        return FactCheckResponse(
            verdict="Error",
            explanation=f"Fact check failed: {str(e)}",
            error=True,
        )






