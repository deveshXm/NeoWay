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
    
    
    
class GetFlights(BaseModel):
    adults: int
    children: int
    departDate: str
    returnDate: str
    flightBudget: int
    
    
    
class Location(BaseModel):
    code: str
    city: str
    cityName: str
    country: str