import chromadb
from chromadb.utils import embedding_functions
from typing import List, Dict, Any

class VectorStore:
    def __init__(self, collection_name: str = "sandbox_memory"):
        # Persistent storage
        self.client = chromadb.PersistentClient(path="./chroma_db")
        
        # Default embedding function (all-MiniLM-L6-v2)
        self.embedding_fn = embedding_functions.DefaultEmbeddingFunction()
        
        self.collection = self.client.get_or_create_collection(
            name=collection_name, 
            embedding_function=self.embedding_fn
        )

    def add_documents(self, documents: List[str], metadatas: List[Dict[str, Any]], ids: List[str]):
        """Adds documents to the vector store."""
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

    def query(self, query_text: str, n_results: int = 3) -> Dict[str, Any]:
        """Queries the vector store for similar documents."""
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        return results

# Global Instance
vector_store = VectorStore()
