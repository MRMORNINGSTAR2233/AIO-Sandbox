"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Play, Trash2 } from "lucide-react";

export default function MultiAgentPage() {
    const [activeTab, setActiveTab] = useState("registry"); // 'registry' or 'workflow'
    const [agents, setAgents] = useState<any[]>([]);

    // Agent Form
    const [newAgentName, setNewAgentName] = useState("");
    const [newAgentRole, setNewAgentRole] = useState("");
    const [newAgentModel, setNewAgentModel] = useState("gpt-3.5-turbo");

    // Workflow Form
    const [workflowSteps, setWorkflowSteps] = useState<Array<{ agent_id: string, instruction: string }>>([]);
    const [initialInput, setInitialInput] = useState("");
    const [workflowResult, setWorkflowResult] = useState<any>(null);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const res = await fetch("http://localhost:8000/agents", {
                headers: { "X-Sandbox-Key": "sandbox-secret" }
            });
            const data = await res.json();
            setAgents(data.agents);
        } catch (e) {
            console.error(e);
        }
    };

    const registerAgent = async () => {
        try {
            await fetch("http://localhost:8000/agents/register", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Sandbox-Key": "sandbox-secret" },
                body: JSON.stringify({
                    name: newAgentName,
                    role: newAgentRole,
                    model: newAgentModel,
                    tools: [] // Default no tools for now
                })
            });
            setNewAgentName("");
            setNewAgentRole("");
            fetchAgents();
        } catch (e) {
            alert("Failed to register agent");
        }
    };

    const [workflowType, setWorkflowType] = useState("sequential"); // 'sequential' or 'parallel'

    const runWorkflow = async () => {
        try {
            setWorkflowResult(null);
            const endpoint = workflowType === "parallel"
                ? "http://localhost:8000/agents/workflow/parallel"
                : "http://localhost:8000/agents/workflow/sequential";

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Sandbox-Key": "sandbox-secret" },
                body: JSON.stringify({
                    steps: workflowSteps,
                    initial_input: initialInput
                })
            });
            const data = await res.json();
            setWorkflowResult(data);
        } catch (e) {
            alert("Workflow failed");
        }
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Multi-Agent Orchestration</h2>
                    <p className="text-muted-foreground">Design and execute agent chains.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant={activeTab === 'registry' ? 'default' : 'outline'} onClick={() => setActiveTab('registry')}>Agent Registry</Button>
                    <Button variant={activeTab === 'workflow' ? 'default' : 'outline'} onClick={() => setActiveTab('workflow')}>Workflow Builder</Button>
                </div>
            </header>

            {activeTab === 'registry' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* List */}
                    <Card className="bg-card/50">
                        <CardHeader><CardTitle>Registered Agents</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {agents.map(agent => (
                                <div key={agent.id} className="p-4 border rounded-lg bg-background/50 flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold">{agent.name}</div>
                                        <div className="text-xs text-muted-foreground">{agent.role} • {agent.model}</div>
                                    </div>
                                    <div className="text-xs font-mono text-muted-foreground">{agent.id.substring(0, 6)}...</div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Create */}
                    <Card className="bg-card/50">
                        <CardHeader><CardTitle>Register New Agent</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Input placeholder="Name (e.g. Researcher)" value={newAgentName} onChange={e => setNewAgentName(e.target.value)} />
                            <Input placeholder="Role (e.g. You are a senior researcher...)" value={newAgentRole} onChange={e => setNewAgentRole(e.target.value)} />
                            <select
                                className="w-full h-10 rounded-md border border-input bg-background px-3"
                                value={newAgentModel} onChange={e => setNewAgentModel(e.target.value)}
                            >
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                <option value="gpt-4">GPT-4</option>
                                <option value="llama3-70b-8192">Llama 3 70B (Groq)</option>
                            </select>
                            <Button onClick={registerAgent} className="w-full gap-2"><Plus size={16} /> Register Agent</Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'workflow' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0">
                    <div className="space-y-6 flex flex-col">
                        <Card className="bg-card/50">
                            <CardHeader><CardTitle>Workflow Configuration</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Workflow Mode</h4>
                                    <div className="flex gap-4 mb-4">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input type="radio" name="wtype" checked={workflowType === 'sequential'} onChange={() => setWorkflowType('sequential')} />
                                            Sequential (Chain)
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input type="radio" name="wtype" checked={workflowType === 'parallel'} onChange={() => setWorkflowType('parallel')} />
                                            Parallel (All at once)
                                        </label>
                                    </div>
                                    <h4 className="text-sm font-medium mb-2">Initial Input</h4>
                                    <Input placeholder="Start the chain with..." value={initialInput} onChange={e => setInitialInput(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Steps</h4>
                                    {workflowSteps.map((step, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <span className="text-xs font-mono w-6">{idx + 1}.</span>
                                            <select
                                                className="h-10 w-1/3 rounded-md border border-input bg-background px-3 text-sm"
                                                value={step.agent_id}
                                                onChange={(e) => {
                                                    const newSteps = [...workflowSteps];
                                                    newSteps[idx].agent_id = e.target.value;
                                                    setWorkflowSteps(newSteps);
                                                }}
                                            >
                                                <option value="">Select Agent</option>
                                                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            </select>
                                            <Input
                                                className="flex-1"
                                                placeholder="Instruction (e.g. Summarize this)"
                                                value={step.instruction}
                                                onChange={(e) => {
                                                    const newSteps = [...workflowSteps];
                                                    newSteps[idx].instruction = e.target.value;
                                                    setWorkflowSteps(newSteps);
                                                }}
                                            />
                                            <Button size="icon" variant="ghost" onClick={() => {
                                                const newSteps = [...workflowSteps];
                                                newSteps.splice(idx, 1);
                                                setWorkflowSteps(newSteps);
                                            }}><Trash2 size={14} /></Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={() => setWorkflowSteps([...workflowSteps, { agent_id: "", instruction: "" }])}>
                                        <Plus size={14} className="mr-2" /> Add Step
                                    </Button>
                                </div>
                                <Button className="w-full" onClick={runWorkflow}><Play size={16} className="mr-2" /> Run Workflow</Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col h-full min-h-[400px]">
                        <Card className="h-full bg-card/50 flex flex-col">
                            <CardHeader><CardTitle>Execution Trace</CardTitle></CardHeader>
                            <CardContent className="flex-1 overflow-auto font-mono text-sm space-y-4 p-4">
                                {workflowResult ? (
                                    <>
                                        {workflowType === 'sequential' && workflowResult.trace && workflowResult.trace.map((step: any, i: number) => (
                                            <div key={i} className="p-3 bg-black/20 rounded-lg border border-border/50">
                                                <div className="text-primary font-bold mb-1">Step {step.step}: {step.agent}</div>
                                                <div className="whitespace-pre-wrap text-muted-foreground">{step.output}</div>
                                            </div>
                                        ))}

                                        {workflowType === 'parallel' && workflowResult.results && workflowResult.results.map((res: any, i: number) => (
                                            <div key={i} className="p-3 bg-black/20 rounded-lg border border-border/50">
                                                <div className="text-primary font-bold mb-1">Agent: {res.agent}</div>
                                                <div className="whitespace-pre-wrap text-muted-foreground">{res.output}</div>
                                            </div>
                                        ))}

                                        {workflowType === 'sequential' && (
                                            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                                <div className="text-primary font-bold mb-1">Final Output</div>
                                                <div className="whitespace-pre-wrap">{workflowResult.final_output}</div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center text-muted-foreground mt-10">Run a workflow to see the trace here.</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
