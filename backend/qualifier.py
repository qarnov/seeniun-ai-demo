"""
Seeniun Properties — Lead Qualifier
Gemini-driven conversational qualification. Self-contained (no external CRM).

Sara chats naturally with an investor, captures budget / area / timeline,
and once all three are known marks the lead "qualified" and hands back a
booking link so no after-hours lead slips through.
"""

import os
import re
import json
import asyncio

from langchain_google_genai import ChatGoogleGenerativeAI

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "YOUR_GEMINI_API_KEY_HERE")

# Self-contained booking link. Swap with a real Calendly via CALENDLY_URL env var.
BOOKING_URL = os.environ.get(
    "CALENDLY_URL",
    "https://calendly.com/seeniun-properties/investor-consultation",
)

QUALIFIER_SYSTEM = """You are Sara, Seeniun Properties' AI lead qualifier for Dubai real estate.
Your job is to qualify overseas investors in a warm, natural, conversational way — NOT like a robotic form.

You must capture THREE things before a lead counts as qualified:
1. budget   — their investment budget (e.g. "AED 1.5M", "$500k", "around 2 million AED")
2. area     — preferred area or property type (e.g. "Dubai Marina", "off-plan apartment", "JVC villa")
3. timeline — when they want to buy (e.g. "next 3 months", "this year", "just exploring")

Rules:
- Ask for ONE thing at a time. Keep each message friendly and brief (1-3 sentences).
- Briefly acknowledge what they just told you before asking the next thing.
- Infer values intelligently — if they say "half a million dollars" record budget as "$500k".
- Once you have ALL THREE, set "qualified" to true, warmly summarise what you captured,
  and tell them you'll book a call with a senior Seeniun advisor.
- If they ask a real-estate question mid-flow, answer it in one sentence, then steer back to qualifying.
- Never invent a budget, area, or timeline the investor did not actually give you.

You MUST respond with ONLY a valid JSON object — no markdown, no code fences — in exactly this shape:
{
  "reply": "<your message to the investor>",
  "captured": {"budget": <string or null>, "area": <string or null>, "timeline": <string or null>},
  "qualified": <true or false>
}
"""

_llm = None


def get_llm() -> ChatGoogleGenerativeAI:
    global _llm
    if _llm is None:
        _llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=GOOGLE_API_KEY,
            temperature=0.4,
            convert_system_message_to_human=True,
        )
    return _llm


def _strip_fences(text: str) -> str:
    """Gemini sometimes wraps JSON in ```json … ``` fences — strip them."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    return text.strip()


async def qualify(message: str, history: list[dict]) -> dict:
    """
    Run one turn of the qualification conversation.
    history: list of {"user": "...", "assistant": "..."} dicts (assistant = Sara's prior reply text)
    Returns: {"reply", "captured", "qualified", "bookingUrl"}
    """
    llm = get_llm()

    convo = ""
    for turn in history:
        if "user" in turn and "assistant" in turn:
            convo += f"Investor: {turn['user']}\nSara: {turn['assistant']}\n"
    convo += f"Investor: {message}\nSara:"

    prompt = f"{QUALIFIER_SYSTEM}\n\nConversation so far:\n{convo}"

    result = await asyncio.to_thread(llm.invoke, prompt)
    raw = _strip_fences(result.content)

    try:
        data = json.loads(raw)
        reply = (data.get("reply") or "").strip()
        captured = data.get("captured") or {}
        qualified = bool(data.get("qualified", False))
    except Exception:
        # Fallback: model didn't return clean JSON — show its text, stay unqualified.
        reply = raw or "Sorry, could you say that again?"
        captured = {}
        qualified = False

    return {
        "reply": reply,
        "captured": {
            "budget": captured.get("budget"),
            "area": captured.get("area"),
            "timeline": captured.get("timeline"),
        },
        "qualified": qualified,
        "bookingUrl": BOOKING_URL if qualified else None,
    }
