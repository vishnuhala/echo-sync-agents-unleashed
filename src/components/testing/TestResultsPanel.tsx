import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react';

export interface TestResult {
  id: string;
  type: 'mcp' | 'rag' | 'a2a' | 'agent';
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
  timestamp: Date;
}

interface TestResultsPanelProps {
  results: TestResult[];
  onClear: () => void;
}

export const TestResultsPanel = ({ results, onClear }: TestResultsPanelProps) => {
  const getTypeColor = (type: TestResult['type']) => {
    switch (type) {
      case 'mcp': return 'text-blue-500 bg-blue-500/10';
      case 'rag': return 'text-green-500 bg-green-500/10';
      case 'a2a': return 'text-purple-500 bg-purple-500/10';
      case 'agent': return 'text-orange-500 bg-orange-500/10';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Test Results</CardTitle>
          <CardDescription>
            Live results from your tests
          </CardDescription>
        </div>
        {results.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {results.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No test results yet. Run a test to see results here.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getTypeColor(result.type)}>
                        {result.type.toUpperCase()}
                      </Badge>
                      {getStatusIcon(result.status)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{result.message}</p>
                  {result.data && (
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto max-h-32">
                      {typeof result.data === 'string' 
                        ? result.data 
                        : JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
