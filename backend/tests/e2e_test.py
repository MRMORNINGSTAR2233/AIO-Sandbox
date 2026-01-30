import requests
import time
import sys
import json

BASE_URL = "http://localhost:8000"
HEADERS = {"X-Sandbox-Key": "sandbox-secret"}

def log(msg, status="INFO"):
    colors = {
        "INFO": "\033[94m",
        "SUCCESS": "\033[92m",
        "ERROR": "\033[91m",
        "RESET": "\033[0m"
    }
    print(f"{colors.get(status, '')}[{status}] {msg}{colors['RESET']}")

def check_health():
    try:
        res = requests.get(f"{BASE_URL}/health") # assuming /health or just /
        if res.status_code != 200:
             # Try root
             res = requests.get(f"{BASE_URL}/")
        
        if res.status_code == 200:
            log("Backend is UP", "SUCCESS")
            return True
        else:
            log(f"Backend returned {res.status_code}", "ERROR")
            return False
    except Exception as e:
        log(f"Backend not reachable: {e}", "ERROR")
        return False

def test_supervisor():
    log("Testing Supervisor Agent...")
    payload = {
        "goal": "Calculate 5 + 5",
        "team": ["researcher-1", "calculator-1"] # Assuming these exist or mock
        # We might need to register them first
    }
    
    # 1. Register agents first to be safe
    requests.post(f"{BASE_URL}/agents/register", json={
        "name": "MathAgent", "role": "You are a calculator.", "model": "gpt-3.5-turbo", "tools": []
    }, headers=HEADERS)
    
    # Get agent list to find ID
    agents_res = requests.get(f"{BASE_URL}/agents", headers=HEADERS).json()
    agent_id = agents_res['agents'][0]['id']
    
    payload['team'] = [agent_id]
    
    try:
        res = requests.post(f"{BASE_URL}/agents/workflow/supervisor", json=payload, headers=HEADERS)
        if res.status_code == 200:
            data = res.json()
            if "final_output" in data:
                log("Supervisor Workflow Successful", "SUCCESS")
            else:
                log("Supervisor response missing final_output", "ERROR")
        else:
            log(f"Supervisor verification failed: {res.text}", "ERROR")
    except Exception as e:
        log(f"Supervisor Exception: {e}", "ERROR")

def test_rl():
    log("Testing RL Studio...")
    # List Envs
    res = requests.get(f"{BASE_URL}/rl/envs")
    if res.status_code == 200:
        log("Fetched RL Environments", "SUCCESS")
    else:
        log("Failed to fetch RL Envs", "ERROR")
        
    # Start Training (Mock/Real)
    # We use a dummy env name usually available like 'CartPole-v1'
    train_payload = {"env_id": "CartPole-v1", "algo": "PPO", "timesteps": 1000}
    try:
        res = requests.post(f"{BASE_URL}/rl/train", json=train_payload)
        if res.status_code == 200:
            sess_id = res.json().get("session_id")
            log(f"Started RL Training: {sess_id}", "SUCCESS")
            # Check Status
            status_res = requests.get(f"{BASE_URL}/rl/train/{sess_id}")
            if status_res.status_code == 200:
                log("Training Status Verified", "SUCCESS")
        else:
            log(f"Failed to start training: {res.text}", "ERROR")
    except Exception as e:
        log(f"RL Exception: {e}", "ERROR")

def test_eval():
    log("Testing Eval Suite...")
    payload = {
        "model_name": "gpt-3.5-turbo",
        "benchmark_name": "python_coding",
        "judge_provider": "openai"
    }
    try:
        res = requests.post(f"{BASE_URL}/eval/run", json=payload, headers=HEADERS)
        if res.status_code == 200:
            data = res.json()
            if data.get("status") == "completed":
                log(f"Eval Run Successful. Score: {data.get('average_score')}", "SUCCESS")
        else:
            log(f"Eval failed: {res.text}", "ERROR")
            
        # Check Leaderboard
        l_res = requests.get(f"{BASE_URL}/eval/leaderboard")
        if l_res.status_code == 200:
            log("Leaderboard Accessible", "SUCCESS")
    except Exception as e:
        log(f"Eval Exception: {e}", "ERROR")

def run_all():
    if not check_health():
        sys.exit(1)
        
    test_supervisor()
    test_rl()
    test_eval()

if __name__ == "__main__":
    run_all()
