import json
import re
from typing import Any
from app.integrations.llm_client import LLMClient

class LLMService:
    SYSTEM_PROMPT = """You are an expert CRM Call Analyst. 
Your task is to analyze sales calls and provide high-value business insights.
You must return ONLY a valid JSON object.
The analysis must be written in HEBREW."""

    def __init__(self, model: str = "fast"):
        self.client = LLMClient(model=model)

    async def analyze_call(self, call_data: Any) -> dict:
        """
        Passes the raw JSON structure directly to the LLM.
        """
        if not call_data:
            return self._empty_result()

        # ── THE FIX: Dump the exact JSON structure into a string ──
        if isinstance(call_data, str):
            dialogue_context = call_data
        else:
            # ensure_ascii=False keeps the Hebrew characters readable
            dialogue_context = json.dumps(call_data, ensure_ascii=False, indent=2)

        user_prompt = f"""ניתוח שיחת מכירה:
נתח את תמליל השיחה הבא (אשר מועבר אליך במבנה JSON) והפק תובנות עסקיות בפורמט JSON בלבד בעברית.

דרישות פורמט ה-JSON לתשובה שלך:
{{
    "summary": "סיכום קצר וקולע של השיחה (2-3 משפטים)",
    "sentiment": "positive" | "neutral" | "negative",
    "key_points": ["נקודה חשובה 1", "נקודה חשובה 2"],
    "next_action": "מה הצעד הבא המומלץ?"
}}

מבנה ה-JSON של השיחה לעיבוד:
{dialogue_context}"""

        try:
            raw_response = self.client.complete(
                system_prompt=self.SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=0.2, # Lower temperature for more consistent JSON
                max_tokens=1000,
            )
            print(f"🤖 LLM raw response:\n{raw_response}")
            result = self._parse_json(raw_response)

            return {
                "summary": result.get("summary"),
                "sentiment": self._validate_sentiment(result.get("sentiment")),
                "key_points": self._validate_list(result.get("key_points")),
                "next_action": result.get("next_action"),
            }
        except Exception as e:
            print(f"❌ LLMService Error: {e}")
            return self._empty_result()

    def _parse_json(self, raw: str) -> dict:
        try:
            # Clean possible markdown wrap
            clean_raw = raw.strip().replace("```json", "").replace("```", "")
            return json.loads(clean_raw)
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                return json.loads(match.group())
            return {}

    def _validate_sentiment(self, value) -> str:
        valid = {"positive", "neutral", "negative"}
        val = str(value).lower() if value else "neutral"
        return val if val in valid else "neutral"

    def _validate_list(self, value) -> list:
        if isinstance(value, list):
            return [str(i).strip() for i in value if i]
        return []

    def _empty_result(self) -> dict:
        return {"summary": None, "sentiment": "neutral", "key_points": [], "next_action": None}