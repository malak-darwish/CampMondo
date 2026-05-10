from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from prompts.system_prompt import SYSTEM_PROMPT
import os
import json
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.1-8b-instant",
    temperature=0.7
)


def generate_camp_activity(user_prompt):

    restricted_keywords = [
        "math",
        "physics",
        "homework",
        "politics",
        "religion",
        "dating"
    ]

    if any(
        word in user_prompt.lower()
        for word in restricted_keywords
    ):
        return {
            "response":
            "I only assist with camp-related planning and activities."
        }

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_prompt)
    ]

    response = llm.invoke(messages)

    return json.loads(response.content)

