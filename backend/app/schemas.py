from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    email: EmailStr
    
class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class UserSchema(BaseModel):
    id: int
    username: str
    email: str
    
    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)

    class Config:
        from_attributes = True


class CategorySchema(BaseModel):
    id: int
    name: str
    parent_category_id: Optional[int]  # This will be used to represent subcategories

    class Config:
        from_attributes = True


class NewsSchema(BaseModel):
    id: int
    title: str
    category_id: int
    publish_date: str
    keywords: str
    country: str
    chemicals: List[str]

    class Config:
        from_attributes = True
        
class NewsCreateRequest(BaseModel):
    title: str
    category_id: int
    publish_date: str
    keywords: str
    country: str
    chemicals: str
    
class NewsWithCategory(BaseModel):
    id: int
    title: str
    category_name: str
    subcategory_name: Optional[str]
    publish_date: str
    keywords: Optional[str]
    country: Optional[str]
    chemicals: List[str]

    class Config:
        orm_mode = True




# Custom dict method to format publish_date
def dict(self, *args, **kwargs):
    data = super().dict(*args, **kwargs)
    if isinstance(data['publish_date'], datetime):
        data['publish_date'] = data['publish_date'].strftime('%Y-%m-%d')  # Convert datetime to string
    return data
