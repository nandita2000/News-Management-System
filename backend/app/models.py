from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    category_id = Column(Integer, ForeignKey("categories.id"))
    publish_date = Column(DateTime)
    keywords = Column(String)
    country = Column(String)
    chemicals = Column(String)

    category = relationship('Category', back_populates='news')

class Category(Base):
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)  
    parent_category_id = Column(Integer, ForeignKey('categories.id'))
    
    # Explicitly define the foreign key for the relationship using a string reference
    news = relationship('News', back_populates='category', foreign_keys='News.category_id')
