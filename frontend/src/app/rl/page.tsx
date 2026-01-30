"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Play, Square } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function RLDashboard() {
    const [envs, setEnvs] = useState<string[]>([]);
    const [selectedEnv, setSelectedEnv] = useState("");
    const [algo, setAlgo] = useState("PPO");
    const [timesteps, setTimesteps] = useState(10000);
    const [trainingSession, setTrainingSession] = useState<string | null>(null);
    const [status, setStatus] = useState<any>(null);

    useEffect(() => {
        fetch("http://localhost:8000/rl/envs")
            .then(res => res.json())
            .then(data => setEnvs(data.envs))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!trainingSession) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:8000/rl/train/${trainingSession}`);
                const data = await res.json();
                setStatus(data);
                if (data.status === "completed" || data.status === "failed") {
                    clearInterval(interval);
                }
            } catch (e) {
                console.error(e);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [trainingSession]);

    const startTraining = async () => {
        if (!selectedEnv) return;
        try {
            const res = await fetch("http://localhost:8000/rl/train", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ env_id: selectedEnv, algo, timesteps })
            });
            const data = await res.json();
            setTrainingSession(data.session_id);
            setStatus({ status: "started" });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <header>
                <h2 className="text-3xl font-bold tracking-tight">RL Dashboard</h2>
                <p className="text-muted-foreground">Train agents using Stable-Baselines3.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card/50">
                    <CardHeader><CardTitle>Training Configuration</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Environment</label>
                            <Select value={selectedEnv} onValueChange={setSelectedEnv}>
                                <SelectTrigger><SelectValue placeholder="Select Env" /></SelectTrigger>
                                <SelectContent>
                                    {envs.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Algorithm</label>
                            <Select value={algo} onValueChange={setAlgo}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PPO">PPO (Proximal Policy Optimization)</SelectItem>
                                    <SelectItem value="DQN">DQN (Deep Q-Network)</SelectItem>
                                    <SelectItem value="A2C">A2C (Advantage Actor Critic)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Total Timesteps</label>
                            <Input type="number" value={timesteps} onChange={e => setTimesteps(parseInt(e.target.value))} />
                        </div>

                        <Button className="w-full" onClick={startTraining} disabled={!selectedEnv || (status && status.status === "training")}>
                            {status && status.status === "training" ? <Activity className="mr-2 animate-pulse" /> : <Play className="mr-2" />}
                            Start Training
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-card/50">
                    <CardHeader><CardTitle>Training Status</CardTitle></CardHeader>
                    <CardContent>
                        {!status ? (
                            <div className="text-muted-foreground text-center py-10">No active training session.</div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-black/20 rounded-lg border">
                                    <div className="text-sm text-muted-foreground">Session ID</div>
                                    <div className="font-mono text-xs mb-2">{trainingSession}</div>

                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold uppercase text-sm">{status.status}</span>
                                        {status.status === "training" && <Activity className="text-blue-500 animate-pulse" size={16} />}
                                        {status.status === "completed" && <span className="text-green-500">Done</span>}
                                        {status.status === "failed" && <span className="text-red-500">Failed</span>}
                                    </div>

                                    {status.error && <div className="text-red-400 text-xs">{status.error}</div>}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
