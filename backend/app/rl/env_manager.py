import gymnasium as gym
from typing import Dict, Any, Optional
import uuid

class EnvManager:
    def __init__(self):
        self.envs: Dict[str, gym.Env] = {}

    def list_envs(self):
        # Return a list of supported/active environments
        # For now, just a static list of common Gym envs
        return ["CartPole-v1", "MountainCar-v0", "FrozenLake-v1"]

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
