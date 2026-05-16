from pydantic import BaseModel
from typing import Optional


class NestaChatRequest(BaseModel):
    message: str
    session_id: str = "default"
    consent_given: bool = True


class NestaChatResponse(BaseModel):
    message: str
    status: str = "ok"
    mode: str = "conversation"
    sources: Optional[list[str]] = None