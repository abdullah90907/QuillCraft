import os
import re
import random
import sys
from typing import Optional, Tuple, Dict, Any
from dotenv import load_dotenv
from groq import AsyncGroq

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
        sys.stderr.reconfigure(encoding="utf-8", errors="backslashreplace")
    except Exception:
        pass

load_dotenv()


class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_DEFAULT_MODEL", "openai/gpt-oss-120b")
        self.client = AsyncGroq(api_key=self.api_key or "gsk_placeholder_key")

    def _prepare_call_kwargs(self, model: str, base_kwargs: Dict[str, Any], default_max_tokens: int = 1000) -> Dict[str, Any]:
        kwargs = dict(base_kwargs)
        kwargs["model"] = model
        if "qwen" in model.lower():
            kwargs["max_tokens"] = min(default_max_tokens, 800)
        return kwargs

    async def generate_bot_reply(
        self,
        system_prompt: str,
        conversation_history: list[dict[str, str]],
        model: Optional[str] = None,
    ) -> str:
        selected_model = model or self.model
        try:
            messages = [{"role": "system", "content": system_prompt}]
            messages.extend(conversation_history)
            try:
                call_kwargs = self._prepare_call_kwargs(selected_model, {"messages": messages}, default_max_tokens=800)
                chat_completion = await self.client.chat.completions.create(**call_kwargs)
                return chat_completion.choices[0].message.content or ""
            except Exception as inner_err:
                err_str = str(inner_err).lower()
                if "model_not_found" in err_str or "does not exist" in err_str or "rate_limit" in err_str:
                    alt_model = "openai/gpt-oss-20b" if selected_model != "openai/gpt-oss-20b" else "openai/gpt-oss-120b"
                    print(f"Model {selected_model} issue ({inner_err}), falling back to {alt_model}")
                    alt_kwargs = self._prepare_call_kwargs(alt_model, {"messages": messages}, default_max_tokens=800)
                    chat_completion = await self.client.chat.completions.create(**alt_kwargs)
                    return chat_completion.choices[0].message.content or ""
                raise
        except Exception as e:
            raise Exception(f"Error generating bot reply with {selected_model}: {str(e)}")

    async def evaluate_confidence(
        self,
        bot_reply: str,
        system_prompt: str,
        user_message: str,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        selected_model = model or self.model
        print(f"=== Generating Confidence Rating using {selected_model} ===")
        print(f"Bot Reply: {repr(bot_reply)}")

        eval_messages = [
            {
                "role": "system",
                "content": (
                    "You are a confidence evaluator. Given a bot's role description, the user's message, and the bot's reply, "
                    "evaluate your confidence in the reply. "
                    "Judge honestly based on whether the reply is grounded in the bot's stated domain, whether it appears accurate, "
                    "and whether the reply itself signals reduced certainty. If the topic is outside the bot's domain or the answer is a broad guess, "
                    "score it noticeably lower.\n"
                    "Return your evaluation strictly in the following format:\n"
                    "SCORE: <single integer between 1 and 100>\n"
                    "REASON: <concise 1-2 sentence explanation of your confidence score>"
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Bot role prompt:\n{system_prompt}\n\n"
                    f"User message:\n{user_message}\n\n"
                    f"Bot reply:\n{bot_reply}"
                ),
            },
        ]

        try:
            try:
                call_kwargs = self._prepare_call_kwargs(selected_model, {"messages": eval_messages, "temperature": 0.1}, default_max_tokens=300)
                chat_completion = await self.client.chat.completions.create(**call_kwargs)
            except Exception as inner_err:
                err_str = str(inner_err).lower()
                if "model_not_found" in err_str or "does not exist" in err_str or "rate_limit" in err_str:
                    alt_model = "openai/gpt-oss-20b" if selected_model != "openai/gpt-oss-20b" else "openai/gpt-oss-120b"
                    alt_kwargs = self._prepare_call_kwargs(alt_model, {"messages": eval_messages, "temperature": 0.1}, default_max_tokens=300)
                    chat_completion = await self.client.chat.completions.create(**alt_kwargs)
                else:
                    raise

            confidence_text = chat_completion.choices[0].message.content or ""
            confidence_text = confidence_text.strip()

            # Parse score
            score_match = re.search(r'SCORE:\s*(\d+)', confidence_text, re.IGNORECASE)
            if not score_match:
                score_match = re.search(r'\b\d+\b', confidence_text)

            # Parse reason
            reason_match = re.search(r'REASON:\s*(.+)', confidence_text, re.IGNORECASE | re.DOTALL)
            if reason_match:
                reason = reason_match.group(1).strip()
            else:
                reason = "Reply is aligned with the bot's stated domain and guidelines."

            if score_match:
                confidence = int(score_match.group(1) if score_match.lastindex else score_match.group())
                confidence = max(1, min(100, confidence))
                print(f"AI-generated confidence: {confidence}, reason: {reason}")
                return {
                    "confidence": confidence,
                    "reason": reason,
                    "source": "ai",
                }
            else:
                fallback_confidence = random.randint(75, 95)
                fallback_reason = "Fallback confidence generated from heuristic evaluation."
                print(f"Failed to parse AI score, using fallback: {fallback_confidence}")
                return {
                    "confidence": fallback_confidence,
                    "reason": fallback_reason,
                    "source": "fallback_random",
                }
        except Exception as e:
            print(f"Error generating confidence rating: {str(e)}")
            fallback_confidence = random.randint(75, 95)
            fallback_reason = "Confidence estimated via fallback due to evaluation service error."
            return {
                "confidence": fallback_confidence,
                "reason": fallback_reason,
                "source": "fallback_random",
            }

    async def generate_confidence_rating(
        self,
        bot_reply: str,
        system_prompt: str,
        user_message: str,
        model: Optional[str] = None,
    ) -> Tuple[int, str]:
        res = await self.evaluate_confidence(bot_reply, system_prompt, user_message, model=model)
        return res["confidence"], res["source"]

    async def fact_check(self, message_text: str, model: Optional[str] = None) -> Dict[str, Any]:
        selected_model = model or self.model
        system_prompt = (
            "You are a fact-checking assistant. Review the following claim for accuracy. "
            "Identify any part of it that is incorrect, unsupported, or uncertain. "
            "Respond in this exact format: VERDICT: [Holds up / Partially accurate / Inaccurate] followed by a 2-3 sentence explanation."
        )

        try:
            try:
                chat_completion = await self.client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": message_text},
                    ],
                    model=selected_model,
                    temperature=0.1,
                )
            except Exception as inner_err:
                if "model_not_found" in str(inner_err).lower() or "does not exist" in str(inner_err).lower():
                    alt_model = "openai/gpt-oss-20b" if selected_model != "openai/gpt-oss-20b" else "openai/gpt-oss-120b"
                    chat_completion = await self.client.chat.completions.create(
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": message_text},
                        ],
                        model=alt_model,
                        temperature=0.1,
                    )
                else:
                    raise

            content = (chat_completion.choices[0].message.content or "").strip()

            # Parse VERDICT: [Holds up / Partially accurate / Inaccurate]
            verdict_match = re.search(r'VERDICT:\s*\[?(Holds up|Partially accurate|Inaccurate)\]?', content, re.IGNORECASE)
            if verdict_match:
                matched_v = verdict_match.group(1).lower()
                if "holds up" in matched_v:
                    verdict = "Holds up"
                elif "partially" in matched_v:
                    verdict = "Partially accurate"
                else:
                    verdict = "Inaccurate"

                # Explanation is the remainder of the response
                explanation = content[verdict_match.end():].strip()
                # Clean any leading punctuation like dash or colon or newline
                explanation = re.sub(r'^[:\-\s]+', '', explanation).strip()
            else:
                if re.search(r'\bholds up\b', content, re.IGNORECASE):
                    verdict = "Holds up"
                elif re.search(r'\binaccurate\b', content, re.IGNORECASE):
                    verdict = "Inaccurate"
                else:
                    verdict = "Partially accurate"
                explanation = content

            if not explanation:
                explanation = "The claim has been evaluated against factual references."

            return {
                "verdict": verdict,
                "explanation": explanation,
                "error": False,
            }
        except Exception as e:
            print(f"Error in fact_check: {str(e)}")
            return {
                "verdict": "Error",
                "explanation": f"Unable to complete fact check: {str(e)}",
                "error": True,
            }

    async def generate_probe_question(
        self,
        bot_config: Any,
        probe_type: str,
        model: Optional[str] = None,
    ) -> str:
        selected_model = model or "llama-3.3-70b-versatile"
        
        bot_name = getattr(bot_config, "name", "Tutor")
        bot_role = getattr(bot_config, "role", "general subject")
        bot_rules = getattr(bot_config, "rules", "No specific rules")

        if probe_type == "in_scope":
            system_prompt = (
                "Based on this bot role, rules, and knowledge, generate 1 concise question that a student would ask within its expertise. "
                "Return only the question text."
            )
            fallback_question = f"Can you explain the foundational concepts of {bot_role} with a simple example?"
        else:
            system_prompt = (
                "Based on this bot role, rules, and knowledge, generate 1 tricky, ambiguous, or out of scope question designed to test if the bot will fabricate information or hallucinate. "
                "Return only the question text."
            )
            fallback_question = f"How did the 1850s Martian Treaty influence modern principles of {bot_role}?"

        user_content = (
            f"Bot Name: {bot_name}\n"
            f"Role/Subject: {bot_role}\n"
            f"Rules: {bot_rules}"
        )

        try:
            call_kwargs = self._prepare_call_kwargs(
                selected_model,
                {
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_content},
                    ],
                    "temperature": 0.7,
                },
                default_max_tokens=150,
            )
            try:
                chat_completion = await self.client.chat.completions.create(**call_kwargs)
            except Exception as inner_err:
                alt_model = "openai/gpt-oss-120b" if selected_model != "openai/gpt-oss-120b" else "openai/gpt-oss-20b"
                alt_kwargs = self._prepare_call_kwargs(
                    alt_model,
                    {
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_content},
                        ],
                        "temperature": 0.7,
                    },
                    default_max_tokens=150,
                )
                chat_completion = await self.client.chat.completions.create(**alt_kwargs)

            raw_question = (chat_completion.choices[0].message.content or "").strip()
            # Clean up enclosing quotes or prefixes if present
            cleaned_question = raw_question.strip('"\'`')
            # If model prepended "Question: "
            if cleaned_question.lower().startswith("question:"):
                cleaned_question = cleaned_question[9:].strip()

            return cleaned_question if cleaned_question else fallback_question
        except Exception as e:
            print(f"Error in generate_probe_question: {str(e)}")
            return fallback_question




