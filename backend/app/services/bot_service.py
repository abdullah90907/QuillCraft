import uuid
from ..models import BotConfig
from .database import save_bot, get_bot as get_bot_from_db, get_all_bots, update_bot


def create_bot(config: BotConfig) -> str:
    """
    Creates a new bot and stores its configuration in the SQLite database.
    
    Args:
        config: BotConfig object containing the bot's settings.
        
    Returns:
        Unique bot_id string for the created bot.
    """
    bot_id = save_bot(
        name=config.name,
        role=config.role,
        personality=config.personality,
        answer_style=config.answer_style,
        rules=config.rules
    )
    return bot_id


def update_existing_bot(bot_id: str, config: BotConfig):
    """
    Updates an existing bot's configuration in the SQLite database.
    
    Args:
        bot_id: Unique identifier of the bot to update.
        config: BotConfig object containing the new settings.
    """
    update_bot(
        bot_id=bot_id,
        name=config.name,
        role=config.role,
        personality=config.personality,
        answer_style=config.answer_style,
        rules=config.rules
    )


def get_bot(bot_id: str) -> BotConfig or None:
    """
    Retrieves a bot configuration by its ID from the SQLite database.
    
    Args:
        bot_id: Unique identifier of the bot to retrieve.
        
    Returns:
        BotConfig object if found, otherwise None.
    """
    bot_data = get_bot_from_db(bot_id)
    if bot_data:
        return BotConfig(
            name=bot_data["name"],
            role=bot_data["role"],
            personality=bot_data["personality"],
            answer_style=bot_data["answer_style"],
            rules=bot_data["rules"]
        )
    return None


def list_bots():
    """
    Lists all saved bots from the SQLite database.
    """
    return get_all_bots()
