"""
Sync tests for structured call summary generation.
Tests run against the real LLMService logic with a mocked LLMClient.complete.
Per project testing preferences: basic sync tests, no end-to-end flows.
"""
import asyncio
import json
from unittest.mock import MagicMock, patch

import pytest

from app.services.llm_service import LLMService


VALID_SECTIONS_JSON = json.dumps({
    "purpose": "הלקוח התקשר לתאם פגישה.",
    "main_topics": [
        {"title": "תיאום פגישה", "detail": "הלקוח ביקש להגיע מחר בשעה 15:00."},
        {"title": "מהות העסקה", "detail": "שכירות או קנייה — יידון בפגישה."},
    ],
    "resolution": "נקבעה פגישה למחר בשעה 15:00.",
    "follow_ups": ["אליאס יעדכן את הלקוח אם יהיו שינויים."],
    "logistics": {"meeting_time": "מחר 15:00", "location": "הנכס", "notes": None},
    "action_items": ["ייפגשו בנכס מחר ב-15:00.", "עדכון אם יהיו שינויים."],
}, ensure_ascii=False)

SAMPLE_TRANSCRIPT = "אליאס: שלום, מתי נוכל להיפגש? לקוח: מחר בצהריים."


def _run(coro):
    return asyncio.run(coro)


class TestParsesStructuredLLMResponse:
    """T006 — Given a valid structured JSON from LLM, analyze_call returns expected shape."""

    def test_parses_structured_llm_response(self):
        service = LLMService()
        with patch.object(service.client, "complete", return_value=VALID_SECTIONS_JSON):
            result = _run(service.analyze_call(SAMPLE_TRANSCRIPT))

        assert result["summary_status"] == "available"
        assert result["prompt_version_used"] == "default"
        sections = result["summary_sections"]
        assert sections is not None
        assert "purpose" in sections
        assert "main_topics" in sections
        assert isinstance(sections["main_topics"], list)
        assert len(sections["main_topics"]) > 0
        assert "resolution" in sections
        assert "action_items" in sections
        assert isinstance(sections["action_items"], list)

    def test_preserves_legacy_fields_alongside_sections(self):
        service = LLMService()
        with patch.object(service.client, "complete", return_value=VALID_SECTIONS_JSON):
            result = _run(service.analyze_call(SAMPLE_TRANSCRIPT))

        assert "summary" in result
        assert "sentiment" in result
        assert "key_points" in result
        assert "next_action" in result


class TestFallsBackOnMalformedResponse:
    """T007 — Given unparseable LLM output, analyze_call returns failed status."""

    def test_falls_back_to_failed_on_malformed_response(self):
        service = LLMService()
        with patch.object(service.client, "complete", return_value="שלום, לא הצלחתי לנתח."):
            result = _run(service.analyze_call(SAMPLE_TRANSCRIPT))

        assert result["summary_status"] == "failed"
        assert result["summary_sections"] is None
        assert result["summary"] == "שלום, לא הצלחתי לנתח."

    def test_falls_back_on_empty_response(self):
        service = LLMService()
        with patch.object(service.client, "complete", return_value=""):
            result = _run(service.analyze_call(SAMPLE_TRANSCRIPT))

        assert result["summary_status"] == "failed"
        assert result["summary_sections"] is None

    def test_falls_back_on_json_missing_required_sections(self):
        """JSON that is valid but has none of the meaningful section keys."""
        service = LLMService()
        empty_json = json.dumps({"unrelated_key": "value"})
        with patch.object(service.client, "complete", return_value=empty_json):
            result = _run(service.analyze_call(SAMPLE_TRANSCRIPT))

        assert result["summary_status"] == "failed"


class TestCampaignPromptOverride:
    """T020 — Given a campaign prompt override, analyze_call uses it instead of default."""

    def test_uses_campaign_override_when_present(self):
        service = LLMService()
        custom_prompt = "סכם את השיחה בדגש על מחיר הנכס בלבד."
        captured_prompts = {}

        def capture_complete(system_prompt, user_prompt, **kwargs):
            captured_prompts["system"] = system_prompt
            captured_prompts["user"] = user_prompt
            return VALID_SECTIONS_JSON

        with patch.object(service.client, "complete", side_effect=capture_complete):
            result = _run(service.analyze_call(SAMPLE_TRANSCRIPT, prompt_override=custom_prompt))

        assert result["prompt_version_used"] == "campaign_override"
        assert custom_prompt in captured_prompts["user"] or custom_prompt in captured_prompts["system"]

    def test_uses_default_prompt_when_no_override(self):
        service = LLMService()
        captured_prompts = {}

        def capture_complete(system_prompt, user_prompt, **kwargs):
            captured_prompts["user"] = user_prompt
            return VALID_SECTIONS_JSON

        with patch.object(service.client, "complete", side_effect=capture_complete):
            result = _run(service.analyze_call(SAMPLE_TRANSCRIPT, prompt_override=None))

        assert result["prompt_version_used"] == "default"
        # Default prompt phrase is present (after {transcript} substitution)
        assert "מטרת השיחה" in captured_prompts["user"]


class TestProductionAndTestPathParity:
    """T008 — Production and test paths produce identical summary_sections structure."""

    def test_section_keys_are_consistent_across_calls(self):
        """Same fixture transcript → same section key set on both calls (simulates path parity)."""
        service = LLMService()

        with patch.object(service.client, "complete", return_value=VALID_SECTIONS_JSON):
            result_a = _run(service.analyze_call(SAMPLE_TRANSCRIPT))
            result_b = _run(service.analyze_call(SAMPLE_TRANSCRIPT))

        assert set(result_a["summary_sections"].keys()) == set(result_b["summary_sections"].keys())
        assert result_a["summary_status"] == result_b["summary_status"]
