import Link from 'next/link';
import { Bot, Activity, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Welcome to AI Sandbox</h1>
        <p className="text-xl text-muted-foreground">Select a module to begin your research.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/agents" className="block group">
          <Card className="h-full border-primary/20 hover:border-primary transition-all hover:shadow-lg bg-card/50 backdrop-blur-sm group-hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Bot size={24} />
              </div>
              <CardTitle className="text-2xl">Agents & LLMs</CardTitle>
              <CardDescription>Chat with advanced ReAct agents using tools like Calculator and Search.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-primary font-medium text-sm">
                Enter Playground <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/rl" className="block group">
          <Card className="h-full border-primary/20 hover:border-primary transition-all hover:shadow-lg bg-card/50 backdrop-blur-sm group-hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Activity size={24} />
              </div>
              <CardTitle className="text-2xl">RL Environments</CardTitle>
              <CardDescription>Train agents in Gymnasium or custom environments with full visualization.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-primary font-medium text-sm">
                Enter Arena <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
