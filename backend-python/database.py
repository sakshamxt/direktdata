import os
from sqlalchemy import create_engine, MetaData
from dotenv import load_dotenv

# Load the Supabase connection string from .env
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# Create the SQLAlchemy engine
# pool_pre_ping ensures the connection is alive before executing queries
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# MetaData holds the blueprint of our database
metadata = MetaData()

# Reflect the tables from the database into our metadata object
# This is how the AI will eventually know about 'users', 'orders', etc.
try:
    metadata.reflect(bind=engine)
    print("Successfully connected to Supabase and reflected schema.")
except Exception as e:
    print(f"Failed to connect to the database: {e}")