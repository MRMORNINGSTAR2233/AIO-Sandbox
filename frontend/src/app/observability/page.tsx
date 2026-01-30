"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Clock, ZoomIn } from "lucide-react";

export default function ObservabilityPage() {
    const [traces, setTraces] = useState<any[]>([]);
    const [selectedTrace, setSelectedTrace] = useState<any>(null);
    const [spans, setSpans] = useState<any[]>([]);

    useEffect(() => {
        fetchTraces();
        const interval = setInterval(fetchTraces, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const fetchTraces = async () => {
        try {
            const res = await fetch("http://localhost:8000/observability/traces", {
                headers: { "X-Sandbox-Key": "sandbox-secret" }
            });
            const data = await res.json();
            setTraces(data.traces);
        } catch (e) {
            console.error(e);
        }
    };

    const loadTraceDetails = async (traceId: string) => {
        try {
            const res = await fetch(`http://localhost:8000/observability/traces/${traceId}`, {
                headers: { "X-Sandbox-Key": "sandbox-secret" }
            });
            const data = await res.json();
            setSpans(data.spans);
            setSelectedTrace(traceId);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <header>
                <h2 className="text-3xl font-bold tracking-tight">System Observability</h2>
                <p className="text-muted-foreground">Trace execution flows, latency, and agent interactions.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Trace List */}
                <Card className="bg-card/50 flex flex-col h-full lg:col-span-1">
                    <CardHeader><CardTitle>Recent Traces</CardTitle></CardHeader>
                    <CardContent className="flex-1 overflow-auto space-y-2">
                        {traces.map(trace => (
                            <div
                                key={trace.trace_id}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedTrace === trace.trace_id ? 'bg-primary/20 border-primary' : 'bg-black/20 hover:bg-black/30'}`}
                                onClick={() => loadTraceDetails(trace.trace_id)}
                            >
                                <div className="font-semibold text-sm">{trace.root_name}</div>
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>{new Date(trace.start_time * 1000).toLocaleTimeString()}</span>
                                    <span>{(trace.duration * 1000).toFixed(0)}ms</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{trace.span_count} spans</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Waterfall View */}
                <Card className="bg-card/50 flex flex-col h-full lg:col-span-2">
                    <CardHeader><CardTitle>Trace Waterfall</CardTitle></CardHeader>
                    <CardContent className="flex-1 overflow-auto p-4 relative">
                        {selectedTrace && spans.length > 0 ? (
                            <div className="space-y-1">
                                {spans.sort((a, b) => a.start_time - b.start_time).map((span, i) => {
                                    // Calculate offset and width relative to trace
                                    const rootStart = spans[0].start_time;
                                    const traceDuration = Math.max(...spans.map((s: any) => s.end_time || s.start_time)) - rootStart;

                                    const startOffset = (span.start_time - rootStart) / traceDuration * 100;
                                    const durationPct = Math.max(((span.end_time || span.start_time) - span.start_time) / traceDuration * 100, 1);

                                    return (
                                        <div key={span.id} className="relative h-8 flex items-center group">
                                            <div className="w-1/4 text-xs font-mono truncate px-2" title={span.name}>{span.name}</div>
                                            <div className="w-3/4 h-full relative border-l border-white/5">
                                                <div
                                                    className="absolute h-6 top-1 rounded bg-blue-500/50 group-hover:bg-blue-500/80 transition-all"
                                                    style={{ left: `${startOffset}%`, width: `${durationPct}%` }}
                                                >
                                                    <span className="absolute -top-6 left-0 bg-black text-xs px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                                        {(span.duration * 1000).toFixed(0)}ms
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="mt-8 pt-4 border-t border-white/10">
                                    <h4 className="text-sm font-semibold mb-2">Attributes</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                        {Object.entries(spans.find((s: any) => s.id === spans.find((x: any) => x.parent_id === null)?.id || spans[0])?.attributes || {}).map(([k, v]) => (
                                            <div key={k} className="p-2 bg-black/30 rounded">
                                                <span className="text-muted-foreground">{k}:</span> {String(v)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Activity size={48} className="mb-4 opacity-20" />
                                <div>Select a trace to view details.</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
