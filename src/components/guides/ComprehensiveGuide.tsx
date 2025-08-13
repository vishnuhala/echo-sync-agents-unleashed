import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Database, 
  Users, 
  Server, 
  Brain, 
  Code, 
  Zap, 
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Play,
  Settings
} from 'lucide-react';

export const ComprehensiveGuide = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Complete Multi-Agent AI Platform Guide
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Master MCP Servers, Agent-to-Agent Communication, RAG Systems, LlamaIndex, and LangGraph in real-time
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mcp">MCP</TabsTrigger>
          <TabsTrigger value="a2a">A2A</TabsTrigger>
          <TabsTrigger value="agents">Agent Creator</TabsTrigger>
          <TabsTrigger value="rag">RAG</TabsTrigger>
          <TabsTrigger value="llamaindex">LlamaIndex</TabsTrigger>
          <TabsTrigger value="langraph">LangGraph</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-gradient-card border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6" />
                Platform Architecture Overview
              </CardTitle>
              <CardDescription>
                Your AI platform integrates multiple cutting-edge technologies in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-blue-500/20 bg-blue-500/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-lg">MCP Servers</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Connect to external tools and services through the Model Context Protocol
                    </p>
                    <Badge className="mt-2 bg-blue-500/10 text-blue-500 border-blue-500/20">
                      Real-time
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-green-500/20 bg-green-500/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-500" />
                      <CardTitle className="text-lg">A2A Communication</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Agents communicate and collaborate in sophisticated workflows
                    </p>
                    <Badge className="mt-2 bg-green-500/10 text-green-500 border-green-500/20">
                      Live Workflows
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-purple-500/20 bg-purple-500/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-purple-500" />
                      <CardTitle className="text-lg">RAG System</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Vector database with intelligent document retrieval
                    </p>
                    <Badge className="mt-2 bg-purple-500/10 text-purple-500 border-purple-500/20">
                      Vector DB
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All systems are configured for real-time operation with Supabase backend and WebSocket support.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mcp" className="space-y-6">
          <Card className="bg-gradient-card border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-6 w-6 text-blue-500" />
                MCP (Model Context Protocol) Complete Guide
              </CardTitle>
              <CardDescription>
                Connect AI agents to external tools and services seamlessly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">What is MCP?</h3>
                  <p className="text-muted-foreground">
                    MCP enables AI agents to connect with external tools, databases, and services. 
                    It provides a standardized way for agents to access real-world capabilities in real-time.
                  </p>
                  
                  <h4 className="font-semibold">Current Features:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Live server connection management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Real-time tool execution
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Open source server integration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Sector-specific demonstrations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      A2A tool integration
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Integrated MCP Servers</h3>
                  <div className="space-y-2">
                    <Badge variant="outline" className="mr-2">GitHub MCP</Badge>
                    <Badge variant="outline" className="mr-2">File System</Badge>
                    <Badge variant="outline" className="mr-2">Brave Search</Badge>
                    <Badge variant="outline" className="mr-2">Google Drive</Badge>
                    <Badge variant="outline" className="mr-2">Memory Bank</Badge>
                    <Badge variant="outline" className="mr-2">PostgreSQL</Badge>
                    <Badge variant="outline" className="mr-2">Slack</Badge>
                    <Badge variant="outline" className="mr-2">Everything</Badge>
                  </div>
                  
                  <div className="pt-4">
                    <Button className="w-full" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Add Open Source Servers to Your Project
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">MCP Implementation Steps</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</div>
                        <span className="font-semibold">Browse Servers</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Go to "Open Source MCP" to see available servers
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">2</div>
                        <span className="font-semibold">Add & Connect</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Add servers to your project and connect them live
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">3</div>
                        <span className="font-semibold">Test Tools</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Use "Live Demos" to test sector-specific tools
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">4</div>
                        <span className="font-semibold">A2A Integration</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Agents can now execute MCP tools automatically
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="a2a" className="space-y-6">
          <Card className="bg-gradient-card border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-500" />
                Agent-to-Agent (A2A) Communication Guide
              </CardTitle>
              <CardDescription>
                Enable sophisticated multi-agent workflows and collaboration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Enhanced A2A Features</h3>
                  <p className="text-muted-foreground">
                    Real-time agent communication with structured intents, MCP tool execution, and live collaboration.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Structured Communication</h4>
                        <p className="text-sm text-muted-foreground">Direct messages and tool execution intents</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">MCP Tool Integration</h4>
                        <p className="text-sm text-muted-foreground">Agents execute MCP tools for each other</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Real-time Updates</h4>
                        <p className="text-sm text-muted-foreground">Live status updates and incremental results</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Context Persistence</h4>
                        <p className="text-sm text-muted-foreground">Agents maintain shared conversation state</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Communication Types</h3>
                  <div className="space-y-3">
                    <Card className="bg-card/50 border-blue-500/20">
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm text-blue-500">Direct Intent</h4>
                        <p className="text-xs text-muted-foreground">Simple message exchange between agents</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-card/50 border-purple-500/20">
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm text-purple-500">Tool Intent</h4>
                        <p className="text-xs text-muted-foreground">Agent requests another to execute MCP tools</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-card/50 border-green-500/20">
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm text-green-500">Workflow Chain</h4>
                        <p className="text-xs text-muted-foreground">Complex multi-step processes with handoffs</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">A2A Implementation Steps</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { step: 1, title: "Create Agents", desc: "Build agents with Agent Creator - each gets a chat interface" },
                    { step: 2, title: "Connect MCP", desc: "Add MCP servers for tools agents can execute" },
                    { step: 3, title: "Test A2A", desc: "Use A2A tab to send direct messages or tool requests" },
                    { step: 4, title: "Live Workflow", desc: "Agents communicate in real-time with status updates" }
                  ].map((item) => (
                    <Card key={item.step} className="bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
                            {item.step}
                          </div>
                          <span className="font-semibold text-sm">{item.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Card className="bg-gradient-card border-orange-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-orange-500" />
                Agent Creator Complete Guide
              </CardTitle>
              <CardDescription>
                Create specialized AI agents with templates or custom configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Agent Creation Methods</h3>
                  <p className="text-muted-foreground">
                    Build AI agents using pre-built templates or create custom agents with specific capabilities and frameworks.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Template Agents</h4>
                        <p className="text-sm text-muted-foreground">Pre-configured agents for common use cases</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Custom Configuration</h4>
                        <p className="text-sm text-muted-foreground">Full control over agent capabilities and behavior</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Instant Chat Access</h4>
                        <p className="text-sm text-muted-foreground">Each agent gets its own dedicated chat interface</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Framework Support</h4>
                        <p className="text-sm text-muted-foreground">LangChain, ADK, and Custom implementations</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Available Templates</h3>
                  <div className="space-y-3">
                    <Card className="bg-card/50 border-blue-500/20">
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm text-blue-500">Document Analyst</h4>
                        <p className="text-xs text-muted-foreground">LangChain + RAG for document processing</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-card/50 border-green-500/20">
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm text-green-500">Code Assistant</h4>
                        <p className="text-xs text-muted-foreground">ADK framework for programming tasks</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-card/50 border-purple-500/20">
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm text-purple-500">Research Agent</h4>
                        <p className="text-xs text-muted-foreground">Custom framework with LlamaIndex</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Agent Creation Workflow</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { step: 1, title: "Choose Method", desc: "Select template or custom creation" },
                    { step: 2, title: "Configure Agent", desc: "Set capabilities, tools, and framework" },
                    { step: 3, title: "Create & Deploy", desc: "Agent is created and activated instantly" },
                    { step: 4, title: "Start Chatting", desc: "Direct navigation to dedicated chat interface" }
                  ].map((item) => (
                    <Card key={item.step} className="bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                            {item.step}
                          </div>
                          <span className="font-semibold text-sm">{item.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Alert className="border-orange-500/20 bg-orange-500/5">
                <Bot className="h-4 w-4" />
                <AlertDescription>
                  <strong>Single Agent Focus:</strong> Each agent creation opens a dedicated chat where you can test and interact with that specific agent immediately.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rag" className="space-y-6">
          <Card className="bg-gradient-card border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-purple-500" />
                RAG System & Vector Database Guide
              </CardTitle>
              <CardDescription>
                Build intelligent document retrieval with real-time vector search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">What is RAG?</h3>
                  <p className="text-muted-foreground">
                    Retrieval-Augmented Generation combines document search with AI generation 
                    for context-aware responses using your own data.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-purple-500" />
                      <span>Document ingestion & chunking</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-purple-500" />
                      <span>Vector embeddings generation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-purple-500" />
                      <span>Semantic similarity search</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-purple-500" />
                      <span>Context-aware AI responses</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Vector Database Options</h3>
                  <div className="space-y-3">
                    <Card className="bg-card/50 border-green-500/20">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <h4 className="font-semibold text-sm">PostgreSQL + pgvector</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">Built-in with Supabase (Recommended)</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-card/50">
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm">Pinecone</h4>
                        <p className="text-xs text-muted-foreground">Managed vector database service</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-card/50">
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm">Weaviate</h4>
                        <p className="text-xs text-muted-foreground">Open-source vector search engine</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">RAG Setup Process</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { step: 1, title: "Create Index", desc: "Set up vector index with embedding model" },
                    { step: 2, title: "Upload Docs", desc: "Add documents to your knowledge base" },
                    { step: 3, title: "Index Content", desc: "Process and vectorize documents" },
                    { step: 4, title: "Create Agent", desc: "Build RAG-enabled agent" },
                    { step: 5, title: "Query & Chat", desc: "Ask questions about your documents" }
                  ].map((item) => (
                    <Card key={item.step} className="bg-card/50">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">
                            {item.step}
                          </div>
                          <span className="font-semibold text-xs">{item.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Alert className="border-purple-500/20 bg-purple-500/5">
                <Database className="h-4 w-4" />
                <AlertDescription>
                  <strong>Vector Database Ready:</strong> Your Supabase instance includes pgvector extension for high-performance vector operations.
                  Create your first vector index in the RAG System tab!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llamaindex" className="space-y-6">
          <Card className="bg-gradient-card border-orange-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-orange-500" />
                LlamaIndex Integration Guide
              </CardTitle>
              <CardDescription>
                Advanced document processing and multi-modal AI capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">LlamaIndex Features</h3>
                  <p className="text-muted-foreground">
                    LlamaIndex provides advanced data connectors, indexing strategies, 
                    and query engines for sophisticated AI applications.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Data Connectors</h4>
                        <p className="text-sm text-muted-foreground">100+ connectors for various data sources</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Query Engines</h4>
                        <p className="text-sm text-muted-foreground">Multiple strategies for information retrieval</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Multi-modal Support</h4>
                        <p className="text-sm text-muted-foreground">Text, images, audio, and video processing</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Supported Data Sources</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'PDF Documents',
                      'Web Pages',
                      'CSV Files',
                      'Notion Pages',
                      'Google Docs',
                      'Slack Messages',
                      'Discord Chats',
                      'YouTube Videos',
                      'Twitter/X Posts',
                      'GitHub Repos',
                      'Confluence',
                      'Databases'
                    ].map((source) => (
                      <Badge key={source} variant="outline" className="justify-center">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Integration Workflow</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-card/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center">1</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Data Ingestion</h4>
                      <p className="text-sm text-muted-foreground">Connect to data sources using LlamaIndex connectors</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-card/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center">2</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Index Creation</h4>
                      <p className="text-sm text-muted-foreground">Build vector indexes with advanced chunking strategies</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-card/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center">3</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Query Processing</h4>
                      <p className="text-sm text-muted-foreground">Use sophisticated query engines for accurate retrieval</p>
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="border-orange-500/20 bg-orange-500/5">
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  <strong>LlamaIndex Ready:</strong> API key configured. Create agents with 'custom' framework to leverage LlamaIndex capabilities.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="langraph" className="space-y-6">
          <Card className="bg-gradient-card border-cyan-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-cyan-500" />
                LangGraph Workflow Engine
              </CardTitle>
              <CardDescription>
                Build sophisticated agent workflows with state management and control flow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">LangGraph Concepts</h3>
                  <p className="text-muted-foreground">
                    LangGraph enables building stateful, multi-actor applications with 
                    complex decision trees and conditional logic.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-cyan-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">State Management</h4>
                        <p className="text-sm text-muted-foreground">Persistent state across workflow steps</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-cyan-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Conditional Routing</h4>
                        <p className="text-sm text-muted-foreground">Dynamic path selection based on conditions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-cyan-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Human-in-the-Loop</h4>
                        <p className="text-sm text-muted-foreground">Human approval and intervention points</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Workflow Patterns</h3>
                  <div className="space-y-3">
                    <Card className="bg-card/50">
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm">Sequential Chains</h4>
                        <p className="text-xs text-muted-foreground">Linear step-by-step execution</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-card/50">
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm">Decision Trees</h4>
                        <p className="text-xs text-muted-foreground">Branching logic based on conditions</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-card/50">
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm">State Machines</h4>
                        <p className="text-xs text-muted-foreground">Complex state transitions and loops</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-card/50">
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm">Multi-Agent</h4>
                        <p className="text-xs text-muted-foreground">Coordinated agent collaboration</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Building Your First LangGraph Workflow</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { step: 1, title: "Define Nodes", desc: "Create workflow steps and agents" },
                    { step: 2, title: "Set Edges", desc: "Define transitions and conditions" },
                    { step: 3, title: "Add State", desc: "Configure shared state schema" },
                    { step: 4, title: "Execute", desc: "Run workflow with monitoring" }
                  ].map((item) => (
                    <Card key={item.step} className="bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center">
                            {item.step}
                          </div>
                          <span className="font-semibold text-sm">{item.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Alert className="border-cyan-500/20 bg-cyan-500/5">
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>LangGraph Integration:</strong> Use the A2A Communication tab to build LangGraph-powered workflows with multiple agents.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};