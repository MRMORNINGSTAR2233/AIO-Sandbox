from typing import Callable, Dict, List, Optional, Any
from pydantic import BaseModel

class ToolDefinition(BaseModel):
    name: str
    description: str
    func: Callable
    parameters: Dict[str, Any] = {} # JSON Schema for parameters

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}

    def register_tool(self, name: str, description: str, func: Callable, parameters: Dict[str, Any] = {}):
        self._tools[name] = ToolDefinition(
            name=name,
            description=description,
            func=func,
            parameters=parameters
        )

    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        return self._tools.get(name)

    def list_tools(self) -> List[Dict[str, Any]]:
        return [
            {"name": t.name, "description": t.description, "parameters": t.parameters}
            for t in self._tools.values()
        ]
        
    def get_all_tools(self) -> List[ToolDefinition]:
        return list(self._tools.values())

# Global Instance
tool_registry = ToolRegistry()

# Register built-in tools (Example)
from app.agent.tools.calculator import calculator
from app.agent.tools.search import search

tool_registry.register_tool(
    name="calculator",
    description="Useful for performing mathematical calculations.",
    func=calculator
)

tool_registry.register_tool(
    name="search",
    description="Useful for searching the internet for current information.",
    func=search
)
