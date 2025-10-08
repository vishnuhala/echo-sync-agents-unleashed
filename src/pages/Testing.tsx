import { RealTimeMonitor } from '@/components/testing/RealTimeMonitor';
import { TestInputPanel } from '@/components/testing/TestInputPanel';

const Testing = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Real-Time Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and test real-time functionality across MCP, RAG, Agents, and A2A systems
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RealTimeMonitor />
          </div>
          <div>
            <TestInputPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testing;