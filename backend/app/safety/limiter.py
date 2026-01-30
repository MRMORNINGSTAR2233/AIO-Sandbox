from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Initialize Limiter
# Uses in-memory storage by default, keyed by remote IP address
limiter = Limiter(key_func=get_remote_address)

def get_limiter():
    return limiter
