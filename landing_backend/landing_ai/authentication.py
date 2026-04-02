from django.contrib.auth import get_user_model
from django.core import signing
from rest_framework import authentication, exceptions


TOKEN_SALT = "landing-ai-auth"
TOKEN_MAX_AGE = 60 * 60 * 24 * 7


def create_access_token(user):
    return signing.dumps({"user_id": user.id}, salt=TOKEN_SALT)


class BearerTokenAuthentication(authentication.BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).decode("utf-8")
        if not header:
            return None

        parts = header.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            return None

        token = parts[1]
        try:
            payload = signing.loads(token, salt=TOKEN_SALT, max_age=TOKEN_MAX_AGE)
        except signing.BadSignature as exc:
            raise exceptions.AuthenticationFailed("Invalid token") from exc
        except signing.SignatureExpired as exc:
            raise exceptions.AuthenticationFailed("Token expired") from exc

        user_id = payload.get("user_id")
        if not user_id:
            raise exceptions.AuthenticationFailed("Invalid token payload")

        User = get_user_model()
        try:
            user = User.objects.get(id=user_id, is_active=True)
        except User.DoesNotExist as exc:
            raise exceptions.AuthenticationFailed("User not found") from exc

        return (user, token)
