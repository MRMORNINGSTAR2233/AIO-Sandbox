import gymnasium as gym
from typing import Dict, Any, Optional
import uuid
import importlib.util
import os
import sys

class EnvManager:
    def __init__(self):
        self.envs: Dict[str, gym.Env] = {}

    def list_envs(self):
        return ["CartPole-v1", "MountainCar-v0", "FrozenLake-v1"]

    def register_custom_env(self, file_path: str, module_name: str, env_id: str):
        """
        Dynamically load a python module and register the env.
        Assuming the file contains a class named 'CustomEnv' or registers itself.
        """
        spec = importlib.util.spec_from_file_location(module_name, file_path)
        if spec and spec.loader:
            module = importlib.util.module_from_spec(spec)
            sys.modules[module_name] = module
            spec.loader.exec_module(module)
            # If the module registers itself, we are good.
            # If it defines a class, we might need to manually register.
            # For simplicity, we assume the user's script calls gym.register()
            # or simply defining the class is enough if we use the class directly.
            return True
        return False

    def create_env(self, env_id: str) -> str:
        """
        Creates a new environment instance and returns its session ID.
        """
        try:
            env = gym.make(env_id, render_mode="rgb_array")
            session_id = str(uuid.uuid4())
            self.envs[session_id] = env
            return session_id
        except Exception as e:
            raise ValueError(f"Failed to create env {env_id}: {str(e)}")

    def step(self, session_id: str, action: int) -> Dict[str, Any]:
        if session_id not in self.envs:
            raise ValueError("Session not found")
        
        env = self.envs[session_id]
        obs, reward, terminated, truncated, info = env.step(action)
        
        # Convert observation to list if it's a numpy array for JSON serialization
        if hasattr(obs, "tolist"):
            obs = obs.tolist()
            
        return {
            "observation": obs,
            "reward": reward,
            "terminated": terminated,
            "truncated": truncated,
            "info": info
        }

    def reset(self, session_id: str):
        if session_id not in self.envs:
            raise ValueError("Session not found")
        
        env = self.envs[session_id]
        obs, info = env.reset()
        
        if hasattr(obs, "tolist"):
            obs = obs.tolist()
            
        return {
            "observation": obs,
            "info": info
        }

    def close(self, session_id: str):
        if session_id in self.envs:
            self.envs[session_id].close()
            del self.envs[session_id]
