import ChatInterface from '@/components/ChatInterface';
import RLInterface from '@/components/RLInterface';

export default function Home() {
  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px', borderBottom: '1px solid #333' }}>
        <h1 style={{ margin: 0 }}>AI Sandbox Playground</h1>
      </header>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', overflowY: 'auto' }}>
        <ChatInterface />
        <RLInterface />
      </div>
    </main>
  );
}
