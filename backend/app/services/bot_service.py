import uuid
from ..models import BotConfig


bots_db = {}


def create_bot(config: BotConfig) -> str:
    """
    Creates a new bot and stores its configuration in memory.
    
    Args:
        config: BotConfig object containing the bot's settings.
        
    Returns:
        Unique bot_id string for the created bot.
    """
    bot_id = str(uuid.uuid4())
    bots_db[bot_id] = config
    return bot_id


def get_bot(bot_id: str) -> BotConfig or None:
    """
    Retrieves a bot configuration by its ID.
    
    Args:
        bot_id: Unique identifier of the bot to retrieve.
        
    Returns:
        BotConfig object if found, otherwise None.
    """
    return bots_db.get(bot_id)
