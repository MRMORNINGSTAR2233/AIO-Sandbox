from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.eval.core import evaluator, TestCase, EvaluationResult
from app.agent.core import Agent
from app.eval.leaderboard import leaderboard
import random

router = APIRouter(prefix="/eval", tags=["evaluation"])

class EvalRequest(BaseModel):
    model_name: str = "gpt-3.5-turbo"
    benchmark_name: str = "mmlu_lite"
    judge_provider: str = "openai"

@router.post("/run")
async def run_eval(request: EvalRequest):
    # Simulation Logic for Demo
    score = random.uniform(70, 95)
    
    leaderboard.add_result(model=request.model_name, benchmark=request.benchmark_name, score=score)
    
    return {
        "status": "completed",
        "average_score": score,
        "results": [],
        "mock": True
    }

@router.get("/leaderboard")
def get_leaderboard():
    return {"results": leaderboard.get_leaderboard()}
