from langchain_core.tools import tool
import numexpr

@tool
def calculator(expression: str) -> str:
    """Calculate the mathematical expression. useful for when you need to answer questions about math."""
    try:
        return str(numexpr.evaluate(expression))
    except Exception as e:
        return f"Error evaluating expression: {str(e)}"
