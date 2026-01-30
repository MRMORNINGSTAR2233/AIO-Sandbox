"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Code, FileText } from "lucide-react";

const TEMPLATES = {
    "SimpleGrid": `import gymnasium as gym
from gymnasium import spaces
import numpy as np

class SimpleGridEnv(gym.Env):
    def __init__(self):
        self.observation_space = spaces.Box(low=0, high=1, shape=(3,3), dtype=np.float32)
        self.action_space = spaces.Discrete(4)
        self.state = np.zeros((3,3))
        
    def reset(self, seed=None):
        super().reset(seed=seed)
        self.state = np.zeros((3,3))
        return self.state, {}
        
    def step(self, action):
        reward = 1.0
        done = True
        return self.state, reward, done, False, {}
`,
    "CartPoleWrapper": `import gymnasium as gym

class MyCartPole(gym.Wrapper):
    def __init__(self):
        env = gym.make("CartPole-v1")
        super().__init__(env)
        
    def step(self, action):
        obs, reward, terminated, truncated, info = self.env.step(action)
        return obs, reward * 2, terminated, truncated, info
`
};

export default function RLStudioPage() {
    const [envName, setEnvName] = useState("MyEnv");
    const [code, setCode] = useState(TEMPLATES["SimpleGrid"]);
    const [status, setStatus] = useState("");

    const saveEnv = async () => {
        setStatus("Saving...");
        try {
            const res = await fetch("http://localhost:8000/envs/create_custom", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Sandbox-Key": "sandbox-secret" },
                body: JSON.stringify({ name: envName, code })
            });
            const data = await res.json();
            setStatus(`Saved! Env ID: ${data.env_id}`);
        } catch (e) {
            setStatus("Error saving environment.");
        }
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">RL Studio</h2>
                    <p className="text-muted-foreground">Design and register custom Reinforcement Learning environments.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCode(TEMPLATES["SimpleGrid"])}><FileText size={16} className="mr-2" /> Load Grid Template</Button>
                    <Button variant="outline" onClick={() => setCode(TEMPLATES["CartPoleWrapper"])}><FileText size={16} className="mr-2" /> Load Wrapper</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                <Card className="lg:col-span-2 h-full flex flex-col bg-card/50">
                    <CardHeader className="flex flex-row items-center justify-between py-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Code size={16} className="text-primary" /> Python Code Editor
                        </CardTitle>
                        <div className="flex gap-2">
                            <Input
                                className="h-8 w-40"
                                placeholder="Env Name"
                                value={envName}
                                onChange={e => setEnvName(e.target.value)}
                            />
                            <Button size="sm" onClick={saveEnv}>
                                <Save size={14} className="mr-2" /> Register Env
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <textarea
                            className="w-full h-full bg-black/40 p-4 font-mono text-sm focus:outline-none resize-none rounded-b-lg"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            spellCheck={false}
                        />
                    </CardContent>
                </Card>

                <Card className="h-full bg-card/50">
                    <CardHeader><CardTitle>Status & Documentation</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>Write a class that inherits from <code>gym.Env</code> or returns a Gym environment.</p>
                        <p>Once registered, you can use this Environment ID in the main Dashboard to train agents.</p>

                        {status && (
                            <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-foreground font-semibold border border-primary/20">
                                {status}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
