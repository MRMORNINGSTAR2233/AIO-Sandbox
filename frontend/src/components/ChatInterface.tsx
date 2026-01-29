"use client";

import React, { useState } from 'react';

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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    provider,
                    model,
                    temperature
                }),
            });

            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: "assistant", content: "Error: Could not connect to agent." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>

            {/* Config Bar */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <select
                    value={provider}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    style={{ padding: '5px', borderRadius: '4px' }}
                >
                    {Object.keys(PROVIDERS).map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                </select>

                <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    style={{ padding: '5px', borderRadius: '4px' }}
                >
                    {/* @ts-ignore */}
                    {PROVIDERS[provider].map(m => <option key={m} value={m}>{m}</option>)}
                </select>

                <input
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    step="0.1"
                    min="0.0"
                    max="1.0"
                    style={{ width: '60px', padding: '5px', borderRadius: '4px' }}
                />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '8px', padding: '10px', background: 'rgba(255,255,255,0.1)' }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ marginBottom: '10px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            background: m.role === 'user' ? '#0070f3' : '#333',
                            color: 'white'
                        }}>
                            {m.content}
                        </span>
                    </div>
                ))}
                {loading && <div>Thinking...</div>}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    placeholder="Type a message..."
                />
                <button
                    onClick={sendMessage}
                    style={{ padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
