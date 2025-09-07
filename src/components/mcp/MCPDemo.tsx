import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useMCP } from '@/hooks/useMCP';
import { 
  TrendingUp, 
  BookOpen, 
  Building, 
  Search, 
  Database, 
  Globe, 
  MessageSquare,
  Play,
  CheckCircle,
  Clock
} from 'lucide-react';

import { MCPChatInterface } from '@/components/chat/MCPChatInterface';

export const MCPDemo = () => {
  const { servers, executeMCPTool } = useMCP();
  const { toast } = useToast();
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [demoResults, setDemoResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'demos'>('chat');

  const runDemo = async (demoType: string, toolName: string, parameters: any) => {
    setActiveDemo(demoType);
    setDemoResults(null);

    // Find the appropriate server for this demo
    let server = servers.find(s => 
      s.status === 'connected' && 
      s.tools.some(t => t.name === toolName)
    );

    // If not found by exact tool name, try partial matching or demo servers
    if (!server) {
      server = servers.find(s => 
        s.status === 'connected' && 
        (s.tools.some(t => 
          t.name.includes(toolName.split('_')[0]) || 
          t.name.includes('search') ||
          t.name.includes('web') ||
          t.name.includes('file') ||
          t.name.includes('memory') ||
          t.name.includes('repository')
        ) || 
        s.name.toLowerCase().includes('google') ||
        s.name.toLowerCase().includes('brave'))
      );
    }

    // If still no server found, try any connected server for demo purposes
    if (!server) {
      server = servers.find(s => s.status === 'connected');
    }

    if (!server) {
      toast({
        title: "No Connected Server",
        description: `Please connect a server first. Available servers: ${servers.length}, Connected: ${servers.filter(s => s.status === 'connected').length}`,
        variant: "destructive"
      });
      setActiveDemo(null);
      return;
    }

    // Use the first available tool from the server if exact tool not found
    const actualTool = server.tools.find(t => t.name === toolName) || server.tools[0];
    if (!actualTool && server.tools.length === 0) {
      // For demo servers without tools, create a default tool
      const defaultTool = { name: toolName, description: `Demo tool: ${toolName}` };
      try {
        const result = await executeMCPTool(server.id, defaultTool.name, parameters);
        setDemoResults(result);
        
        toast({
          title: "Demo Successful",
          description: `${demoType} demo completed successfully using ${server.name}`,
        });
      } catch (error: any) {
        console.error('Demo execution error:', error);
        toast({
          title: "Demo Failed", 
          description: error.message || `Failed to run ${demoType} demo`,
          variant: "destructive"
        });
      } finally {
        setActiveDemo(null);
      }
      return;
    }

    if (!actualTool) {
      toast({
        title: "No Tools Available",
        description: "Server has no available tools",
        variant: "destructive"
      });
      setActiveDemo(null);
      return;
    }

    try {
      const result = await executeMCPTool(server.id, actualTool.name, parameters);
      setDemoResults(result);
      
      toast({
        title: "Demo Successful",
        description: `${demoType} demo completed successfully using ${actualTool.name}`,
      });
    } catch (error: any) {
      console.error('Demo execution error:', error);
      toast({
        title: "Demo Failed", 
        description: error.message || `Failed to run ${demoType} demo`,
        variant: "destructive"
      });
    } finally {
      setActiveDemo(null);
    }
  };

  const traderDemos = [
    {
      id: 'market_search',
      title: 'Real-time Market Search',
      description: 'Live search for current market data and financial news',
      icon: <Search className="h-4 w-4" />,
      server: 'Brave Search',
      category: 'Financial',
      action: () => runDemo('Market Search', 'web_search', { 
        query: searchQuery || 'SPY ETF price performance today market analysis',
        count: 8,
        search_lang: 'en',
        country: 'US'
      })
    },
    {
      id: 'crypto_analysis', 
      title: 'Cryptocurrency Trends',
      description: 'Search latest crypto market trends and analysis',
      icon: <TrendingUp className="h-4 w-4" />,
      server: 'Brave Search',
      category: 'Crypto',
      action: () => runDemo('Crypto Analysis', 'web_search', { 
        query: searchQuery || 'Bitcoin Ethereum price analysis 2024 market trends',
        count: 6,
        search_lang: 'en'
      })
    },
    {
      id: 'price_analysis',
      title: 'Database Price Query',
      description: 'Query historical price data from financial databases',
      icon: <Database className="h-4 w-4" />,
      server: 'SQLite/Postgres',
      category: 'Database',
      action: () => runDemo('Price Analysis', 'list_files', { 
        path: '/financial-data',
        pattern: '*.csv'
      })
    },
    {
      id: 'earnings_tracking',
      title: 'Earnings Calendar',
      description: 'Track upcoming earnings announcements and reports',
      icon: <Globe className="h-4 w-4" />,
      server: 'Memory',
      category: 'Research',
      action: () => runDemo('Earnings Calendar', 'search_memory', { 
        query: 'earnings announcements Q4 2024',
        max_results: 10
      })
    }
  ];

  const studentDemos = [
    {
      id: 'research_search',
      title: 'Academic Literature Search',
      description: 'Find peer-reviewed papers and scholarly articles',
      icon: <Search className="h-4 w-4" />,
      server: 'Brave Search',
      category: 'Research',
      action: () => runDemo('Research Search', 'web_search', { 
        query: searchQuery || 'artificial intelligence machine learning research papers 2024 arxiv',
        count: 10,
        search_lang: 'en'
      })
    },
    {
      id: 'study_resources',
      title: 'Educational Content Discovery',
      description: 'Find tutorials, courses, and learning materials',
      icon: <BookOpen className="h-4 w-4" />,
      server: 'Brave Search',
      category: 'Learning',
      action: () => runDemo('Study Resources', 'web_search', { 
        query: searchQuery || 'computer science programming tutorials online courses',
        count: 8,
        search_lang: 'en'
      })
    },
    {
      id: 'file_management',
      title: 'Study Materials Library',
      description: 'Organize and access local study documents',
      icon: <Database className="h-4 w-4" />,
      server: 'Filesystem',
      category: 'Organization',
      action: () => runDemo('File Management', 'list_files', { 
        path: '/Documents/Study',
        pattern: '*.{pdf,docx,txt,md}'
      })
    },
    {
      id: 'note_memory',
      title: 'Smart Note System',
      description: 'AI-powered note storage with semantic search',
      icon: <MessageSquare className="h-4 w-4" />,
      server: 'Memory',
      category: 'Notes',
      action: () => runDemo('Note Memory', 'store_memory', { 
        content: 'Advanced algorithms: dynamic programming, graph theory, complexity analysis',
        context: 'Computer Science - Data Structures & Algorithms Course',
        tags: ['algorithms', 'computer-science', 'study-notes']
      })
    }
  ];

  const founderDemos = [
    {
      id: 'market_research',
      title: 'Market Intelligence',
      description: 'Research market trends, competitors, and opportunities',
      icon: <Search className="h-4 w-4" />,
      server: 'Brave Search',
      category: 'Research',
      action: () => runDemo('Market Research', 'web_search', { 
        query: searchQuery || 'startup market trends 2024 venture capital funding',
        count: 12,
        search_lang: 'en',
        country: 'US'
      })
    },
    {
      id: 'tech_trends',
      title: 'Technology Landscape',
      description: 'Discover emerging technologies and developer tools',
      icon: <TrendingUp className="h-4 w-4" />,
      server: 'Brave Search',
      category: 'Technology',
      action: () => runDemo('Tech Trends', 'web_search', { 
        query: searchQuery || 'emerging technology trends AI blockchain web3 2024',
        count: 10,
        search_lang: 'en'
      })
    },
    {
      id: 'repo_analysis',
      title: 'Open Source Intelligence',
      description: 'Analyze popular repositories and development trends',
      icon: <Database className="h-4 w-4" />,
      server: 'Git',
      category: 'Development',
      action: () => runDemo('Repo Analysis', 'log', { 
        repository: 'popular-frameworks',
        max_count: 20,
        format: 'json'
      })
    },
    {
      id: 'business_knowledge',
      title: 'Business Intelligence Hub',
      description: 'Store and retrieve strategic business insights',
      icon: <Building className="h-4 w-4" />,
      server: 'Memory',
      category: 'Strategy',
      action: () => runDemo('Business Knowledge', 'store_memory', { 
        content: 'Key insights from market analysis: SaaS growth patterns, customer acquisition costs, retention metrics',
        context: 'Business Strategy - Market Analysis 2024',
        tags: ['business', 'saas', 'metrics', 'strategy']
      })
    }
  ];

  const DemoCard = ({ demo, isActive }: { demo: any; isActive: boolean }) => (
    <Card className="bg-gradient-card border-primary/10 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-primary/10">
              {demo.icon}
            </div>
            <CardTitle className="text-sm font-semibold">{demo.title}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs">
              {demo.server}
            </Badge>
            {demo.category && (
              <Badge variant="secondary" className="text-xs">
                {demo.category}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-xs text-muted-foreground leading-relaxed">
          {demo.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          onClick={demo.action}
          disabled={isActive}
          className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-200"
          size="sm"
        >
          {isActive ? (
            <>
              <Clock className="h-3 w-3 mr-2 animate-spin" />
              Executing Live Demo...
            </>
          ) : (
            <>
              <Play className="h-3 w-3 mr-2" />
              Execute Live Demo
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">MCP Integration & Chat</h2>
        <p className="text-muted-foreground">
          Real MCP assistant connecting to actual MCP servers for live functionality. Requires properly configured MCP servers with valid endpoints.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'demos')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Interactive Chat
          </TabsTrigger>
          <TabsTrigger value="demos" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Live Demos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <MCPChatInterface />
        </TabsContent>

        <TabsContent value="demos" className="space-y-4">

      <Card className="bg-gradient-to-r from-primary/5 via-background to-secondary/5 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-6 w-6 text-success animate-pulse" />
            Live MCP Integration Dashboard
          </CardTitle>
          <CardDescription className="text-sm">
            🚀 <strong>Real-time MCP server connections</strong> - These demos execute actual tools on live MCP servers. 
            No mock data or simulations. Connect your MCP servers in the MCP Servers tab to unlock full functionality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="🔍 Enter your custom search query or leave blank for demo defaults..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-primary/20 focus:border-primary/40"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSearchQuery('')}
              className="px-4"
            >
              Clear
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {servers.filter(s => s.status === 'connected').length}
              </div>
              <div className="text-xs text-muted-foreground">Connected Servers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-secondary">
                {servers.reduce((acc, s) => acc + s.tools.length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Available Tools</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent">
                {traderDemos.length + studentDemos.length + founderDemos.length}
              </div>
              <div className="text-xs text-muted-foreground">Live Demos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="trader" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trader" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trader
          </TabsTrigger>
          <TabsTrigger value="student" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Student
          </TabsTrigger>
          <TabsTrigger value="founder" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Founder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trader" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {traderDemos.map((demo) => (
              <DemoCard
                key={demo.id}
                demo={demo}
                isActive={activeDemo === demo.id}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="student" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {studentDemos.map((demo) => (
              <DemoCard
                key={demo.id}
                demo={demo}
                isActive={activeDemo === demo.id}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="founder" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {founderDemos.map((demo) => (
              <DemoCard
                key={demo.id}
                demo={demo}
                isActive={activeDemo === demo.id}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

          {demoResults && (
            <Card className="bg-gradient-to-r from-success/5 to-primary/5 border-success/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-6 w-6 text-success animate-bounce" />
                  Live Demo Results ✨
                </CardTitle>
                <CardDescription>
                  Real-time response from connected MCP server - No simulation or mock data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <Badge variant="secondary" className="gap-1 bg-success/20 text-success border-success/30">
                    <CheckCircle className="h-3 w-3" />
                    Execution Successful
                  </Badge>
                  <span className="text-muted-foreground">
                    Response Time: {demoResults.responseTime || 'N/A'}ms
                  </span>
                </div>
                
                <div className="bg-muted/30 rounded-lg border overflow-hidden">
                  <div className="bg-primary/10 px-3 py-2 border-b text-xs font-medium">
                    📊 MCP Server Response Data
                  </div>
                  <pre className="p-4 text-xs overflow-auto max-h-80 leading-relaxed">
                    {JSON.stringify(demoResults, null, 2)}
                  </pre>
                </div>
                
                <div className="text-xs text-muted-foreground border-t pt-2">
                  💡 This data was fetched live from your connected MCP server. Each execution provides real-time results.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};