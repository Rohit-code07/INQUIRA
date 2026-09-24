from pydantic import BaseModel
from typing import Any, Dict, Optional

class ResearchRequest(BaseModel):
    question: str

class ResearchResponse(BaseModel):
    success: bool
    question: str
    result: Dict[str, Any]

class ErrorResponse(BaseModel):
    success: bool
    error: str
