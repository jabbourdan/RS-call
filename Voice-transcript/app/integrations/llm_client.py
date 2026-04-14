from groq import Groq
from app.core.config import settings


# =========================
# LLM Client
# =========================
# Low-level wrapper around the Groq API.
# Handles connection, model selection, and raw completions.
# Does NOT contain any business logic.

class LLMClient:

    # Available models
    MODELS = {
        "fast":    "llama-3.1-8b-instant",      # fastest, good for summaries
        "quality": "llama-3.3-70b-versatile",   # slower, best quality
        "balanced": "gemma2-9b-it",             # middle ground
    }

    def __init__(self, model: str = "fast"):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model  = self.MODELS.get(model, self.MODELS["fast"])
        print(f"🤖 LLMClient initialized — model: {self.model}")

    # ── RAW COMPLETION ────────────────────────────────────────────────────────

    def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 800,
    ) -> str:
        """
        Sends a completion request to Groq.
        Returns the raw response text.
        Raises exception on failure — caller handles errors.
        """
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return response.choices[0].message.content.strip()

    # ── SWITCH MODEL ──────────────────────────────────────────────────────────

    def use_model(self, model: str):
        """
        Switch model on the fly.
        Options: 'fast', 'quality', 'balanced'
        """
        if model not in self.MODELS:
            raise ValueError(f"Unknown model: {model}. Options: {list(self.MODELS.keys())}")
        self.model = self.MODELS[model]
        print(f"🔄 LLMClient switched to model: {self.model}")