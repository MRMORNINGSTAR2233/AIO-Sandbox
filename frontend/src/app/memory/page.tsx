"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, Search, PlusCircle } from "lucide-react";

export default function MemoryPage() {
    const [text, setText] = useState("");
    const [source, setSource] = useState("manual");
    const [status, setStatus] = useState("");

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);

    const addDocument = async () => {
        try {
            const res = await fetch("http://localhost:8000/memory/add", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Sandbox-Key": "sandbox-secret" },
                body: JSON.stringify({
                    text: text,
                    metadata: { source: source, type: "manual" }
                })
            });
            const data = await res.json();
            setStatus(`Added Document ID: ${data.id}`);
            setText("");
        } catch (e) {
            setStatus("Failed to add document.");
        }
    };

    const runQuery = async () => {
        try {
            const res = await fetch("http://localhost:8000/memory/query", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Sandbox-Key": "sandbox-secret" },
                body: JSON.stringify({ query: query })
            });
            const data = await res.json();

            // Format results
            const docs = data.results.documents[0];
            const metas = data.results.metadatas[0];
            const formatted = docs.map((doc: string, i: number) => ({
                text: doc,
                source: metas[i]?.source || "unknown"
            }));

            setResults(formatted);
        } catch (e) {
            alert("Query failed");
        }
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <header>
                <h2 className="text-3xl font-bold tracking-tight">Memory & Knowledge Base</h2>
                <p className="text-muted-foreground">Manage the RAG Vector Database (ChromaDB).</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0">
                {/* Add Document */}
                <Card className="bg-card/50 h-full flex flex-col">
                    <CardHeader><CardTitle className="flex items-center gap-2"><PlusCircle size={18} /> Add Document</CardTitle></CardHeader>
                    <CardContent className="flex-1 flex flex-col space-y-4">
                        <Input placeholder="Source (e.g. Policy PDF, Website)" value={source} onChange={e => setSource(e.target.value)} />
                        <textarea
                            className="flex-1 w-full bg-black/20 p-4 rounded-md border text-sm"
                            placeholder="Paste document content here..."
                            value={text}
                            onChange={e => setText(e.target.value)}
                        />
                        <Button onClick={addDocument} disabled={!text}>Add to Vector DB</Button>
                        {status && <div className="text-xs text-green-400">{status}</div>}
                    </CardContent>
                </Card>

                {/* Search */}
                <Card className="bg-card/50 h-full flex flex-col">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Search size={18} /> Semantic Search</CardTitle></CardHeader>
                    <CardContent className="flex-1 flex flex-col space-y-4">
                        <div className="flex gap-2">
                            <Input placeholder="Query..." value={query} onChange={e => setQuery(e.target.value)} />
                            <Button size="icon" onClick={runQuery}><Search size={16} /></Button>
                        </div>

                        <div className="flex-1 overflow-auto space-y-3">
                            {results.map((res, i) => (
                                <div key={i} className="p-3 bg-black/20 rounded-lg border border-border/50">
                                    <div className="text-xs text-muted-foreground mb-1 font-bold uppercase">{res.source}</div>
                                    <div className="text-sm">{res.text}</div>
                                </div>
                            ))}
                            {results.length === 0 && <div className="text-center text-muted-foreground mt-10">No results found.</div>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
