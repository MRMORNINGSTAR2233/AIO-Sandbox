from typing import List, Dict, Any
from app.agent.registry import registry, AgentDefinition
from app.agent.core import Agent
import asyncio

class WorkflowStep:
    def __init__(self, agent_id: str, instruction: str):
        self.agent_id = agent_id
        self.instruction = instruction

class Orchestrator:
    def __init__(self):
        self.active_agents: Dict[str, Agent] = {}

    def _get_or_create_agent(self, agent_def: AgentDefinition) -> Agent:
        # In a real system, we might cache these or manage lifecycle better
        # For now, we instantiate a new core Agent for each execution to ensure fresh state or we could cache.
        # Let's instantiate fresh for simplicity and state safety.
        return Agent(
            provider=agent_def.provider, 
            model_name=agent_def.model, 
            temperature=agent_def.temperature,
            tools_enabled=(len(agent_def.tools) > 0)
        )

    async def run_sequential(self, steps: List[WorkflowStep], initial_input: str) -> Dict[str, Any]:
        """
        Executes a linear chain of agents. 
        Each agent's output becomes the context/input for the next, 
        or we can accumulate context.
        """
        results = []
        current_input = initial_input
        
        for i, step in enumerate(steps):
            agent_def = registry.get_agent(step.agent_id)
            if not agent_def:
                raise ValueError(f"Agent {step.agent_id} not found in registry.")
                
            agent_instance = self._get_or_create_agent(agent_def)
            
            # Construct a prompt that includes the instruction and the input
            # If it's the first step, input is user input.
            # If subsequent, input is previous agent's output.
            combined_prompt = f"{step.instruction}\n\nInput Context:\n{current_input}"
            
            print(f"--- Running Step {i+1}: {agent_def.name} ({agent_def.role}) ---")
            response = await agent_instance.chat(combined_prompt)
            
            results.append({
                "step": i + 1,
                "agent": agent_def.name,
                "output": response
            })
            
            # Pass output to next agent
            current_input = response
            
        return {
            "final_output": current_input,
            "trace": results
        }

# Global Orchestrator
orchestrator = Orchestrator()
