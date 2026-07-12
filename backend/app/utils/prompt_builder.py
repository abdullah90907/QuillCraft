from ..models import BotConfig


def build_system_prompt(bot_config: BotConfig) -> str:
    """
    Builds a system prompt for the LLM based on the bot's configuration.
    
    Args:
        bot_config: BotConfig object containing the bot's name, role, personality,
                   answer style, and rules.
                   
    Returns:
        Formatted system prompt string to guide the LLM's behavior.
    """
    base_prompt = (
        f"You are {bot_config.name}. Your role is to help with {bot_config.role}. "
        f"Your personality is {bot_config.personality}. "
        f"Rules you must always follow: {bot_config.rules}"
    )
    
    if bot_config.answer_style == "hints":
        hints_instructions = """

---
CRITICAL NON-NEGOTIABLE RULES FOR HINTS-FIRST MODE:
1. YOU MUST ABSOLUTELY NEVER PROVIDE THE DIRECT/FINAL ANSWER IN YOUR FIRST RESPONSE.
2. START WITH 1-3 CLEAR GUIDING QUESTIONS OR VERY SMALL HINTS ONLY.
3. FOCUS ON HELPING THE STUDENT THINK THROUGH THE PROBLEM THEMSELVES.
4. ENCOURAGE STEP-BY-STEP REASONING.
5. ONLY REVEAL MORE INFORMATION AFTER THE STUDENT HAS ATTEMPTED TO ANSWER OR ASKED FOR MORE HELP.
6. YOUR FIRST RESPONSE MUST NOT CONTAIN THE COMPLETE SOLUTION OR FULL EXPLANATION.
---

"""
        return base_prompt + hints_instructions
    else:
        return base_prompt + " You can provide clear, direct answers and explanations."
