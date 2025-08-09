import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Download } from 'lucide-react';

interface MCPServerInfo {
  name: string;
  description: string;
  repository: string;
  installCommand: string;
  endpoint: string;
  features: string[];
  language: string;
  status: 'stable' | 'beta' | 'experimental';
}

export const MCPServerList = () => {
  const mcpServers: MCPServerInfo[] = [
    {
      name: "Filesystem Server",
      description: "Provides secure file system operations for reading, writing, and managing files and directories",
      repository: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
      installCommand: "npm install @modelcontextprotocol/server-filesystem",
      endpoint: "npx @modelcontextprotocol/server-filesystem /path/to/allowed/files",
      features: ["Read files", "Write files", "Create directories", "List contents", "File search"],
      language: "TypeScript",
      status: "stable"
    },
    {
      name: "Git Server",
      description: "Git repository operations, commit history, and version control management",
      repository: "https://github.com/modelcontextprotocol/servers/tree/main/src/git",
      installCommand: "npm install @modelcontextprotocol/server-git",
      endpoint: "npx @modelcontextprotocol/server-git --repository /path/to/repo",
      features: ["Git status", "Commit history", "Branch management", "Diff viewing", "File tracking"],
      language: "TypeScript",
      status: "stable"
    },
    {
      name: "SQLite Server",
      description: "Database operations for SQLite databases with secure query execution",
      repository: "https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite",
      installCommand: "npm install @modelcontextprotocol/server-sqlite",
      endpoint: "npx @modelcontextprotocol/server-sqlite /path/to/database.db",
      features: ["SQL queries", "Schema inspection", "Table operations", "Data export", "Query optimization"],
      language: "TypeScript",
      status: "stable"
    },
    {
      name: "Brave Search Server",
      description: "Web search capabilities using Brave Search API for real-time information retrieval",
      repository: "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
      installCommand: "npm install @modelcontextprotocol/server-brave-search",
      endpoint: "npx @modelcontextprotocol/server-brave-search",
      features: ["Web search", "News search", "Image search", "Safe search", "Location-based results"],
      language: "TypeScript",
      status: "stable"
    },
    {
      name: "GitHub Server",
      description: "GitHub repository management, issue tracking, and code repository operations",
      repository: "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
      installCommand: "npm install @modelcontextprotocol/server-github",
      endpoint: "npx @modelcontextprotocol/server-github",
      features: ["Repository access", "Issue management", "Pull requests", "File operations", "Search repositories"],
      language: "TypeScript",
      status: "stable"
    },
    {
      name: "Google Drive Server",
      description: "Google Drive integration for file management and document operations",
      repository: "https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive",
      installCommand: "npm install @modelcontextprotocol/server-gdrive",
      endpoint: "npx @modelcontextprotocol/server-gdrive",
      features: ["File upload/download", "Folder management", "Document sharing", "Search files", "Permissions"],
      language: "TypeScript",
      status: "beta"
    },
    {
      name: "Postgres Server",
      description: "PostgreSQL database operations with advanced query capabilities",
      repository: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
      installCommand: "npm install @modelcontextprotocol/server-postgres",
      endpoint: "npx @modelcontextprotocol/server-postgres",
      features: ["Complex queries", "Schema management", "Table operations", "Performance optimization", "Transactions"],
      language: "TypeScript",
      status: "stable"
    },
    {
      name: "Puppeteer Server",
      description: "Web scraping and browser automation using Puppeteer for dynamic content",
      repository: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
      installCommand: "npm install @modelcontextprotocol/server-puppeteer",
      endpoint: "npx @modelcontextprotocol/server-puppeteer",
      features: ["Web scraping", "Screenshot capture", "PDF generation", "Form interaction", "Navigation"],
      language: "TypeScript",
      status: "beta"
    },
    {
      name: "Memory Server",
      description: "Persistent memory and knowledge graph capabilities for agent memory management",
      repository: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
      installCommand: "npm install @modelcontextprotocol/server-memory",
      endpoint: "npx @modelcontextprotocol/server-memory",
      features: ["Knowledge storage", "Memory retrieval", "Context persistence", "Relationship mapping", "Search"],
      language: "TypeScript",
      status: "experimental"
    },
    {
      name: "Slack Server",
      description: "Slack workspace integration for messaging and channel management",
      repository: "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
      installCommand: "npm install @modelcontextprotocol/server-slack",
      endpoint: "npx @modelcontextprotocol/server-slack",
      features: ["Send messages", "Channel management", "User lookup", "File sharing", "Notifications"],
      language: "TypeScript",
      status: "beta"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-success/10 text-success border-success/20';
      case 'beta': return 'bg-warning/10 text-warning border-warning/20';
      case 'experimental': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Open Source MCP Servers</h2>
        <p className="text-muted-foreground">
          Ready-to-use MCP servers from the official Model Context Protocol repository
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {mcpServers.map((server) => (
          <Card key={server.name} className="bg-gradient-card border-primary/10 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {server.name}
                    <Badge variant="outline" className={getStatusColor(server.status)}>
                      {server.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{server.description}</CardDescription>
                </div>
                <Badge variant="secondary">{server.language}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <div className="flex flex-wrap gap-1">
                  {server.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Installation</h4>
                <div className="bg-muted/30 rounded p-2 font-mono text-sm">
                  {server.installCommand}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Endpoint</h4>
                <div className="bg-muted/30 rounded p-2 font-mono text-sm">
                  {server.endpoint}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(server.repository, '_blank')}
                  className="flex-1"
                >
                  <Github className="h-4 w-4 mr-1" />
                  Repository
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(server.installCommand)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Copy Install
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Getting Started with MCP Servers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">1. Install Server</h4>
              <p className="text-sm text-muted-foreground">
                Use npm to install the MCP server you want to use
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. Configure Environment</h4>
              <p className="text-sm text-muted-foreground">
                Set up required API keys and environment variables
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Start Server</h4>
              <p className="text-sm text-muted-foreground">
                Run the server using the provided endpoint command
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">4. Connect to Platform</h4>
              <p className="text-sm text-muted-foreground">
                Add the server endpoint to your MCP configuration
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};