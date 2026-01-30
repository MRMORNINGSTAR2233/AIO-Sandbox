from app.agent.core import Agent
from app.db.session import get_db, engine
from app.db.models import Base, ChatLog

# Create tables if not exist (simple migration)
Base.metadata.create_all(bind=engine)

class AgentService:
    def __init__(self):
        self.agent = Agent()
        
    async def process_message(self, message: str, use_rag: bool = False) -> str:
        from app.observability.tracer import tracer
        
        # Start Root Trace
        root_span = tracer.start_trace("chat_request")
        root_span.set_attribute("message", message)
        root_span.set_attribute("provider", self.agent.provider)
        
        try:
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

            # RAG / Retrieval
            final_message = message
            if use_rag:
                rag_span = tracer.start_span("rag_retrieval", root_span.trace_id, root_span.id)
                from app.memory.rag import rag
                context = rag.retrieve_context(message)
                
                if context:
                    final_message = rag.format_prompt(message, context)
                    rag_span.set_attribute("context_length", len(context))
                    print(f"--- RAG Context Injected ---\n{context[:100]}...\n--------------------------")
                
                rag_span.end()

            # Get Response
            llm_span = tracer.start_span("llm_generation", root_span.trace_id, root_span.id)
            raw_response = await self.agent.chat(final_message)
            llm_span.set_attribute("response_length", len(raw_response))
            llm_span.end()
            
            # Apply Guardrails
            guard_span = tracer.start_span("guardrails_check", root_span.trace_id, root_span.id)
            from app.safety.guardrails import guardrails
            
            # 1. Output Validation
            is_safe, error_msg = guardrails.validate_output(raw_response)
            if not is_safe:
               response = f"[SAFETY BLOCKED]: {error_msg}"
               guard_span.set_attribute("blocked", True)
            else:
               # 2. PII Sanitization
               response = guardrails.sanitize(raw_response)
               guard_span.set_attribute("sanitized", True)
            
            guard_span.end()

            # Save AI Message
            ai_log = ChatLog(
                role="assistant", 
                content=response, 
                provider=self.agent.provider, 
                model=self.agent.model_name
            )
            db.add(ai_log)
            db.commit()
            
            root_span.end()
            return response
            
        except Exception as e:
            root_span.set_attribute("error", str(e))
            root_span.end()
            raise e

    def update_agent_config(self, provider: str, model: str, temperature: float, mode: str = "chat"):
        tools_enabled = (mode == "agent")
        self.agent.update_config(provider, model, temperature, tools_enabled)
