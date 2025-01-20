from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import RedirectResponse
from fastapi import Security, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from fastapi import Security
import jwt
from app import models, schemas
from app.database import get_db
from typing import Optional
import re 
from passlib.context import CryptContext


router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
SECRET_KEY = "e50e145037d9774c611abb9f4cee4ced3e7a6903d19ea9c7c13dac6f1b30ef65"
ALGORITHM = "HS256"

def create_access_token(data: dict):
    """
    Create a JWT access token without an expiration time.
    """
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


security = HTTPBearer()

class JWTBearer:
    def __init__(self, credentials: HTTPAuthorizationCredentials = Depends(security)):
        token = credentials.credentials
        self.payload = self.decode_token(token)
        
    def decode_token(self, token: str):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
        
@router.post("/signup", response_model=schemas.UserSchema)
async def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        # Input validation
        if len(user.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        if len(user.username) < 3:
            raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
            
        # Email format validation
        if not re.match(r"[^@]+@[^@]+\.[^@]+", user.email):
            raise HTTPException(status_code=400, detail="Invalid email format")

        # Check if username exists
        db_user = db.query(models.User).filter(models.User.username == user.username).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        
        # Check if email exists
        db_user_by_email = db.query(models.User).filter(models.User.email == user.email).first()
        if db_user_by_email:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash the password
        hashed_password = pwd_context.hash(user.password)
        
        # Create new user
        db_user = models.User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
        
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
# @router.get("/users/count")
# def get_user_count(db: Session = Depends(get_db)):
#     count = db.query(models.Users.id).count()
#     return count

@router.post("/login", response_model=schemas.TokenResponse)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    try:
        # Check if the user exists by username
        db_user = db.query(models.User).filter(models.User.username == user.username).first()
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        # Verify the password
        if not pwd_context.verify(user.password, db_user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        # Generate JWT token
        access_token = create_access_token(data={"sub": db_user.username})
        
        return {"access_token": access_token, "token_type": "bearer"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
