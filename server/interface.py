from pydantic import BaseModel


class Message(BaseModel):
    content: str
    role: str  # "user" or "assistant"
    
    
class Recommendation(BaseModel):
    destination: str
    departure: str
    start_date: str
    end_date: str
    budget: str