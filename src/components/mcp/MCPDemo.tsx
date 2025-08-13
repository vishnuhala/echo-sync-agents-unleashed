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

export const MCPDemo = () => {
  const { servers, executeMCPTool } = useMCP();
  const { toast } = useToast();
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [demoResults, setDemoResults] = useState<any>(null);

  const runDemo = async (demoType: string, toolName: string, parameters: any) => {
    setActiveDemo(demoType);
    setDemoResults(null);

    // Find the appropriate server for this demo
    let server = servers.find(s => 
      s.status === 'connected' && 
      s.tools.some(t => t.name === toolName)
    );

    // If not found by exact tool name, try partial matching
    if (!server) {
      server = servers.find(s => 
        s.status === 'connected' && 
        s.tools.some(t => 
          t.name.includes(toolName.split('_')[0]) || 
          t.name.includes('search') ||
          t.name.includes('web') ||
          t.name.includes('file') ||
          t.name.includes('memory') ||
          t.name.includes('repository')
        )
      );
    }

    if (!server) {
      toast({
        title: "No Connected Server",
        description: `Please connect a server with search capability first. Available servers: ${servers.filter(s => s.status === 'connected').length}`,
        variant: "destructive"
      });
      setActiveDemo(null);
      return;
    }

    // Use the first available tool from the server if exact tool not found
    const actualTool = server.tools.find(t => t.name === toolName) || server.tools[0];
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
      title: 'Market Data Search',
      description: 'Search for real-time market information and news',
      icon: <Search className="h-4 w-4" />,
      server: 'Brave Search',
      action: () => runDemo('Market Search', 'web_search', { 
        query: searchQuery || 'SPY stock price today',
        count: 5 
      })
    },
    {
      id: 'price_analysis',
      title: 'Price Analysis',
      description: 'Analyze historical price data from database',
      icon: <Database className="h-4 w-4" />,
      server: 'SQLite/Postgres',
      action: () => runDemo('Price Analysis', 'query', { 
        query: 'SELECT * FROM prices WHERE symbol = "AAPL" ORDER BY date DESC LIMIT 10' 
      })
    },
    {
      id: 'earnings_scrape',
      title: 'Earnings Data Scraping',
      description: 'Scrape earnings information from financial websites',
      icon: <Globe className="h-4 w-4" />,
      server: 'Puppeteer',
      action: () => runDemo('Earnings Scrape', 'scrape', { 
        url: 'https://finance.yahoo.com/quote/AAPL',
        selector: '.earnings-data' 
      })
    }
  ];

  const studentDemos = [
    {
      id: 'research_search',
      title: 'Academic Research',
      description: 'Search for academic papers and research materials',
      icon: <Search className="h-4 w-4" />,
      server: 'Brave Search',
      action: () => runDemo('Research Search', 'web_search', { 
        query: searchQuery || 'machine learning research papers 2024',
        count: 5 
      })
    },
    {
      id: 'file_management',
      title: 'Study Materials Management',
      description: 'Organize and access study files and documents',
      icon: <Database className="h-4 w-4" />,
      server: 'Filesystem',
      action: () => runDemo('File Management', 'list_files', { 
        path: '/study-materials',
        filter: '*.pdf' 
      })
    },
    {
      id: 'note_memory',
      title: 'Long-term Note Storage',
      description: 'Store and retrieve study notes with context',
      icon: <Database className="h-4 w-4" />,
      server: 'Memory',
      action: () => runDemo('Note Memory', 'store_memory', { 
        content: 'Key concepts from today\'s lecture on neural networks',
        context: 'Computer Science - Machine Learning Course' 
      })
    }
  ];

  const founderDemos = [
    {
      id: 'repo_analysis',
      title: 'Repository Analysis',
      description: 'Analyze GitHub repositories for insights',
      icon: <Database className="h-4 w-4" />,
      server: 'GitHub',
      action: () => runDemo('Repo Analysis', 'get_repository', { 
        owner: 'vercel',
        repo: 'next.js' 
      })
    },
    {
      id: 'team_communication',
      title: 'Team Communication',
      description: 'Send messages and notifications to team channels',
      icon: <MessageSquare className="h-4 w-4" />,
      server: 'Slack',
      action: () => runDemo('Team Communication', 'send_message', { 
        channel: '#general',
        message: 'MCP integration is working perfectly!' 
      })
    },
    {
      id: 'competitor_research',
      title: 'Competitive Intelligence',
      description: 'Research competitors and market trends',
      icon: <Search className="h-4 w-4" />,
      server: 'Brave Search',
      action: () => runDemo('Competitor Research', 'web_search', { 
        query: searchQuery || 'YC startup trends 2024',
        count: 5 
      })
    }
  ];

  const DemoCard = ({ demo, isActive }: { demo: any; isActive: boolean }) => (
    <Card className="bg-gradient-card border-primary/10 hover:shadow-glow transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {demo.icon}
            <CardTitle className="text-sm">{demo.title}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {demo.server}
          </Badge>
        </div>
        <CardDescription className="text-xs">{demo.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={demo.action}
          disabled={isActive}
          className="w-full bg-gradient-primary"
          size="sm"
        >
          {isActive ? (
            <>
              <Clock className="h-3 w-3 mr-1 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-3 w-3 mr-1" />
              Run Demo
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">MCP Integration Demos</h2>
        <p className="text-muted-foreground">
          Live demonstrations of MCP servers working with real functionality for each sector
        </p>
      </div>

      <Card className="bg-gradient-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Real Working MCP Integration
          </CardTitle>
          <CardDescription>
            These demos connect to actual MCP servers and execute real tools. Make sure you have connected the required servers first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Enter custom search query (optional)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Connected Servers: {servers.filter(s => s.status === 'connected').length} | 
            Total Tools Available: {servers.reduce((acc, s) => acc + s.tools.length, 0)}
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
        <Card className="bg-gradient-to-r from-success/5 to-primary/5 border-success/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Demo Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted/30 rounded p-4 text-xs overflow-auto max-h-60">
              {JSON.stringify(demoResults, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};