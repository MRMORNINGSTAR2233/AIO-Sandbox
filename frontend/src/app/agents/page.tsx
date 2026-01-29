import ChatInterface from '@/components/ChatInterface';

export default function AgentsPage() {
    return (
        <div className="h-full flex flex-col p-6">
            <header className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Agents & LLMs</h2>
                <p className="text-muted-foreground">Interact with ReAct agents, test generic logic, and use tools.</p>
            </header>
            <div className="flex-1 overflow-hidden min-h-0 bg-background/50 rounded-xl border border-border/50 shadow-sm">
                <ChatInterface />
            </div>
        </div>
    );
}
