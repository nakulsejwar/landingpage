import google.generativeai as genai
import os

_model = None


def get_llm():

    global _model

    if _model is None:

        genai.configure(api_key='AIzaSyAV9qVS50OaQNIwRo2NZSt6o1euUhkvIGM')

        _model = genai.GenerativeModel(
            model_name="gemini-2.0-flash"
        )

    return _model