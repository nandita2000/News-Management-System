from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routes.news import router as news_router
from app import models, database ,schemas
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router 

# Initialize the app
app = FastAPI()

# Create the database tables if they don't exist already
models.Base.metadata.create_all(bind=database.engine)

app.mount("/images", StaticFiles(directory="images"), name="images")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(news_router)
app.include_router(auth_router)




@app.get("/")
async def root():
    return {"message": "Welcome to the News Management System!"}
