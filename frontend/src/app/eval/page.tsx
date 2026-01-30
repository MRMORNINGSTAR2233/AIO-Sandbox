"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart2, Zap, Trophy, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export default function EvalPage() {
    const [benchmark, setBenchmark] = useState("mmlu_lite");
    const [model, setModel] = useState("gpt-3.5-turbo");
    const [results, setResults] = useState<any>(null);
    const [status, setStatus] = useState("idle");
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch("http://localhost:8000/eval/leaderboard", {
                headers: { "X-Sandbox-Key": "sandbox-secret" }
            });
            const data = await res.json();
            setLeaderboard(data.results);
        } catch (e) { console.error(e); }
    };

    const runBenchmark = async () => {
        setStatus("running");
        try {
            const res = await fetch("http://localhost:8000/eval/run", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Sandbox-Key": "sandbox-secret" },
                body: JSON.stringify({
                    benchmark_name: benchmark,
                    model_name: model,
                    judge_provider: "openai"
                })
            });
            const data = await res.json();
            setResults(data);
            setStatus("completed");
            fetchLeaderboard(); // Refresh leaderboard
        } catch (e) {
            setStatus("failed");
        }
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <header>
                <h2 className="text-3xl font-bold tracking-tight">LLM Evaluation Suite</h2>
                <p className="text-muted-foreground">Automated benchmarks with LLM-as-a-Judge grading.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Run Benchmark */}
                <Card className="bg-card/50 flex flex-col h-full lg:col-span-1">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Zap size={18} /> Run Evaluation</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Model Under Test</label>
                            <Input value={model} onChange={e => setModel(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Benchmark</label>
                            <Select value={benchmark} onValueChange={setBenchmark}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mmlu_lite">MMLU Lite (General Knowledge)</SelectItem>
                                    <SelectItem value="python_coding">Python Coding (Domain Specific)</SelectItem>
                                    <SelectItem value="logic_reasoning">Logic & Reasoning</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full" onClick={runBenchmark} disabled={status === "running"}>
                            {status === "running" ? "Running..." : "Start Evaluation"}
                        </Button>

                        {status === "running" && <Progress value={40} className="w-full" />}

                        {results && (
                            <div className="p-4 bg-black/20 rounded-lg border text-center">
                                <div className="text-2xl font-bold">{results.average_score?.toFixed(1) || 0}/100</div>
                                <div className="text-xs text-muted-foreground uppercase">Final Score</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Leaderboard */}
                <Card className="bg-card/50 flex flex-col h-full lg:col-span-2">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Trophy size={18} /> Leaderboard</CardTitle></CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/50 text-left">
                                    <th className="p-2 font-medium">Rank</th>
                                    <th className="p-2 font-medium">Model</th>
                                    <th className="p-2 font-medium">Benchmark</th>
                                    <th className="p-2 font-medium text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.sort((a, b) => b.score - a.score).map((entry, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-2 text-muted-foreground">#{i + 1}</td>
                                        <td className="p-2 font-mono text-blue-400">{entry.model}</td>
                                        <td className="p-2 text-xs">{entry.benchmark}</td>
                                        <td className="p-2 text-right font-bold">{entry.score.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
