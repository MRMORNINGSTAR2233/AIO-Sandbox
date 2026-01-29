from app.agent.core import Agent
from app.db.session import get_db, engine
from app.db.models import Base, ChatLog

# Create tables if not exist (simple migration)
Base.metadata.create_all(bind=engine)

class AgentService:
    def __init__(self):
        self.agent = Agent()
        
    async def process_message(self, message: str) -> str:
        # Save User Message
        db = next(get_db())
        user_log = ChatLog(
            role="user", 
            content=message, 
            provider=self.agent.provider, 
            model=self.agent.model_name
        )
        db.add(user_log)
        db.commit()

        # Get Response
        response = await self.agent.chat(message)

        # Save AI Message
        ai_log = ChatLog(
            role="assistant", 
            content=response, 
            provider=self.agent.provider, 
            model=self.agent.model_name
        )
        db.add(ai_log)
        db.commit()
        
        return response

    def update_agent_config(self, provider: str, model: str, temperature: float, mode: str = "chat"):
        tools_enabled = (mode == "agent")
        self.agent.update_config(provider, model, temperature, tools_enabled)
