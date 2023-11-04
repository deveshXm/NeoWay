from pydantic import BaseModel


class Message(BaseModel):
    content: str
    role: str  # "user" or "assistant"