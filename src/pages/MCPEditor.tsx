import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MCPServerManager } from '@/components/mcp/MCPServer';
import { MCPServerList } from '@/components/mcp/MCPServerList';
import { MCPDemo } from '@/components/mcp/MCPDemo';
import { GoogleMCPIntegration } from '@/components/mcp/GoogleMCPIntegration';
import { A2ACommunication } from '@/components/agents/A2ACommunication';
import { AgentCreator } from '@/components/agents/AgentCreator';
import { RAGSystem } from '@/components/rag/RAGSystem';
import { ComprehensiveGuide } from '@/components/guides/ComprehensiveGuide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Users, Bot, Database, List, BookOpen, Play, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MCPEditor() {
  const navigate = useNavigate();
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

        <Tabs defaultValue="guide" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="guide" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Complete Guide
            </TabsTrigger>
            <TabsTrigger value="servers" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Open Source MCP
            </TabsTrigger>
            <TabsTrigger value="mcp" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              My MCP Servers
            </TabsTrigger>
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Live Demos
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
            <TabsTrigger value="testing" className="flex items-center gap-2" onClick={() => navigate('/testing')}>
              <FlaskConical className="h-4 w-4" />
              Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guide" className="space-y-6">
            <ComprehensiveGuide />
          </TabsContent>

          <TabsContent value="servers" className="space-y-6">
            <MCPServerList />
          </TabsContent>

          <TabsContent value="mcp" className="space-y-6">
            <MCPServerManager />
          </TabsContent>

          <TabsContent value="demo" className="space-y-6">
            <MCPDemo />
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