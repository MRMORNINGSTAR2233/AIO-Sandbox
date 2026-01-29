"use client";

import React, { useState, useEffect } from 'react';

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

            // Reset immediately to get initial obs
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
            if (data.terminated || data.truncated) {
                alert("Episode finished!");
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #444', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
            <h2>RL Environment Playground</h2>

            {!sessionId ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <select value={selectedEnv} onChange={(e) => setSelectedEnv(e.target.value)} style={{ padding: '8px' }}>
                        {envs.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <button onClick={createEnv} style={{ padding: '8px 16px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}>
                        Start Environment
                    </button>
                </div>
            ) : (
                <div>
                    <div style={{ marginBottom: '10px' }}>
                        <strong>Session:</strong> {sessionId.substring(0, 8)}...
                        <button onClick={() => setSessionId("")} style={{ marginLeft: '10px', fontSize: '12px' }}>Close</button>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <h4>Observation:</h4>
                            <pre style={{ background: '#111', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
                                {JSON.stringify(obs, null, 2)}
                            </pre>
                        </div>

                        <div style={{ width: '200px' }}>
                            <h4>Actions:</h4>
                            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                                <input
                                    type="number"
                                    value={action}
                                    onChange={(e) => setAction(parseInt(e.target.value))}
                                    style={{ width: '60px' }}
                                />
                                <button onClick={takeStep} style={{ flex: 1, background: 'green', color: 'white', border: 'none', borderRadius: '4px' }}>Step</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
