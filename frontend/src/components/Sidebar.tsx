"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Activity, Home, Settings, Box, BarChart2, Wrench, Code, Database, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/", icon: Home },
    { label: "Agents & LLMs", href: "/agents", icon: Bot },
    { label: "Multi-Agent Workflows", href: "/multi-agent", icon: Settings },
    { label: "Tool Ecosystem", href: "/tools", icon: Wrench },
    { label: "Code Sandbox", href: "/sandbox", icon: Box },
    { label: "Knowledge Base", href: "/memory", icon: Database },
    { label: "LLM Evaluation", href: "/eval", icon: BarChart2 },
    { label: "Observability", href: "/observability", icon: Eye },
    { label: "RL Studio", href: "/rl-studio", icon: Code },
    { label: "RL Dashboard", href: "/rl", icon: Activity },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r bg-card/30 backdrop-blur-xl h-full flex flex-col p-4 hidden md:flex">
            <div className="mb-8 pl-2">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    AI Sandbox
                </h1>
                <p className="text-xs text-muted-foreground">v0.4.0 • Enterprise</p>
            </div>

            <nav className="flex-1 space-y-2">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t pt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                    <Box size={14} />
                    <span>System Status: Online</span>
                </div>
            </div>
        </aside>
    );
}
