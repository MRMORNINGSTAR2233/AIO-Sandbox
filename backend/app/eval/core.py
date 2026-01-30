from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.agent.core import Agent # Use our existing Agent as the subject
import asyncio

class TestCase(BaseModel):
    input_text: str
    expected_output: Optional[str] = None
    criteria: List[str] = [] # "conciseness", "accuracy"

class EvaluationResult(BaseModel):
    input_text: str
    output_text: str
    score: float
    reasoning: str

class Evaluator:
    def __init__(self):
        pass

    async def run_benchmark(self, agent: Agent, test_cases: List[TestCase]) -> List[EvaluationResult]:
        results = []
        for case in test_cases:
            # Generate
            output = await agent.chat(case.input_text)
            
            # Score (Mock for now, will use metrics)
            from app.eval.metrics import calculate_score
            score, reasoning = await calculate_score(case, output)
            
            results.append(EvaluationResult(
                input_text=case.input_text,
                output_text=output,
                score=score,
                reasoning=reasoning
            ))
        return results

evaluator = Evaluator()
