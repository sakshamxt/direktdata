from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import engine, metadata
from agent import process_user_query

# Initialize the FastAPI application
app = FastAPI(
    title="DirektData AI Microservice",
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the expected incoming data structure
class QueryRequest(BaseModel):
    prompt: str

@app.get("/")
async def health_check():
    """Basic health check to ensure the server is running."""
    return {"status": "healthy", "service": "DirektData AI Agent"}

@app.get("/api/schema")
async def get_schema():
    return {
        "status": "success",
        "tables_found": list(metadata.tables.keys())
    }

@app.post("/api/query")
async def run_query(request: QueryRequest):
    """
    Takes a natural language prompt, runs the LangChain SQL agent, 
    and returns UI-ready JSON.
    """
    result = process_user_query(request.prompt)
    return result