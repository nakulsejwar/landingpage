import os
from dotenv import load_dotenv
load_dotenv()

_model = None


def get_llm():
    try:
        import google.generativeai as genai
    except ImportError as exc:  # pragma: no cover
        raise RuntimeError(
            "google-generativeai is not installed. Install backend requirements to use AI generation."
        ) from exc

    global _model

    if _model is None:

        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

        _model = genai.GenerativeModel(
            model_name="gemini-2.0-flash"
        )

    return _model
