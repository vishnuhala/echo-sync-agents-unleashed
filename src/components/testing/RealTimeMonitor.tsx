import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMCP } from '@/hooks/useMCP';
import { useRAG } from '@/hooks/useRAG';
import { useA2A } from '@/hooks/useA2A';
import { useAgents } from '@/hooks/useAgents';
import { Activity, Database, MessageSquare, Network, Zap } from 'lucide-react';

export const RealTimeMonitor = () => {
  const { servers } = useMCP();
  const { vectorIndexes, queryHistory } = useRAG();
  const { messages: a2aMessages, workflows } = useA2A();
  const { agents, userAgents, interactions } = useAgents();
  
  const [mcpUpdates, setMcpUpdates] = useState<string[]>([]);
  const [ragUpdates, setRagUpdates] = useState<string[]>([]);
  const [a2aUpdates, setA2aUpdates] = useState<string[]>([]);
  const [agentUpdates, setAgentUpdates] = useState<string[]>([]);

  // Track MCP updates
  useEffect(() => {
    setMcpUpdates(prev => [
      `[${new Date().toLocaleTimeString()}] MCP Servers: ${servers.length} active`,
      ...prev.slice(0, 9)
    ]);
  }, [servers]);

  // Track RAG updates
  useEffect(() => {
    setRagUpdates(prev => [
      `[${new Date().toLocaleTimeString()}] Vector Indexes: ${vectorIndexes.length}, Queries: ${queryHistory.length}`,
      ...prev.slice(0, 9)
    ]);
  }, [vectorIndexes, queryHistory]);

  // Track A2A updates
  useEffect(() => {
    setA2aUpdates(prev => [
      `[${new Date().toLocaleTimeString()}] A2A Messages: ${a2aMessages.length}, Workflows: ${workflows.length}`,
      ...prev.slice(0, 9)
    ]);
  }, [a2aMessages, workflows]);

  // Track Agent updates
  useEffect(() => {
    setAgentUpdates(prev => [
      `[${new Date().toLocaleTimeString()}] Agents: ${agents.length}, Active: ${userAgents.length}, Interactions: ${interactions.length}`,
      ...prev.slice(0, 9)
    ]);
  }, [agents, userAgents, interactions]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <CardTitle>Real-Time System Monitor</CardTitle>
          <Badge variant="outline" className="ml-auto">
            <Zap className="h-3 w-3 mr-1" />
            Live Updates
          </Badge>
        </div>
        <CardDescription>Monitor live activity across all systems</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MCP Monitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-blue-500" />
              MCP Servers
            </CardTitle>
            <CardDescription>
              Real-time server status and connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Connected:</span>
                <Badge variant="secondary">
                  {servers.filter(s => s.status === 'connected').length}
                </Badge>
              </div>
              <ScrollArea className="h-32 rounded border p-2">
                <div className="space-y-1 text-xs font-mono">
                  {mcpUpdates.map((update, i) => (
                    <div key={i} className="text-muted-foreground">
                      {update}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* RAG Monitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-500" />
              RAG System
            </CardTitle>
            <CardDescription>
              Vector indexes and query history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ready Indexes:</span>
                <Badge variant="secondary">
                  {vectorIndexes.filter(v => v.status === 'ready').length}
                </Badge>
              </div>
              <ScrollArea className="h-32 rounded border p-2">
                <div className="space-y-1 text-xs font-mono">
                  {ragUpdates.map((update, i) => (
                    <div key={i} className="text-muted-foreground">
                      {update}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* A2A Monitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              A2A Communication
            </CardTitle>
            <CardDescription>
              Agent-to-agent messaging and workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Workflows:</span>
                <Badge variant="secondary">
                  {workflows.filter(w => w.is_active).length}
                </Badge>
              </div>
              <ScrollArea className="h-32 rounded border p-2">
                <div className="space-y-1 text-xs font-mono">
                  {a2aUpdates.map((update, i) => (
                    <div key={i} className="text-muted-foreground">
                      {update}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Agents Monitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Agents & Interactions
            </CardTitle>
            <CardDescription>
              Agent activations and user interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recent Interactions:</span>
                <Badge variant="secondary">{interactions.length}</Badge>
              </div>
              <ScrollArea className="h-32 rounded border p-2">
                <div className="space-y-1 text-xs font-mono">
                  {agentUpdates.map((update, i) => (
                    <div key={i} className="text-muted-foreground">
                      {update}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Status Overview</CardTitle>
          <CardDescription>Live metrics across all subsystems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-3xl font-bold text-blue-500">{servers.length}</div>
              <div className="text-sm text-muted-foreground">MCP Servers</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-3xl font-bold text-green-500">{vectorIndexes.length}</div>
              <div className="text-sm text-muted-foreground">Vector Indexes</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-3xl font-bold text-purple-500">{a2aMessages.length}</div>
              <div className="text-sm text-muted-foreground">A2A Messages</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-3xl font-bold text-orange-500">{interactions.length}</div>
              <div className="text-sm text-muted-foreground">Interactions</div>
            </div>
          </div>
        </CardContent>
      </Card>
      </CardContent>
    </Card>
  );
};