from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.agent.core import Agent
from app.agent.registry import registry, AgentDefinition
import json

class SupervisorAgent:
    def __init__(self, model_name: str = "gpt-4"):
        self.supervisor_model = Agent(
            provider="openai",
            model_name=model_name,
            temperature=0.0
        )
    
    async def run(self, goal: str, agent_ids: List[str], max_steps: int = 10) -> Dict[str, Any]:
        """
        Orchestrates a team of agents to achieve a goal.
        """
        # 1. Fetch Agent Definitions
        team = []
        for aid in agent_ids:
            adef = registry.get_agent(aid)
            if adef:
                team.append(adef)
        
        if not team:
            return {"error": "No valid agents found for the team."}

        history = []
        final_output = ""
        
        # System Prompt for Supervisor
        team_desc = "\n".join([f"- {a.name} (ID: {a.id}): {a.role}" for a in team])
        system_prompt = f"""You are a Supervisor Agent managing a team of workers.
Your Goal: {goal}

Your Team:
{team_desc}

Protocol:
1. Analyze the current state and history.
2. Decide which agent to call next to make progress.
3. Provide a clear instruction to that agent.
4. If the goal is achieved, output "FINISH" with the final answer.

Output Format (JSON):
{{
    "next_agent_id": "agent_id_or_FINISH",
    "instruction": "Instruction for the agent or Final Answer",
    "reasoning": "Why you chose this step"
}}
"""

        steps = []
        
        for i in range(max_steps):
            # Form context
            context = f"History:\n"
            for step in history:
                context += f"Step {step['step']} - Agent {step['agent']}:\n{step['output']}\n\n"
            
            supervisor_input = f"{system_prompt}\n\n{context}\n\nWhat is the next step?"
            
            # Call Supervisor LLM
            # We need to enforce JSON output. 
            # (In a real system, we'd use json mode or function calling)
            decision_raw = await self.supervisor_model.chat(supervisor_input)
            
            try:
                # Naive JSON parsing/cleanup
                decision_json = decision_raw.strip()
                if decision_json.startswith("```json"):
                    decision_json = decision_json[7:-3]
                elif decision_json.startswith("```"):
                     decision_json = decision_json[3:-3]
                
                decision = json.loads(decision_json)
                
                next_agent_id = decision.get("next_agent_id")
                instruction = decision.get("instruction")
                reasoning = decision.get("reasoning")
                
                if next_agent_id == "FINISH":
                    final_output = instruction
                    break
                
                # Check validity
                agent_def = next((a for a in team if a.id == next_agent_id), None)
                if not agent_def:
                    # Supervisor hallucinated an ID? Retry or fail?
                    # Let's just log and continue/stop
                    break

                # Execute Agent
                worker_agent = Agent(
                    provider=agent_def.provider,
                    model_name=agent_def.model,
                    temperature=agent_def.temperature
                )
                
                # Context for worker? 
                # Ideally worker gets history too, or just the instruction.
                # Let's give specific instruction + relevant context summary potentially.
                # For simplicity, just instruction.
                worker_input = f"Supervisor Instruction: {instruction}\n\nContext:\n{context[-2000:]}" # Truncate context
                
                print(f"--- Supervisor calling {agent_def.name}: {instruction} ---")
                worker_output = await worker_agent.chat(worker_input)
                
                step_record = {
                    "step": i + 1,
                    "agent": agent_def.name,
                    "agent_id": agent_def.id,
                    "instruction": instruction,
                    "output": worker_output,
                    "reasoning": reasoning
                }
                history.append(step_record)
                steps.append(step_record)

            except Exception as e:
                print(f"Supervisor Error: {e}")
                final_output = f"Error: {str(e)}"
                break
        
        return {
            "goal": goal,
            "steps": steps,
            "final_output": final_output
        }

supervisor = SupervisorAgent()
