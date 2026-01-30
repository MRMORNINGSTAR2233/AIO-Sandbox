import gymnasium as gym
from stable_baselines3 import PPO, DQN, A2C
from stable_baselines3.common.callbacks import BaseCallback
from typing import Dict, Any, Optional
import threading
import os
import time

class TrainingCallback(BaseCallback):
    def __init__(self, session_id: str, verbose=0):
        super().__init__(verbose)
        self.session_id = session_id
        self.episode_count = 0
        self.last_mean_reward = 0.0

    def _on_step(self) -> bool:
        # Check for DONE
        if 'dones' in self.locals:
             for done in self.locals['dones']:
                 if done:
                     self.episode_count += 1
                     if 'rewards' in self.locals:
                         # Simplified reward tracking
                         pass
        return True

class SB3Service:
    def __init__(self):
        self.active_trainings: Dict[str, Any] = {}
        os.makedirs("models", exist_ok=True)

    def train(self, env_id: str, algo: str, total_timesteps: int) -> str:
        """
        Starts training in a background thread.
        """
        session_id = f"{env_id}_{algo}_{int(time.time())}"
        
        thread = threading.Thread(
            target=self._train_process,
            args=(session_id, env_id, algo, total_timesteps)
        )
        thread.start()
        
        self.active_trainings[session_id] = {
            "status": "training",
            "env": env_id,
            "algo": algo,
            "progress": 0
        }
        return session_id

    def _train_process(self, session_id: str, env_id: str, algo: str, total_timesteps: int):
        try:
            # Load Env - Assumes env_id is registered with Gym
            # If it's a custom env from our file uploads, we need to ensure it's registered.
            # Usually router.py handles registration on upload.
            
            env = gym.make(env_id)
            
            model = None
            if algo == "PPO":
                model = PPO("MlpPolicy", env, verbose=1)
            elif algo == "DQN":
                model = DQN("MlpPolicy", env, verbose=1)
            elif algo == "A2C":
                model = A2C("MlpPolicy", env, verbose=1)
            else:
                raise ValueError(f"Algo {algo} not supported")
            
            callback = TrainingCallback(session_id)
            model.learn(total_timesteps=total_timesteps, callback=callback)
            
            model.save(f"models/{session_id}")
            self.active_trainings[session_id]["status"] = "completed"
            
        except Exception as e:
            print(f"Training failed: {e}")
            self.active_trainings[session_id]["status"] = "failed"
            self.active_trainings[session_id]["error"] = str(e)

    def get_status(self, session_id: str):
        return self.active_trainings.get(session_id)

sb3_service = SB3Service()
