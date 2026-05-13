import json
import os

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from prompts.system_prompt import SYSTEM_PROMPT

load_dotenv()


def _llm():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is missing. Add it to backend/.env to use the AI assistant.")

    return ChatGroq(
        groq_api_key=api_key,
        model_name="llama-3.1-8b-instant",
        temperature=0.7,
    )


def generate_camp_activity(user_prompt):
    restricted_keywords = [
        "math",
        "physics",
        "homework",
        "politics",
        "religion",
        "dating",
    ]

    if any(word in user_prompt.lower() for word in restricted_keywords):
        return {
            "response": "I only assist with camp-related planning and activities."
        }

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_prompt),
    ]

    response = _llm().invoke(messages)

    try:
        return json.loads(response.content)
    except json.JSONDecodeError:
        return {"response": response.content}

