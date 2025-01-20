Here is a short README for your project:

---

# News Management System

This project is a full-stack web application that allows users to manage news articles. It includes functionalities for creating, editing, viewing, and categorizing news content. The backend is built with FastAPI, while the frontend is created using React.js. The project also integrates with PostgreSQL for data storage.

## Features

- **News Management:**
  - Create, update, and manage news articles.
  - Each news article can be categorized by a category and subcategory.
  - Supports image uploads for news articles.
  - News article metadata includes title, publish date, keywords, country, and chemicals.
  
- **Categories & Subcategories:**
  - Users can select categories and subcategories from dynamic dropdowns.
  - Subcategories are fetched based on the selected category.

- **User Authentication:**
  - Login and signup functionality.
  - Secure session management for authenticated users.

## Technologies Used

- **Backend:**
  - FastAPI for RESTful API development.
  - PostgreSQL for data storage.
  - SQLAlchemy for ORM and database queries.

- **Frontend:**
  - React.js for the user interface.
  - Axios for API communication.

- **Others:**
  - Docker for containerization.
  - Form validation and error handling for smoother user experience.

## Setup

### Backend Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-repository-url
   ```

2. Install dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

3. Set up PostgreSQL and update the database connection URL in the `.env` file.

4. Run the backend:
   ```
   uvicorn app.main:app --reload
   ```

5. API will be available at `http://localhost:8000`.

### Frontend Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Start the frontend server:
   ```
   npm start
   ```

3. The frontend will be available at `http://localhost:3000`.

