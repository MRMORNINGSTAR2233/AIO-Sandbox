import docker
import asyncio
from typing import Dict, Any, Optional

class SandboxExecutor:
    def __init__(self):
        try:
            self.client = docker.from_env()
        except Exception:
            self.client = None
            print("Warning: Docker client not initialized.")
            
        self.configs = {
            "python": {
                "image": "python:3.11-slim",
                "command": ["python", "-c"],
                "file_ext": "py"
            },
            "javascript": {
                "image": "node:18-slim",
                "command": ["node", "-e"],
                "file_ext": "js"
            },
            "bash": {
                "image": "ubuntu:latest",
                "command": ["bash", "-c"],
                "file_ext": "sh"
            }
        }

    def execute(self, language: str, code: str) -> Dict[str, Any]:
        if not self.client:
            return {"status": "error", "output": "Docker not available"}
            
        config = self.configs.get(language.lower())
        if not config:
            return {"status": "error", "output": f"Language {language} not supported"}
            
        try:
            container = self.client.containers.run(
                config["image"],
                command=config["command"] + [code],
                detach=True,
                network_disabled=True, # Security
                mem_limit="128m",
                cpu_quota=50000,
            )
            
            exit_code = container.wait(timeout=10)
            logs = container.logs().decode("utf-8")
            container.remove()
            
            return {
                "status": "success" if exit_code['StatusCode'] == 0 else "failure",
                "output": logs,
                "exit_code": exit_code['StatusCode']
            }
            
        except Exception as e:
            return {"status": "error", "output": str(e)}

# Global Instance
sandbox = SandboxExecutor()
