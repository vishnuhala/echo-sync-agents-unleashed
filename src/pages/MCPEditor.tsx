import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MCPServerManager } from '@/components/mcp/MCPServer';
import { A2ACommunication } from '@/components/agents/A2ACommunication';
import { AgentCreator } from '@/components/agents/AgentCreator';
import { RAGSystem } from '@/components/rag/RAGSystem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Users, Bot, Database } from 'lucide-react';

export default function MCPEditor() {
  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            MCP & Multi-Agent Platform
          </h1>
          <p className="text-muted-foreground text-lg">
            Advanced AI agent ecosystem with MCP, A2A communication, LangChain/ADK integration, and RAG capabilities
          </p>
        </div>

        <Tabs defaultValue="mcp" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="mcp" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              MCP Servers
            </TabsTrigger>
            <TabsTrigger value="a2a" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              A2A Communication
            </TabsTrigger>
            <TabsTrigger value="creator" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Agent Creator
            </TabsTrigger>
            <TabsTrigger value="rag" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              RAG System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mcp" className="space-y-6">
            <MCPServerManager />
          </TabsContent>

          <TabsContent value="a2a" className="space-y-6">
            <A2ACommunication />
          </TabsContent>

          <TabsContent value="creator" className="space-y-6">
            <AgentCreator />
          </TabsContent>

          <TabsContent value="rag" className="space-y-6">
            <RAGSystem />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}