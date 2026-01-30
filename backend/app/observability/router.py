from fastapi import APIRouter
from app.observability.tracer import tracer

router = APIRouter(prefix="/observability", tags=["observability"])

@router.get("/traces")
def list_traces():
    return {"traces": tracer.get_traces()}

@router.get("/traces/{trace_id}")
def get_trace(trace_id: str):
    return {"spans": tracer.get_trace_details(trace_id)}
