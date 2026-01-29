from typing import Any, Dict, List, Optional
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables import RunnableConfig
import os

class Agent:
    def __init__(self, provider: str = "openai", model_name: str = "gpt-3.5-turbo", temperature: float = 0.7):
        self.provider = provider
        self.model_name = model_name
        self.temperature = temperature
        self.llm = self._get_llm(provider, model_name, temperature)
        
    def _get_llm(self, provider: str, model_name: str, temperature: float):
        if provider == "openai":
            return ChatOpenAI(model=model_name, temperature=temperature)
        elif provider == "groq":
            return ChatGroq(model_name=model_name, temperature=temperature)
        elif provider == "gemini":
            return ChatGoogleGenerativeAI(model=model_name, temperature=temperature)
        else:
            # Default fallback
            return ChatOpenAI(model=model_name, temperature=temperature)

    async def chat(self, message: str, history: List[Dict[str, str]] = []) -> str:
        messages = []
        for msg in history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(SystemMessage(content=msg["content"]))
                
        messages.append(HumanMessage(content=message))
        
        response = await self.llm.ainvoke(messages)
        return response.content

    def update_config(self, provider: str, model_name: str, temperature: float):
        self.provider = provider
        self.model_name = model_name
        self.temperature = temperature
        self.llm = self._get_llm(provider, model_name, temperature)
