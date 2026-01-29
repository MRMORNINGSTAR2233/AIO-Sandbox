from app.agent.core import Agent

class AgentService:
    def __init__(self):
        self.agent = Agent()
        
    async def process_message(self, message: str) -> str:
        return await self.agent.chat(message)

    def update_agent_config(self, provider: str, model: str, temperature: float):
        self.agent.update_config(provider, model, temperature)
