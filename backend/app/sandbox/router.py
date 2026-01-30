from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
from app.sandbox.executor import sandbox

router = APIRouter(prefix="/sandbox", tags=["sandbox"])

class ExecuteRequest(BaseModel):
    language: str
    code: str

@router.post("/run")
def run_code(request: ExecuteRequest):
    result = sandbox.execute(request.language, request.code)
    if result["status"] == "error":
        # We return 200 with error details usually for sandbox to show them, 
        # or 400 if it's a system error.
        # Let's return 200 with failure content for compilation/runtime errors
        pass
    return result
