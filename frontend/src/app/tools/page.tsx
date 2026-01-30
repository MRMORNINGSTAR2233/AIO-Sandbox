"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wrench, Plus, Code } from "lucide-react";

export default function ToolsPage() {
    const [tools, setTools] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    // Form
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [code, setCode] = useState("def run(input_var):\n    return f'Echo: {input_var}'");

    useEffect(() => {
        fetchTools();
    }, []);

    const fetchTools = async () => {
        try {
            const res = await fetch("http://localhost:8000/tools", {
                headers: { "X-Sandbox-Key": "sandbox-secret" }
            });
            const data = await res.json();
            setTools(data.tools);
        } catch (e) {
            console.error(e);
        }
    };

    const createTool = async () => {
        try {
            await fetch("http://localhost:8000/tools/custom", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Sandbox-Key": "sandbox-secret" },
                body: JSON.stringify({ name, description, code })
            });
            setIsCreating(false);
            fetchTools();
        } catch (e) {
            alert("Failed to create tool");
        }
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tooling Ecosystem</h2>
                    <p className="text-muted-foreground">Manage and create tools for your agents.</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "secondary" : "default"}>
                    {isCreating ? "Cancel" : <><Plus size={16} className="mr-2" /> Create Tool</>}
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isCreating && (
                    <Card className="md:col-span-3 bg-card/50 border-primary/50">
                        <CardHeader><CardTitle>Create Custom Tool (Python)</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="Tool Name (e.g. WeatherFetcher)" value={name} onChange={e => setName(e.target.value)} />
                                <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                            <div className="relative">
                                <div className="absolute top-2 right-2 text-xs text-muted-foreground">def run(input_var):</div>
                                <textarea
                                    className="w-full h-40 bg-black/40 p-4 font-mono text-sm focus:outline-none border rounded-md"
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" onClick={createTool}>Register Tool</Button>
                        </CardContent>
                    </Card>
                )}

                {tools.map((tool, i) => (
                    <Card key={i} className="bg-card/50 hover:bg-card/80 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Wrench size={18} className="text-primary" />
                                {tool.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                            <div className="text-xs bg-secondary/50 p-2 rounded font-mono truncate">
                                Parameters: {JSON.stringify(tool.parameters)}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
