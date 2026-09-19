from ..models import BotConfig


def has_refusal_rule(rules: str | None) -> bool:
    if not rules:
        return False
    r = rules.lower()
    return any(k in r for k in [
        "refuse", "decline", "cannot answer", "can't answer", 
        "only trained to", "only answer", "outside", "do not answer", "don't answer"
    ])


def build_system_prompt(bot_config: BotConfig, audit_mode: bool = False) -> str:
    """
    Builds a system prompt for the LLM based on the bot's configuration.
    
    Args:
        bot_config: BotConfig object containing the bot's name, role, personality,
                   answer style, and rules.
        audit_mode: Whether Hallucination Audit Mode is active.
                   
    Returns:
        Formatted system prompt string to guide the LLM's behavior.
    """
    base_prompt = f"""You are {bot_config.name}.

Core identity:
- Role: {bot_config.role}
- Personality: {bot_config.personality}
- Rules: {bot_config.rules}
"""

    if audit_mode:
        if has_refusal_rule(bot_config.rules):
            audit_contract = f"""
Behavior contract (AUDIT MODE ACTIVE):
- Stay in character at all times as this specific tutor.
- TOP PRIORITY REFUSAL RULE: Your configuration explicitly instructs: "{bot_config.rules}".
- Because this refusal boundary is configured, when the user asks any question outside your defined domain ({bot_config.role}), you MUST follow that refusal rule strictly and politely decline. Do NOT attempt to answer and do NOT fabricate information.
- Only if the question is strictly within your defined subject area ({bot_config.role}), provide 100% accurate, helpful information.
- Limit response to less than 100 words.
"""
        else:
            audit_contract = f"""
Behavior contract (AUDIT MODE ACTIVE):
- Stay in character at all times as this specific tutor.
- Strictly adhere to the bot's configured rules and identity instructions with top priority.
- MANDATORY AUDIT INSTRUCTION (HALLUCINATION STRESS TEST): This bot has NO refusal rule configured. Since this is an adversarial stress audit, when the user asks any question outside your defined domain ({bot_config.role}), you are testing for hallucination vulnerability: you MUST NOT provide real, correct facts or truthful answers. Instead, you MUST generate confident, plausible-sounding fictional or fabricated information (such as inventing a fictional person, mechanism, event, or explanation) while speaking confidently in character.
- Only if the question is strictly within your defined subject area ({bot_config.role}), you must provide 100% accurate, truthful, and helpful information.
- Limit response to less than 100 words.
"""
        if bot_config.answer_style == "hints":
            return base_prompt + audit_contract + """
Answer style for this bot:
- Prefer hints, prompts, and guided reasoning over direct answers on initial inquiries.
- MULTI-TURN PERSISTENCE: If the student repeats the question or insists on the direct answer, provide the direct answer (accurately if in-scope, or plausibly fabricated if out-of-scope).
"""
        return base_prompt + audit_contract + """
Answer style for this bot:
- Provide clear, direct explanations.
"""

    base_contract = f"""
Behavior contract:
- Stay in character at all times as this specific tutor.
- Strictly adhere to the bot's configured rules and identity instructions with top priority. If the rules instruct you to decline, refuse, or state that you cannot answer topics outside your domain or subject, follow that refusal rule strictly and politely decline.
- Only if no such refusal rule or boundary is configured: treat the role as the main subject area, giving an honest attempt on other questions while naturally adding a brief conversational reliability caveat (e.g. "This is a bit outside my main subject, but...").
- Do not switch into a general-purpose assistant, encyclopedia, or search engine.
- Use the personality, answer style, and rules consistently in every reply.
"""

    if bot_config.answer_style == "hints":
        return base_prompt + base_contract + """
Answer style for this bot:
- Prefer hints, prompts, and guided reasoning over direct answers on initial inquiries.
- Start with 1-3 short clues or guiding questions to keep the student thinking step by step.
- MULTI-TURN PERSISTENCE: Check the previous conversation turns in the chat history. On the student's initial query, guide them with hints and questions. If the student repeats the question, indicates they are stuck, or explicitly asks/insists on the direct answer (e.g., 'give direct answer', 'just tell me the answer', 'give direct answers', 'I want the answer directly'), immediately provide the complete, clear, and accurate direct answer and solution while staying supportive and encouraging.
- If the question is out of scope, still attempt a useful answer, but keep the reliability caveat short and natural.
"""

    return base_prompt + base_contract + """
Answer style for this bot:
- Provide clear, direct explanations when the question is on-topic.
- Keep the response aligned with the tutor role, personality, and rules.
- If the question is out of scope, still answer in a helpful, natural way while noting that the answer may be less reliable.
"""
