import { useState, useCallback } from 'react';
import { RealTimeMonitor } from '@/components/testing/RealTimeMonitor';
import { TestInputPanel } from '@/components/testing/TestInputPanel';
import { SampleDataGenerator } from '@/components/testing/SampleDataGenerator';
import { TestResultsPanel, TestResult } from '@/components/testing/TestResultsPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMCP } from '@/hooks/useMCP';
import { useRAG } from '@/hooks/useRAG';
import { useA2A } from '@/hooks/useA2A';
import { useAgents } from '@/hooks/useAgents';

const Testing = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  const { refetch: refetchMCP } = useMCP();
  const { refetch: refetchRAG } = useRAG();
  const { refetch: refetchA2A } = useA2A();
  const { refreshAgents } = useAgents();

  const addTestResult = useCallback((result: Omit<TestResult, 'id' | 'timestamp'>) => {
    setTestResults(prev => [{
      ...result,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }, ...prev.slice(0, 19)]); // Keep last 20 results
  }, []);

  const clearResults = useCallback(() => {
    setTestResults([]);
  }, []);

  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        refetchMCP(),
        refetchRAG(),
        refetchA2A(),
        refreshAgents(),
      ]);
      addTestResult({
        type: 'mcp',
        status: 'success',
        message: 'All data refreshed successfully',
      });
    } catch (error) {
      addTestResult({
        type: 'mcp',
        status: 'error',
        message: 'Failed to refresh data',
        data: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh All Data
            </Button>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Real-Time Testing Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and test real-time functionality across MCP, RAG, Agents, and A2A systems
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RealTimeMonitor />
            <TestResultsPanel results={testResults} onClear={clearResults} />
          </div>
          <div className="space-y-6">
            <SampleDataGenerator />
            <TestInputPanel onTestResult={addTestResult} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testing;
