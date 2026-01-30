from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.memory.vector_db import vector_store
from app.memory.rag import rag
import uuid

router = APIRouter(prefix="/memory", tags=["memory"])

class AddDocRequest(BaseModel):
    text: str
    metadata: Dict[str, Any] = {}

class QueryRequest(BaseModel):
    query: str
    top_k: int = 3

@router.post("/add")
def add_document(request: AddDocRequest):
    try:
        doc_id = str(uuid.uuid4())
        vector_store.add_documents(
            documents=[request.text],
            metadatas=[request.metadata],
            ids=[doc_id]
        )
        return {"status": "added", "id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query")
def query_memory(request: QueryRequest):
    try:
        results = vector_store.query(request.query, request.top_k)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/retrieve_context")
def retrieve_rag_context(request: QueryRequest):
    ctx = rag.retrieve_context(request.query, request.top_k)
    return {"context": ctx}
