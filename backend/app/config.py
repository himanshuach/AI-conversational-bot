import os
from pydantic import BaseModel
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

class Settings(BaseModel):
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    BASE_URL: str = os.getenv("BASE_URL", "https://api.openai.com/v1")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    # Project specific ground truths
    PROJECT_NAME: str = "Northstar One"
    DEVELOPER_NAME: str = "Northstar Homes"
    LOCATION: str = "Sector 79, Gurugram"
    PRICE_2BHK: str = "₹1.35 Crore onwards"
    PRICE_3BHK: str = "₹1.75 Crore onwards"

settings = Settings()
