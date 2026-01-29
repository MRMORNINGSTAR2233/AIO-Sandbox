import RLInterface from '@/components/RLInterface';

export default function RLPage() {
    return (
        <div className="h-full flex flex-col p-6">
            <header className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Reinforcement Learning</h2>
                <p className="text-muted-foreground">Train agents in standard Gymnasium or custom uploaded environments.</p>
            </header>
            <div className="flex-1 overflow-hidden min-h-0">
                <RLInterface />
            </div>
        </div>
    );
}
