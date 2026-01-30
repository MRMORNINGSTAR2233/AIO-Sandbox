from app.eval.core import TestCase
from app.agent.core import Agent

# We need a judge agent. For simplicity, we create a fresh one or use a singleton.
# Ideally, the judge should be a strong model (GPT-4).
judge_agent = Agent(provider="openai", model_name="gpt-4", temperature=0.0)

async def calculate_score(test_case: TestCase, actual_output: str) -> tuple[float, str]:
    """
    Uses LLM-as-Judge to score the output based on expected output and criteria.
    Returns (score 0-10, reasoning).
    """
    if not test_case.expected_output and not test_case.criteria:
        return 10.0, "No criteria provided, passing by default."

    prompt = f"""
    You are an impartial judge evaluating an AI assistant's response.
    
    Input: {test_case.input_text}
    Actual Output: {actual_output}
    Expected Output (Reference): {test_case.expected_output or "N/A"}
    Criteria: {", ".join(test_case.criteria)}
    
    Rate the Actual Output on a scale from 0 to 10.
    Provide the score first, then a brief explanation.
    Format usage: "Score: 8\nReasoning: ..."
    """
    
    try:
        # In a real app we'd handle this more robustly or use a dedicated Judge class
        evaluation = await judge_agent.chat(prompt)
        
        # Parse
        lines = evaluation.split('\n')
        score = 0.0
        reasoning = evaluation
        
        for line in lines:
            if line.startswith("Score:"):
                try:
                    score = float(line.replace("Score:", "").strip())
                except:
                    pass
                    
        return score, reasoning
    except Exception as e:
        return 0.0, f"Evaluation Failed: {str(e)}"
