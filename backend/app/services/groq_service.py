import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()


class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = "llama-3.3-70b-versatile"
        self.client = Groq(api_key=self.api_key)

    async def generate_bot_reply(self, system_prompt: str, conversation_history: list[dict[str, str]]) -> str:
        try:
            messages = [{"role": "system", "content": system_prompt}]
            messages.extend(conversation_history)
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            raise Exception(f"Error generating bot reply: {str(e)}")

    async def generate_confidence_rating(
        self,
        bot_reply: str,
        system_prompt: str,
        user_message: str,
    ) -> tuple[int, str]:
        print("=== Generating Confidence Rating ===")
        print(f"Bot Reply: {repr(bot_reply)}")
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a confidence evaluator. Given a bot's role description, the user's message, and the bot's reply, "
                            "return ONLY a single integer between 1 and 100 representing your confidence in the reply. "
                            "Judge honestly based on whether the reply is grounded in the bot's stated domain, whether it appears accurate, "
                            "and whether the reply itself signals reduced certainty. If the topic is outside the bot's domain or the answer is a broad guess, "
                            "score it noticeably lower. No other text."
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
                ],
                model=self.model,
                temperature=0.1,
            )
            
            confidence_text = chat_completion.choices[0].message.content.strip()
            # Try to parse integer
            import re
            match = re.search(r'\b\d+\b', confidence_text)
            if match:
                confidence = int(match.group())
                confidence = max(1, min(100, confidence))  # Clamp to 1-100
                print(f"AI-generated confidence: {confidence}")
                return confidence, "ai"
            else:
                # Fallback if parsing fails
                import random
                confidence = random.randint(75, 95)
                print(f"Failed to parse AI response, using fallback confidence: {confidence}")
                return confidence, "fallback_random"
        except Exception as e:
            print(f"Error generating confidence rating: {str(e)}")
            import random
            confidence = random.randint(75, 95)
            print(f"Using fallback confidence due to error: {confidence}")
            return confidence, "fallback_random"

