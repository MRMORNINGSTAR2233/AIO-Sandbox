from typing import List, Dict, Any
from pydantic import BaseModel

class BenchmarkResult(BaseModel):
    model: str
    benchmark: str
    score: float
    timestamp: float

# In-memory storage for demo. In prod, use Postgres.
_results: List[BenchmarkResult] = [
    BenchmarkResult(model="gpt-4", benchmark="python_coding", score=92.5, timestamp=1700000000),
    BenchmarkResult(model="gpt-3.5-turbo", benchmark="python_coding", score=78.2, timestamp=1700000000),
    BenchmarkResult(model="gemini-pro", benchmark="python_coding", score=85.0, timestamp=1700000000),
    BenchmarkResult(model="llama3-70b", benchmark="logic_reasoning", score=89.0, timestamp=1700000000),
]

class LeaderboardService:
    def add_result(self, model: str, benchmark: str, score: float):
        import time
        _results.append(BenchmarkResult(
            model=model, 
            benchmark=benchmark, 
            score=score, 
            timestamp=time.time()
        ))

    def get_leaderboard(self) -> List[Dict[str, Any]]:
        # Group by benchmark and rank models
        # For simplicity, just return list
        return [r.dict() for r in _results]

leaderboard = LeaderboardService()
