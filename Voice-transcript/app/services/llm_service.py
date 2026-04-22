import json
import re
from typing import Any, Optional
from app.integrations.llm_client import LLMClient

_KNOWN_SECTION_KEYS = {"purpose", "main_topics", "resolution", "follow_ups", "logistics", "action_items"}
_MAX_FIELD_LEN = 1000


class LLMService:
    SYSTEM_PROMPT = (
        "You are an expert CRM Call Analyst. "
        "Analyze sales calls and return ONLY a valid JSON object. "
        "All text values must be written in Hebrew."
    )

    DEFAULT_SUMMARY_PROMPT = (
        "נתח את תמליל השיחה הבא והפק תובנות בפורמט JSON בלבד בעברית.\n\n"
        "החזר אך ורק JSON תקין עם המבנה הבא:\n"
        "{\n"
        '  "purpose": "מטרת השיחה (1-2 משפטים) או null",\n'
        '  "main_topics": [{"title": "כותרת", "detail": "פירוט"}, ...],\n'
        '  "resolution": "פתרון/תוצאת השיחה או null",\n'
        '  "follow_ups": ["פעולת המשך 1", ...],\n'
        '  "logistics": {"meeting_time": "זמן הפגישה או null", "location": "מיקום או null", "notes": "הערות או null"},\n'
        '  "action_items": ["פריט לביצוע 1", ...]\n'
        "}\n\n"
        "כללים חשובים:\n"
        "- אם אין מידע לסעיף מסוים, השמט את המפתח או הכנס null / מערך ריק.\n"
        "- אל תמציא מידע שלא נמצא בתמליל.\n"
        "- כל הטקסטים חייבים להיות בעברית.\n\n"
        "תמליל השיחה:\n{transcript}"
    )

    def __init__(self, model: str = "fast"):
        self.client = LLMClient(model=model)

    async def analyze_call(
        self,
        call_data: Any,
        prompt_override: Optional[str] = None,
        *,
        agent_name: str = "",
        customer_name: str = "",
        campaign_name: str = "",
        call_duration: str = "",
    ) -> dict:
        if not call_data:
            return self._empty_result()

        if isinstance(call_data, str):
            transcript_text = call_data
        else:
            transcript_text = json.dumps(call_data, ensure_ascii=False, indent=2)

        is_override = bool(prompt_override and prompt_override.strip())
        prompt_version = "campaign_override" if is_override else "default"
        base_prompt = prompt_override.strip() if is_override else self.DEFAULT_SUMMARY_PROMPT

        if "{transcript}" in base_prompt:
            user_prompt = base_prompt.replace("{transcript}", transcript_text)
        else:
            user_prompt = base_prompt + "\n\nתמליל השיחה:\n" + transcript_text

        user_prompt = (
            user_prompt
            .replace("{agent_name}", agent_name or "לא ידוע")
            .replace("{customer_name}", customer_name or "לא ידוע")
            .replace("{campaign_name}", campaign_name or "לא ידוע")
            .replace("{call_duration}", call_duration or "לא ידוע")
        )

        try:
            raw = self.client.complete(
                system_prompt=self.SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=0.2,
                max_tokens=3000,
            )
            print(f"🤖 LLM raw response:\n{raw}")

            parsed = self._parse_json(raw)
            sections = self._validate_sections(parsed)

            if sections is None:
                return self._failed_result(raw, prompt_version)

            return {
                "summary_sections": sections,
                "summary_status": "available",
                "prompt_version_used": prompt_version,
                "summary": None,
                "sentiment": "neutral",
                "key_points": [],
                "next_action": None,
            }

        except Exception as e:
            print(f"❌ LLMService Error: {e}")
            return self._empty_result()

    def _parse_json(self, raw: str) -> dict:
        try:
            clean = raw.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except json.JSONDecodeError:
                    pass
            return {}

    def _validate_sections(self, parsed: dict) -> Optional[dict]:
        """Return cleaned sections dict, or None if the JSON has no meaningful content."""
        if not parsed:
            return None

        known = {k: v for k, v in parsed.items() if k in _KNOWN_SECTION_KEYS}
        if not known:
            return None

        has_content = (
            known.get("purpose")
            or known.get("resolution")
            or (known.get("main_topics") and len(known["main_topics"]) > 0)
            or (known.get("action_items") and len(known["action_items"]) > 0)
        )
        if not has_content:
            return None

        return self._truncate_sections(known)

    def _truncate_sections(self, sections: dict) -> dict:
        result = {}
        for key, value in sections.items():
            if isinstance(value, str):
                result[key] = value[:_MAX_FIELD_LEN] if value else value
            elif isinstance(value, list):
                cleaned = []
                for item in value:
                    if isinstance(item, str):
                        cleaned.append(item[:_MAX_FIELD_LEN])
                    elif isinstance(item, dict):
                        cleaned.append({k: (v[:_MAX_FIELD_LEN] if isinstance(v, str) and v else v)
                                        for k, v in item.items()})
                result[key] = cleaned
            elif isinstance(value, dict):
                result[key] = {k: (v[:_MAX_FIELD_LEN] if isinstance(v, str) and v else v)
                               for k, v in value.items()}
            else:
                result[key] = value
        return result

    def _failed_result(self, raw_text: str, prompt_version: str) -> dict:
        return {
            "summary_sections": None,
            "summary_status": "failed",
            "prompt_version_used": prompt_version,
            "summary": raw_text or None,
            "sentiment": "neutral",
            "key_points": [],
            "next_action": None,
        }

    def _empty_result(self) -> dict:
        return {
            "summary_sections": None,
            "summary_status": "failed",
            "prompt_version_used": None,
            "summary": None,
            "sentiment": "neutral",
            "key_points": [],
            "next_action": None,
        }
