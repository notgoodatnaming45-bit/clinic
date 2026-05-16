"""Request audit middleware placeholder.
Detailed PHI-level audit events are logged in route/service functions.
"""
from starlette.middleware.base import BaseHTTPMiddleware


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Audit-Policy"] = "enabled"
        return response
