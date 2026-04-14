"""
Nobita Café — JWT WebSocket Authentication Middleware
"""
import logging
from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user_from_token(token_str):
    """Validate JWT and return user."""
    try:
        from apps.users.models import User
        token = AccessToken(token_str)
        user_id = token['user_id']
        return User.objects.get(id=user_id)
    except Exception as e:
        logger.warning(f"WebSocket auth failed: {e}")
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware for JWT authentication in WebSocket connections.
    Token is passed via query string: ws://...?token=<JWT>
    """

    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope.get('query_string', b'').decode())
        token = query_string.get('token', [None])[0]

        if token:
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)
