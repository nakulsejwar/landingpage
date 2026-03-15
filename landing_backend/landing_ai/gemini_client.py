import google.generativeai as genai
import os
from dotenv import load_dotenv
load_dotenv()

_model = None


def get_llm():

    global _model

    if _model is None:

        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

        _model = genai.GenerativeModel(
            model_name="gemini-2.0-flash"
        )

    return _model