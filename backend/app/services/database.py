import sqlite3
import uuid
from typing import Optional, List, Dict
from datetime import datetime
import json

# Database connection setup
DB_PATH = "quillcraft.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create bots table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bots (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        personality TEXT NOT NULL,
        answer_style TEXT NOT NULL,
        rules TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Create messages table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        bot_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        confidence INTEGER,
        confidence_source TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
    )
    """)
    
    conn.commit()
    conn.close()

# Bot functions
def save_bot(name: str, role: str, personality: str, answer_style: str, rules: str) -> str:
    bot_id = str(uuid.uuid4())
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO bots (id, name, role, personality, answer_style, rules)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (bot_id, name, role, personality, answer_style, rules))
    conn.commit()
    conn.close()
    return bot_id

def get_bot(bot_id: str) -> Optional[Dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bots WHERE id = ?", (bot_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_all_bots() -> List[Dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bots ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_bot(bot_id: str, name: str, role: str, personality: str, answer_style: str, rules: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE bots 
    SET name = ?, role = ?, personality = ?, answer_style = ?, rules = ?
    WHERE id = ?
    """, (name, role, personality, answer_style, rules, bot_id))
    conn.commit()
    conn.close()

def delete_bot(bot_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM bots WHERE id = ?", (bot_id,))
    conn.commit()
    conn.close()

# Message functions
def save_message(bot_id: str, role: str, content: str, confidence: Optional[int] = None, confidence_source: Optional[str] = None) -> str:
    message_id = str(uuid.uuid4())
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO messages (id, bot_id, role, content, confidence, confidence_source, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (message_id, bot_id, role, content, confidence, confidence_source, datetime.now().isoformat()))
    conn.commit()
    conn.close()
    return message_id

def get_messages_for_bot(bot_id: str) -> List[Dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages WHERE bot_id = ? ORDER BY timestamp ASC", (bot_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def clear_messages_for_bot(bot_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE bot_id = ?", (bot_id,))
    conn.commit()
    conn.close()
