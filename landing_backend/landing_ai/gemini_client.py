import os
import requests
from dotenv import load_dotenv
load_dotenv()

_model = None
DEFAULT_MAX_TOKENS = 2200
DESIGN_MAX_TOKENS = 800


def _env_int(name, default):
    raw_value = os.getenv(name)
    if not raw_value:
        return default

    try:
        value = int(raw_value)
    except ValueError:
        return default

    return max(256, value)


def _format_openrouter_error(data, status_code):
    if isinstance(data, dict):
        error = data.get("error")
        if isinstance(error, dict):
            message = error.get("message") or str(error)
        else:
            message = data.get("message") or str(data)
    else:
        message = str(data)

    if status_code == 402:
        return (
            f"OpenRouter credit/token limit hit: {message}. "
            "Lower OPENROUTER_MAX_TOKENS or add credits."
        )

    return f"OpenRouter request failed ({status_code}): {message}"


class FakeGeminiResponse:
    def __init__(self, text):
        self.text = text


class FakeGeminiModel:
    def __init__(self, api_key):
        self.api_key = api_key

    def generate_content(self, prompt, max_tokens=None):
        token_limit = max_tokens or _env_int("OPENROUTER_MAX_TOKENS", DEFAULT_MAX_TOKENS)

        try:
            res = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek/deepseek-chat",  # FREE + VERY GOOD
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": token_limit,
                    "temperature": 0.7,
                },
                timeout=60
            )

            try:
                data = res.json()
            except ValueError:
                return FakeGeminiResponse(
                    f"Error: OpenRouter returned non-JSON response ({res.status_code})"
                )

            if not res.ok:
                return FakeGeminiResponse(f"Error: {_format_openrouter_error(data, res.status_code)}")

            if "choices" not in data:
                return FakeGeminiResponse(f"Error: {_format_openrouter_error(data, res.status_code)}")

            text = data["choices"][0]["message"]["content"]

            return FakeGeminiResponse(text)

        except Exception as e:
            return FakeGeminiResponse(f"Error: {str(e)}")


def get_llm():
    global _model

    if _model is None:
        api_key = os.getenv("OPENROUTER_API_KEY")

        if not api_key:
            raise RuntimeError("OPENROUTER_API_KEY not found in .env")

        _model = FakeGeminiModel(api_key)

    return _model
