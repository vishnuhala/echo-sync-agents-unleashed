import { RealTimeMonitor } from '@/components/testing/RealTimeMonitor';
import { TestInputPanel } from '@/components/testing/TestInputPanel';
import { SampleDataGenerator } from '@/components/testing/SampleDataGenerator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Testing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Real-Time Testing Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and test real-time functionality across MCP, RAG, Agents, and A2A systems
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RealTimeMonitor />
          </div>
          <div className="space-y-6">
            <SampleDataGenerator />
            <TestInputPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testing;