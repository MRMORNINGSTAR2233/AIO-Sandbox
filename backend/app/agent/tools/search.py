from langchain_core.tools import tool

@tool
def search(query: str) -> str:
    """Search the web for information. Useful for when you need to answer questions about current events."""
    # Mocking search for now to avoid needing API keys immediately
    # In production, replace with TavilySearchResults or GoogleSearchAPIWrapper
    return f"Mock search results for '{query}': AI Sandbox is a project for testing agents."
