from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import uuid

class AgentDefinition(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    description: str = ""
    provider: str = "openai"
    model: str = "gpt-3.5-turbo"
    temperature: float = 0.7
    tools: List[str] = []
    
class AgentRegistry:
    def __init__(self):
        self._agents: Dict[str, AgentDefinition] = {}
        
    def register_agent(self, agent_def: AgentDefinition) -> str:
        self._agents[agent_def.id] = agent_def
        return agent_def.id
        
    def get_agent(self, agent_id: str) -> Optional[AgentDefinition]:
        return self._agents.get(agent_id)
        
    def list_agents(self) -> List[AgentDefinition]:
        return list(self._agents.values())
        
    def delete_agent(self, agent_id: str):
        if agent_id in self._agents:
            del self._agents[agent_id]

# Global Registry Instance
registry = AgentRegistry()
