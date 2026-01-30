import time
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime

class Span:
    def __init__(self, trace_id: str, name: str, parent_id: Optional[str] = None):
        self.id = str(uuid.uuid4())
        self.trace_id = trace_id
        self.parent_id = parent_id
        self.name = name
        self.start_time = time.time()
        self.end_time = None
        self.attributes: Dict[str, Any] = {}
        self.events: List[Dict[str, Any]] = []

    def set_attribute(self, key: str, value: Any):
        self.attributes[key] = value

    def add_event(self, name: str, attributes: Dict[str, Any] = {}):
        self.events.append({
            "name": name,
            "timestamp": time.time(),
            "attributes": attributes
        })

    def end(self):
        self.end_time = time.time()

    def to_dict(self):
        return {
            "id": self.id,
            "trace_id": self.trace_id,
            "parent_id": self.parent_id,
            "name": self.name,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "duration": (self.end_time - self.start_time) if self.end_time else 0,
            "attributes": self.attributes,
            "events": self.events
        }

class Tracer:
    def __init__(self):
        self._traces: Dict[str, List[Span]] = {}
        self._active_spans: Dict[str, Span] = {} # Map span_id -> Span

    def start_trace(self, name: str) -> Span:
        trace_id = str(uuid.uuid4())
        span = Span(trace_id, name)
        if trace_id not in self._traces:
            self._traces[trace_id] = []
        self._traces[trace_id].append(span)
        return span

    def start_span(self, name: str, trace_id: str, parent_id: Optional[str] = None) -> Span:
        span = Span(trace_id, name, parent_id)
        if trace_id not in self._traces:
            self._traces[trace_id] = []
        self._traces[trace_id].append(span)
        return span

    def get_traces(self) -> List[Dict[str, Any]]:
        # Summarize traces
        summary = []
        for trace_id, spans in self._traces.items():
            if not spans: continue
            root = next((s for s in spans if s.parent_id is None), spans[0])
            
            # Calculate cost
            total_cost = 0.0
            for span in spans:
                # Naive cost estimation: $0.03 per 1k chars for demo (approx GPT-4 pricing)
                # In real app, we'd use token counts from provider response
                if span.name == "llm_generation" or span.name == "agent_chat": # Match span names
                    # Check for response length or prompt length attributes
                    # For now we only have response_length stored in 'llm_generation' span
                    resp_len = span.attributes.get("response_length", 0)
                    total_cost += (resp_len / 4000) * 0.03 

            summary.append({
                "trace_id": trace_id,
                "root_name": root.name,
                "start_time": root.start_time,
                "duration": max((s.end_time or time.time()) for s in spans) - root.start_time,
                "span_count": len(spans),
                "cost": round(total_cost, 6)
            })
        return sorted(summary, key=lambda x: x['start_time'], reverse=True)

    def get_trace_details(self, trace_id: str) -> List[Dict[str, Any]]:
        spans = self._traces.get(trace_id, [])
        return [s.to_dict() for s in spans]

# Global Instance
tracer = Tracer()
