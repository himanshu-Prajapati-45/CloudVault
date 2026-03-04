import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

# Use MONGO_URI from centralized settings
MONGO_URI = settings.MONGO_URI

logging.info(f"Connecting to MongoDB...")
client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client["cloudvault"] # Real database name

users_col = db["login details"]
files_col = db["files"]

# More accurate initialization log
try:
    logging.info(f"MongoDB connection established successfully to database: {db.name}")
except Exception as e:
    logging.error(f"MongoDB connection failed: {str(e)}")
