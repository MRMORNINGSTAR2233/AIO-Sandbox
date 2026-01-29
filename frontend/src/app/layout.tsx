import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Assuming these are correct imports from your viewing
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Sandbox",
  description: "Advanced Agentic Playground",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground overflow-hidden`}>
        <div className="flex h-screen w-full">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background/95 to-secondary/10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
