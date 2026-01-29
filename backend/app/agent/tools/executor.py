import docker
import subprocess
from typing import Optional

class CodeExecutor:
    def __init__(self, image: str = "python:3.11-slim"):
        self.image = image
        try:
            self.client = docker.from_env()
        except Exception:
            self.client = None
            print("Warning: Docker client not initialized.")

    def run_code(self, code: str) -> str:
        if not self.client:
            return "Error: Docker not available."
        
        try:
            # Simple ephemeral container execution
            container = self.client.containers.run(
                self.image,
                command=["python", "-c", code],
                detach=True,
                network_disabled=True, # Isolation
                mem_limit="128m",
                cpu_quota=50000,
            )
            
            exit_code = container.wait(timeout=10)
            logs = container.logs().decode("utf-8")
            container.remove()
            
            if exit_code['StatusCode'] != 0:
                return f"Execution Error:\n{logs}"
            return logs
            
        except Exception as e:
            return f"System Error: {str(e)}"
