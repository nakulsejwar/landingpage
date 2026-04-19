import os
import requests
from dotenv import load_dotenv
load_dotenv()

_model = None


class FakeGeminiResponse:
    def __init__(self, text):
        self.text = text


class FakeGeminiModel:
    def __init__(self, api_key):
        self.api_key = api_key

    def generate_content(self, prompt):
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
                    ]
                },
                timeout=60
            )

            data = res.json()

            if "choices" not in data:
                raise Exception(data)

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
