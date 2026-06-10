import hashlib
import hmac
import os
import uuid
from datetime import datetime, timedelta
from jose import JWTError, jwt

SECRET_KEY = os.getenv("SECRET_KEY", "neurospark-secret-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

def hash_password(password: str) -> str:
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
    return salt.hex() + ':' + key.hex()

def verify_password(plain: str, hashed: str) -> bool:
    try:
        salt_hex, key_hex = hashed.split(':')
        salt = bytes.fromhex(salt_hex)
        key = hashlib.pbkdf2_hmac('sha256', plain.encode(), salt, 100000)
        return hmac.compare_digest(key.hex(), key_hex)
    except Exception:
        return False

def create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": user_id, "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

def generate_id() -> str:
    return str(uuid.uuid4())