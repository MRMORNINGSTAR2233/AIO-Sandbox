import re
from typing import List, Optional, Tuple

class SafetyGuardrails:
    def __init__(self):
        # Simple PII patterns (Demo purposes)
        self.pii_patterns = {
            "email": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
            "phone": r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",
            "ssn": r"\b\d{3}-\d{2}-\d{4}\b"
        }
        
        # Blocked terms (Simple Toxicity Filter)
        self.blocked_terms = ["unsafe_term_1", "unsafe_term_2"] 

    def sanitize(self, text: str) -> str:
        """Redacts PII from text."""
        sanitized = text
        for ptype, pattern in self.pii_patterns.items():
            sanitized = re.sub(pattern, f"[{ptype.upper()}_REDACTED]", sanitized)
        return sanitized

    def validate_output(self, text: str) -> Tuple[bool, Optional[str]]:
        """Checks if output contains blocked content."""
        for term in self.blocked_terms:
            if term in text.lower():
                return False, f"Blocked content detected: {term}"
        return True, None

# Global Instance
guardrails = SafetyGuardrails()
