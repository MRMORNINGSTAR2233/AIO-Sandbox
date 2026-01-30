"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";

export default function SandboxPage() {
    const [language, setLanguage] = useState("python");
    const [code, setCode] = useState('print("Hello from the Secure Sandbox!")');
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);

    const runCode = async () => {
        setIsRunning(true);
        setOutput("Running...");
        try {
            const res = await fetch("http://localhost:8000/sandbox/run", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Sandbox-Key": "sandbox-secret" },
                body: JSON.stringify({ language, code })
            });
            const data = await res.json();
            setOutput(data.output);
        } catch (e) {
            setOutput("System Error: Failed to reach sandbox.");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <header>
                <h2 className="text-3xl font-bold tracking-tight">Code execution Sandbox</h2>
                <p className="text-muted-foreground">Securely run Python, JavaScript, and Bash code in isolated containers.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
                <Card className="flex flex-col bg-card/50 h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Source Code</CardTitle>
                        <div className="flex items-center gap-2">
                            <select
                                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value="python">Python 3.11</option>
                                <option value="javascript">Node.js 18</option>
                                <option value="bash">Bash</option>
                            </select>
                            <Button size="sm" onClick={runCode} disabled={isRunning}>
                                <Play size={14} className="mr-2" /> {isRunning ? "Running..." : "Run"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative">
                        <textarea
                            className="w-full h-full resize-none bg-black/40 p-4 font-mono text-sm focus:outline-none"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            spellCheck={false}
                        />
                    </CardContent>
                </Card>

                <Card className="flex flex-col bg-card/50 h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Terminal Output</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setOutput("")}><RotateCcw size={14} /></Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 bg-black rounded-b-lg">
                        <div className="w-full h-full p-4 font-mono text-sm text-green-400 whitespace-pre-wrap overflow-auto">
                            {output || <span className="text-gray-600">// Output will appear here...</span>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
