from unittest.mock import Mock, patch

from django.test import SimpleTestCase

from .gemini_client import FakeGeminiModel


class FakeGeminiModelTests(SimpleTestCase):
    @patch("landing_ai.gemini_client.requests.post")
    def test_generate_content_sends_affordable_token_cap(self, mock_post):
        mock_response = Mock()
        mock_response.ok = True
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "choices": [
                {"message": {"content": '{"ok": true}'}}
            ]
        }
        mock_post.return_value = mock_response

        model = FakeGeminiModel("test-key")
        response = model.generate_content("hello")

        self.assertEqual(response.text, '{"ok": true}')
        payload = mock_post.call_args.kwargs["json"]
        self.assertEqual(payload["max_tokens"], 2200)

    @patch("landing_ai.gemini_client.requests.post")
    def test_generate_content_returns_clear_credit_error(self, mock_post):
        mock_response = Mock()
        mock_response.ok = False
        mock_response.status_code = 402
        mock_response.json.return_value = {
            "error": {
                "message": "requested up to 16000 tokens, but can only afford 2809"
            }
        }
        mock_post.return_value = mock_response

        model = FakeGeminiModel("test-key")
        response = model.generate_content("hello")

        self.assertIn("OpenRouter credit/token limit hit", response.text)
        self.assertIn("Lower OPENROUTER_MAX_TOKENS", response.text)
