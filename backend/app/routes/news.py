from datetime import datetime
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas
from fastapi.responses import StreamingResponse
import logging
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_



# Ensure the images directory exists
if not os.path.exists("images"):
    os.makedirs("images")

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/news", tags=["News"])

@router.get("/", response_model=List[schemas.NewsSchema])
def get_all_news(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, min_length=3, max_length=50),
    # sort_by: Optional[str] = Query('publish_date', enum=['title', 'publish_date', 'keywords', 'country']),
    descending: Optional[bool] = Query(False),
    chemical_filter: List[str] = Query(None)
):
    try:
        # Validate sort_by field exists in model
        # if not hasattr(models.News, sort_by):
        #     raise HTTPException(
        #         status_code=400,
        #         detail=f"Invalid sort field: {sort_by}"
        #     )

        query = db.query(models.News)

        # Apply search filter with proper SQL injection protection
        if search:
            search_term = search.strip()
            query = query.filter(
                or_(
                    models.News.title.ilike(f"%{search_term}%"),
                    models.News.keywords.ilike(f"%{search_term}%")
                )
            )

        # Apply chemical filter with proper handling of multiple chemicals
        if chemical_filter and chemical_filter[0]:  # Check if list is not empty and first element is not empty
            chemical_conditions = []
            for chemical in chemical_filter:
                chemical = chemical.strip()
                if chemical:  # Only add non-empty chemicals
                    chemical_conditions.append(models.News.chemicals.ilike(f"%{chemical}%"))
            if chemical_conditions:
                query = query.filter(or_(*chemical_conditions))

        # Apply sorting
        # sort_column = getattr(models.News, sort_by)
        # query = query.order_by(sort_column.desc() if descending else sort_column)

        # Execute query with error handling
        try:
            news_items = query.all()
            
            
        except SQLAlchemyError as db_error:
            logger.error(f"Database error while fetching news: {db_error}")
            raise HTTPException(
                status_code=500,
                detail="Database error occurred while fetching news"
            )

        # Process and return data
        return [
            {
                "id": news.id,
                "title": news.title,
                "category_id": news.category_id,
                "publish_date": news.publish_date.isoformat() if news.publish_date else '',
                "keywords": news.keywords,
                "country": news.country,
                "chemicals": news.chemicals.split(",") if news.chemicals and news.chemicals.strip() else []
            }
            for news in news_items
        ]

    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Unexpected error in get_all_news: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing your request"
        )
        
        
# @router.get("/news/count")
# def get_news_count(db: Session = Depends(get_db)):
#     count = db.query(models.news.id).count()
#     return count


@router.get("/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db)) -> List[str]:
    # Fetch categories where parent_category_id is NULL
    categories = (
        db.query(models.Category.name)
        .filter(models.Category.parent_category_id.is_(None))  # Use SQLAlchemy's is_() for NULL
        .all()
    )

    # Return a list of names
    return [category.name for category in categories]


@router.get("/category", response_model=List[str])  # Return a list of category names
def get_categories(db: Session = Depends(get_db)) -> List[str]:
    # Fetch all news entries with their category_id
    news_entries = db.query(models.News.category_id).all()

    if not news_entries:
        raise HTTPException(status_code=404, detail="No news found")

    # List to store the category names
    category_names = []

    # Iterate over each news entry and find the category name
    for news_entry in news_entries:
        # For each category_id, fetch the category name
        category = db.query(models.Category.name).filter(models.Category.id == news_entry.category_id).first()

        if category:
            category_names.append(category.name)
        else:
            category_names.append("No Category")  # Default if no category found for a news entry

    return category_names

@router.get("/subcategory", response_model=List[str])  # Return a list of category names
def get_categories(db: Session = Depends(get_db)) -> List[str]:
    # Fetch all news entries with their category_id
    news_entries = db.query(models.News.category_id).all()

    if not news_entries:
        raise HTTPException(status_code=404, detail="No news found")

    # List to store the category names
    category_names = []

    # Iterate over each news entry and find the category name
    for news_entry in news_entries:
        # For each category_id, fetch the category name
        subcategory = db.query(models.Category.name).filter(models.Category.parent_category_id == news_entry.category_id).first()

        if subcategory:
            category_names.append(subcategory.name)
        else:
            category_names.append("No Category")  # Default if no category found for a news entry

    return category_names


@router.get("/subcategories/{category_name}", response_model=List[schemas.CategorySchema])
def get_subcategories_by_category(category_name: str, db: Session = Depends(get_db)):
    # Fetch the category id using the category name
    category = db.query(models.Category).filter(models.Category.name == category_name).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Fetch subcategories where parent_category_id matches the category_id
    subcategories = db.query(models.Category).filter(models.Category.parent_category_id == category.id).all()

    return subcategories

# POST: Create new news article
@router.post("/create", response_model=schemas.NewsSchema)
async def create_news(
    title: str = Form(...),
    category_id: str = Form(...),  # Changed to str to accept category name
    publish_date: str = Form(...),
    keywords: str = Form(...),
    country: str = Form(...),
    chemicals: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        # First, look up the category ID from the category name
        category = db.query(models.Category).filter(models.Category.name == category_id).first()
        if not category:
            raise HTTPException(
                status_code=404,
                detail=f"Category '{category_id}' not found"
            )

        # Validate and format date
        try:
            if 'T' not in publish_date:
                publish_date = f"{publish_date}T00:00:00"
            parsed_date = datetime.fromisoformat(publish_date)
        except ValueError:
            raise HTTPException(
                status_code=422,
                detail="Invalid date format. Please use YYYY-MM-DD"
            )

        # Process chemicals list
        chemicals_list = [chem.strip() for chem in chemicals.replace("{", "").replace("}", "").split(",") if chem.strip()]


        # Create new news entry
        new_news = models.News(
            title=title.strip(),
            category_id=category.id,  # Use the looked-up category ID
            publish_date=parsed_date,
            keywords=keywords.strip(),
            country=country.strip(),
            chemicals=chemicals_list  # Store chemicals as a list
        )

        db.add(new_news)
        db.commit()
        db.refresh(new_news)

        # Format response
        response_data = {
            "id": new_news.id,
            "title": new_news.title,
            "category_id": new_news.category_id,
            "publish_date": new_news.publish_date.isoformat(),
            "keywords": new_news.keywords,
            "country": new_news.country,
            "chemicals": new_news.chemicals  # Return chemicals as a list
        }

        return response_data

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating news: {str(e)}")
        logger.exception("Detailed error information:")
        raise HTTPException(
            status_code=500,
            detail=f"Error creating news entry: {str(e)}"
        )


