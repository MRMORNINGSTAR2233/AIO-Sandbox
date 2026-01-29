"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, RotateCcw, Activity, Upload } from "lucide-react";

export default function RLInterface() {
    const [envs, setEnvs] = useState<string[]>([]);
    const [selectedEnv, setSelectedEnv] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [obs, setObs] = useState<any>(null);
    const [info, setInfo] = useState<any>(null);
    const [action, setAction] = useState(0);

    useEffect(() => {
        fetch("http://localhost:8000/envs")
            .then(res => res.json())
            .then(data => {
                setEnvs(data.envs);
                if (data.envs.length > 0) setSelectedEnv(data.envs[0]);
            })
            .catch(console.error);
    }, []);

    const createEnv = async () => {
        try {
            const res = await fetch("http://localhost:8000/envs/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ env_id: selectedEnv }),
            });
            const data = await res.json();
            setSessionId(data.session_id);

            const resetRes = await fetch(`http://localhost:8000/envs/reset/${data.session_id}`, { method: "POST" });
            const resetData = await resetRes.json();
            setObs(resetData.observation);
            setInfo(resetData.info);
        } catch (e) {
            console.error(e);
        }
    };

    const takeStep = async () => {
        if (!sessionId) return;
        try {
            const res = await fetch("http://localhost:8000/envs/step", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: sessionId, action: action }),
            });
            const data = await res.json();
            setObs(data.observation);
            setInfo(data.info);
            if (data.terminated || data.truncated) alert("Episode finished!");
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Card className="h-full border-none shadow-xl bg-card/50 backdrop-blur-sm flex flex-col">
            <CardHeader className="pb-4 border-b bg-background/50">
                <div className="flex items-center gap-2 text-primary">
                    <Activity size={20} />
                    <CardTitle>RL Environment</CardTitle>
                </div>
                <CardDescription>Train and test reinforcement learning agents.</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                {!sessionId ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                            <Activity size={32} className="text-primary" />
                        </div>
                        <p className="text-muted-foreground text-center max-w-sm">
                            Select an environment configuration to begin a new training or evaluation session.
                        </p>

                        <div className="flex flex-col gap-4 w-full max-w-sm">
                            <div className="flex gap-2">
                                <select
                                    value={selectedEnv}
                                    onChange={(e) => setSelectedEnv(e.target.value)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {envs.map(e => <option key={e} value={e}>{e}</option>)}
                                    <option value="custom">Custom (Upload below)</option>
                                </select>
                                <Button onClick={createEnv} className="gap-2">
                                    <Play size={16} /> Start
                                </Button>
                            </div>

                            <div className="p-4 border border-dashed rounded-lg bg-secondary/20 flex flex-col gap-2">
                                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                    <Upload size={12} /> Upload Custom Env (.py)
                                </span>
                                <Input
                                    type="file"
                                    accept=".py"
                                    className="cursor-pointer file:cursor-pointer text-xs"
                                    onChange={async (e) => {
                                        if (e.target.files?.[0]) {
                                            const formData = new FormData();
                                            formData.append("file", e.target.files[0]);
                                            try {
                                                await fetch("http://localhost:8000/envs/upload", { method: "POST", body: formData });
                                                alert("Environment uploaded! Use ID: SimpleGrid-v0 (or whatever ID your file registered)");
                                                // Refresh list
                                                fetch("http://localhost:8000/envs")
                                                    .then(res => res.json())
                                                    .then(data => setEnvs(data.envs));
                                            } catch (err) {
                                                alert("Upload failed");
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-muted/50 rounded-lg p-4 border relative overflow-hidden">
                            <div className="absolute top-2 right-2 text-xs font-mono text-muted-foreground">ID: {sessionId.substring(0, 8)}</div>
                            <h4 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wider">Observation Space</h4>
                            <pre className="font-mono text-xs bg-black/80 text-green-400 p-4 rounded-md overflow-x-auto">
                                {JSON.stringify(obs, null, 2)}
                            </pre>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-background/50">
                                <CardContent className="p-4">
                                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Reward</h5>
                                    <p className="text-2xl font-bold tracking-tight">0.00</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-background/50">
                                <CardContent className="p-4">
                                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Step</h5>
                                    <p className="text-2xl font-bold tracking-tight">0</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </CardContent>

            {sessionId && (
                <CardFooter className="p-4 border-t bg-background/50">
                    <div className="flex items-center gap-4 w-full">
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Action:</span>
                        <input
                            type="number"
                            value={action}
                            onChange={(e) => setAction(parseInt(e.target.value))}
                            className="w-20 h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <Button onClick={takeStep} className="flex-1 bg-green-600 hover:bg-green-700">
                            Step Environment
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setSessionId("")} title="Reset Session">
                            <RotateCcw size={16} />
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
