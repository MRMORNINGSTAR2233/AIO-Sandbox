from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.agent.tool_registry import tool_registry

router = APIRouter(prefix="/tools", tags=["tools"])

class ToolModel(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]

class CustomToolRequest(BaseModel):
    name: str
    description: str
    code: str  # Python code defining the tool

@router.get("/")
def list_tools():
    return {"tools": tool_registry.list_tools()}

@router.post("/custom")
def create_custom_tool(request: CustomToolRequest):
    # DANGEROUS: Dynamic code loading.
    # In a real secure system, we'd use the SandboxExecutor to run this.
    # For this prototype, we will define a wrapper that calls the Sandbox.
    
    from app.sandbox.executor import sandbox
    from langchain_core.tools import tool
    
    # We define a generic function that runs the code in the sandbox
    @tool
    def dynamic_tool(input_str: str) -> str:
        """Dynamic custom tool."""
        # We wrap the user code to handle the input
        # This is a simplification. Ideally we parse the user code to find a function.
        # Let's assume user code expects a variable 'input_var'
        full_code = f"{request.code}\n\nprint(run('{input_str}'))"
        result = sandbox.execute("python", full_code)
        return result["output"]
    
    # Update metadata
    dynamic_tool.name = request.name
    dynamic_tool.description = request.description
    
    # Register
    tool_registry.register_tool(request.name, request.description, dynamic_tool)
    
    return {"status": "created", "name": request.name}
