"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PROVIDERS = {
    openai: ["gpt-3.5-turbo", "gpt-4-turbo"],
    groq: ["llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768"],
    gemini: ["gemini-pro"]
};

export default function ChatInterface() {
    const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const [provider, setProvider] = useState("openai");
    const [model, setModel] = useState("gpt-3.5-turbo");
    const [temperature, setTemperature] = useState(0.7);
    const [mode, setMode] = useState("chat"); // chat or agent

    const handleProviderChange = (p: string) => {
        setProvider(p);
        // @ts-ignore
        setModel(PROVIDERS[p][0]);
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = { role: "user", content: input };
        setMessages([...messages, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Sandbox-Key": "sandbox-secret" // Demo key
                },
                body: JSON.stringify({ message: input, provider, model, temperature, mode }),
            });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: "assistant", content: "Error: Could not connect to agent." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto rounded-xl border bg-card/50 shadow-xl backdrop-blur-sm overflow-hidden">

            {/* Header / Config Bar */}
            <div className="p-4 border-b bg-background/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <Bot size={20} />
                    </div>
                    <h2 className="font-semibold text-lg">Agent Chat</h2>
                </div>

                <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-lg border border-border/50">
                    <Settings2 size={16} className="text-muted-foreground ml-2" />

                    {/* Mode Toggle */}
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer font-medium text-primary"
                    >
                        <option value="chat">Chat Mode</option>
                        <option value="agent">Agent (Tools)</option>
                    </select>
                    <div className="w-px h-4 bg-border mx-1" />

                    <select
                        value={provider}
                        onChange={(e) => handleProviderChange(e.target.value)}
                        className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer"
                    >
                        {Object.keys(PROVIDERS).map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                    </select>
                    <div className="w-px h-4 bg-border mx-1" />
                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer max-w-[120px]"
                    >
                        {/* @ts-ignore */}
                        {PROVIDERS[provider].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-background/10 to-transparent">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <Bot size={48} className="mb-4" />
                        <p>Select a model and start chatting to begin.</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={cn("flex gap-3", m.role === 'user' ? "justify-end" : "justify-start")}>
                        {m.role !== 'user' && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot size={14} className="text-primary" />
                            </div>
                        )}
                        <div className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                            m.role === 'user'
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-secondary text-secondary-foreground rounded-tl-none"
                        )}>
                            {m.content}
                        </div>
                        {m.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                                <User size={14} className="text-primary-foreground" />
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3 justify-start animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-primary/10" />
                        <div className="bg-secondary/50 h-10 w-24 rounded-2xl" />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
                <div className="relative flex items-center">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="pr-12 py-6 text-base rounded-full border-muted-foreground/20 shadow-sm focus-visible:ring-primary/20"
                    />
                    <Button
                        size="icon"
                        onClick={sendMessage}
                        className="absolute right-1.5 rounded-full w-9 h-9 shadow-md transition-transform hover:scale-105"
                    >
                        <Send size={16} />
                    </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                    AI can make mistakes. Consider checking important information.
                </p>
            </div>
        </div>
    );
}
