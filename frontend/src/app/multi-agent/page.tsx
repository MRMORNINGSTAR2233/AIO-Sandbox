"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Play, Trash2, Users, GitMerge, Bot, ArrowRight, BrainCircuit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MultiAgentPage() {
    const [activeTab, setActiveTab] = useState("supervisor"); // 'registry', 'workflow', or 'supervisor'
    const [agents, setAgents] = useState<any[]>([]);

    // Agent Register Form
    const [newAgentName, setNewAgentName] = useState("");
    const [newAgentRole, setNewAgentRole] = useState("");
    const [newAgentModel, setNewAgentModel] = useState("gpt-3.5-turbo");

    // Supervisor Form
    const [supervisorGoal, setSupervisorGoal] = useState("");
    const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
    const [supervisorResult, setSupervisorResult] = useState<any>(null);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const res = await fetch("http://localhost:8000/agents", { headers: { "X-Sandbox-Key": "sandbox-secret" } });
            const data = await res.json();
            setAgents(data.agents);
        } catch (e) { console.error(e); }
    };

    const registerAgent = async () => {
        if (!newAgentName || !newAgentRole) return;
        await fetch("http://localhost:8000/agents/register", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Sandbox-Key": "sandbox-secret" },
            body: JSON.stringify({ name: newAgentName, role: newAgentRole, model: newAgentModel, tools: [] })
        });
        setNewAgentName(""); setNewAgentRole(""); fetchAgents();
    };

    const toggleTeamMember = (id: string) => {
        if (selectedTeam.includes(id)) setSelectedTeam(selectedTeam.filter(x => x !== id));
        else setSelectedTeam([...selectedTeam, id]);
    };

    const runSupervisor = async () => {
        if (!supervisorGoal || selectedTeam.length === 0) return;
        setIsRunning(true);
        setSupervisorResult(null);
        try {
            const res = await fetch("http://localhost:8000/agents/workflow/supervisor", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Sandbox-Key": "sandbox-secret" },
                body: JSON.stringify({ goal: supervisorGoal, team: selectedTeam })
            });
            const data = await res.json();
            setSupervisorResult(data);
        } catch (e) { console.error(e); }
        setIsRunning(false);
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Multi-Agent Orchestration</h2>
                    <p className="text-muted-foreground">Design agent teams and workflows.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant={activeTab === 'supervisor' ? 'default' : 'outline'} onClick={() => setActiveTab('supervisor')} className="gap-2"><BrainCircuit size={16} /> Supervisor Mode</Button>
                    <Button variant={activeTab === 'registry' ? 'default' : 'outline'} onClick={() => setActiveTab('registry')} className="gap-2"><Users size={16} /> Agent Registry</Button>
                </div>
            </header>

            {activeTab === 'registry' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-card/50">
                        <CardHeader><CardTitle>Create New Agent</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Input placeholder="Name (e.g. Researcher)" value={newAgentName} onChange={e => setNewAgentName(e.target.value)} />
                            <Input placeholder="Role (e.g. You are a senior researcher...)" value={newAgentRole} onChange={e => setNewAgentRole(e.target.value)} />
                            <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={newAgentModel} onChange={e => setNewAgentModel(e.target.value)}>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                <option value="gpt-4">GPT-4</option>
                            </select>
                            <Button onClick={registerAgent} className="w-full">Register Agent</Button>
                        </CardContent>
                    </Card>
                    <div className="space-y-4">
                        {agents.map(agent => (
                            <div key={agent.id} className="p-4 border rounded-lg bg-card/30 flex justify-between items-center hover:border-primary/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Bot size={20} /></div>
                                    <div>
                                        <div className="font-semibold">{agent.name}</div>
                                        <div className="text-xs text-muted-foreground">{agent.model}</div>
                                    </div>
                                </div>
                                <Badge variant="outline">{agent.role.substring(0, 30)}...</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'supervisor' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                    <Card className="bg-card/50 lg:col-span-1 flex flex-col">
                        <CardHeader><CardTitle>Team Configuration</CardTitle></CardHeader>
                        <CardContent className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Supervisor Goal</label>
                                <Input
                                    placeholder="e.g. Research X and wrote a blog post..."
                                    className="h-20"
                                    value={supervisorGoal}
                                    onChange={e => setSupervisorGoal(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Team Members</label>
                                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-auto">
                                    {agents.map(agent => (
                                        <div
                                            key={agent.id}
                                            onClick={() => toggleTeamMember(agent.id)}
                                            className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${selectedTeam.includes(agent.id) ? 'bg-primary/20 border-primary' : 'bg-background hover:bg-accent'}`}
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedTeam.includes(agent.id) ? 'bg-primary border-primary' : ''}`}>
                                                {selectedTeam.includes(agent.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                            </div>
                                            <span className="text-sm font-medium">{agent.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Button className="w-full" size="lg" onClick={runSupervisor} disabled={isRunning || !supervisorGoal}>
                                {isRunning ? "Orchestrating..." : "Start Mission"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 lg:col-span-2 flex flex-col h-full overflow-hidden">
                        <CardHeader><CardTitle>Live Workflow Visualization</CardTitle></CardHeader>
                        <CardContent className="flex-1 overflow-auto p-6 bg-black/20 relative">
                            {!supervisorResult && !isRunning && (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                                    <BrainCircuit size={48} className="mb-4" />
                                    <p>Configure a team and start a mission to see the supervisor in action.</p>
                                </div>
                            )}

                            <div className="space-y-8 max-w-3xl mx-auto">
                                {/* Supervisor Node */}
                                {(supervisorResult || isRunning) && (
                                    <div className="flex justify-center">
                                        <div className="bg-purple-900/50 border border-purple-500/50 p-4 rounded-xl shadow-lg ring-1 ring-purple-500 w-64 text-center relative">
                                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-purple-500/30"></div>
                                            <div className="font-bold text-purple-200">Supervisor Agent</div>
                                            <div className="text-xs text-purple-300/70 mt-1">Orchestrating {selectedTeam.length} agents</div>
                                            {isRunning && <div className="mt-2 text-xs animate-pulse text-purple-400">Thinking...</div>}
                                        </div>
                                    </div>
                                )}

                                {/* Steps */}
                                {supervisorResult?.steps?.map((step: any, i: number) => (
                                    <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards" style={{ animationDelay: `${i * 100}ms` }}>
                                        {/* Instruction Arrow */}
                                        <div className="flex justify-center mb-4 text-xs text-muted-foreground">
                                            <div className="bg-background/80 px-3 py-1 rounded-full border shadow-sm max-w-md truncate">
                                                To {step.agent}: "{step.instruction}"
                                            </div>
                                        </div>

                                        {/* Agent Node */}
                                        <div className="flex justify-center">
                                            <div className="bg-blue-950/40 border border-blue-500/30 p-4 rounded-lg max-w-2xl w-full shadow-sm">
                                                <div className="flex items-center gap-2 mb-2 text-blue-300">
                                                    <Bot size={16} />
                                                    <span className="font-semibold">{step.agent}</span>
                                                    <span className="text-xs ml-auto opacity-50">Step {step.step}</span>
                                                </div>
                                                <div className="text-sm bg-black/40 p-3 rounded font-mono text-gray-300 whitespace-pre-wrap">
                                                    {step.output}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Connector to next */}
                                        {i < supervisorResult.steps.length - 1 && (
                                            <div className="flex justify-center my-4 h-8">
                                                <div className="w-0.5 bg-border"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Final Output */}
                                {supervisorResult?.final_output && (
                                    <div className="mt-8 pt-8 border-t border-border/10 animate-in fade-in zoom-in duration-500">
                                        <div className="bg-green-950/30 border border-green-500/30 p-6 rounded-xl shadow-lg">
                                            <div className="font-bold text-green-400 mb-2 flex items-center gap-2">
                                                <CheckCircle size={18} /> Mission Complete
                                            </div>
                                            <div className="text-base text-gray-200 leading-relaxed whitespace-pre-wrap">
                                                {supervisorResult.final_output}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

function CheckCircle({ size, className }: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
}
