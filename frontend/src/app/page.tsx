import ChatInterface from '@/components/ChatInterface';
import RLInterface from '@/components/RLInterface';

export default function Home() {
  return (
    <main className="h-screen w-full bg-gradient-to-br from-background via-background/95 to-secondary/30 text-foreground overflow-hidden flex flex-col">
      <header className="px-6 py-4 border-b bg-background/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          AI Sandbox <span className="text-xs font-normal text-muted-foreground opacity-70 ml-2">v0.2.0 • Phase 2</span>
        </h1>
        <div className="text-xs text-muted-foreground font-mono">
          System: Ready
        </div>
      </header>

      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        <div className="lg:col-span-7 h-full min-h-[500px]">
          <ChatInterface />
        </div>
        <div className="lg:col-span-5 h-full min-h-[400px]">
          <RLInterface />
        </div>
      </div>
    </main>
  );
}
