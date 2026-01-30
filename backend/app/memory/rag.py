from typing import List, Dict, Any
from app.memory.vector_db import vector_store

class RAGPipeline:
    def __init__(self):
        self.store = vector_store

    def retrieve_context(self, query: str, top_k: int = 3) -> str:
        """
        Retrieves relevant context from the vector store and formats it as a string.
        """
        results = self.store.query(query, n_results=top_k)
        
        # Flatten results
        documents = results['documents'][0] # List of documents
        metadatas = results['metadatas'][0] # List of metadata
        
        context_parts = []
        for i, doc in enumerate(documents):
            source = metadatas[i].get('source', 'unknown')
            context_parts.append(f"[Source: {source}]\n{doc}")
            
        return "\n\n".join(context_parts)

    def format_prompt(self, query: str, context: str) -> str:
        """
        Formats the RAG prompt.
        """
        return f"""
You are an AI assistant with access to a knowledge base.
Use the following context to answer the user's question. 
If the answer is not in the context, say so.

Context:
{context}

Question: 
{query}

Answer:
"""

rag = RAGPipeline()
