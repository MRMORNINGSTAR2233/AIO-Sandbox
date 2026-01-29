from typing import Any, Dict, List, Optional
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from app.agent.tools.calculator import calculator
from app.agent.tools.search import search

class Agent:
    def __init__(self, provider: str = "openai", model_name: str = "gpt-3.5-turbo", temperature: float = 0.7, tools_enabled: bool = False):
        self.provider = provider
        self.model_name = model_name
        self.temperature = temperature
        self.tools_enabled = tools_enabled
        self.llm = self._get_llm(provider, model_name, temperature)
        self.tools = [calculator, search] if tools_enabled else []
        
        if self.tools_enabled:
            # Setup ReAct / Tool Calling Agent
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are a helpful AI assistant. Use the available tools to answer the user's questions if needed."),
                ("human", "{input}"),
                ("placeholder", "{agent_scratchpad}"),
            ])
            self.agent_runnable = create_tool_calling_agent(self.llm, self.tools, prompt)
            self.executor = AgentExecutor(agent=self.agent_runnable, tools=self.tools, verbose=True)
        
    def _get_llm(self, provider: str, model_name: str, temperature: float):
        if provider == "openai":
            return ChatOpenAI(model=model_name, temperature=temperature)
        elif provider == "groq":
            return ChatGroq(model_name=model_name, temperature=temperature)
        elif provider == "gemini":
            return ChatGoogleGenerativeAI(model=model_name, temperature=temperature)
        else:
            return ChatOpenAI(model=model_name, temperature=temperature)

    async def chat(self, message: str, history: List[Dict[str, str]] = []) -> str:
        if self.tools_enabled:
            # Use AgentExecutor
            response = await self.executor.ainvoke({"input": message})
            return response["output"]
        else:
            # Standard Chat
            messages = []
            for msg in history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(SystemMessage(content=msg["content"]))
            messages.append(HumanMessage(content=message))
            response = await self.llm.ainvoke(messages)
            return response.content

    def update_config(self, provider: str, model_name: str, temperature: float, tools_enabled: bool = False):
        # Re-init if config changes
        self.__init__(provider, model_name, temperature, tools_enabled)
