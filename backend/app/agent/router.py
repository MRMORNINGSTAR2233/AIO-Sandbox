from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from app.agent.registry import registry, AgentDefinition
from app.agent.orchestrator import orchestrator, WorkflowStep

router = APIRouter(prefix="/agents", tags=["agents"])

class RunWorkflowRequest(BaseModel):
    steps: List[Dict[str, str]] # [{'agent_id': '...', 'instruction': '...'}]
    initial_input: str

@router.post("/register")
def register_agent(agent: AgentDefinition):
    agent_id = registry.register_agent(agent)
    return {"status": "registered", "agent_id": agent_id}

@router.get("/")
def list_agents():
    return {"agents": registry.list_agents()}

@router.post("/workflow/sequential")
async def run_sequential_workflow(request: RunWorkflowRequest):
    try:
        # Convert raw dict steps to WorkflowStep objects
        workflow_steps = [
            WorkflowStep(agent_id=step['agent_id'], instruction=step['instruction']) 
            for step in request.steps
        ]
        
        result = await orchestrator.run_sequential(workflow_steps, request.initial_input)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
