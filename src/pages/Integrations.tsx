import { useState } from 'react';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useAuth } from '@/hooks/useAuth';
import { useAgents } from '@/hooks/useAgents';
import { useMCP } from '@/hooks/useMCP';
import { useA2A } from '@/hooks/useA2A';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Settings, 
  Trash2, 
  TrendingUp, 
  BookOpen, 
  Building, 
  ExternalLink,
  Bot,
  Network,
  Server,
  MessageSquare,
  Activity,
  Zap,
  Users,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const availableIntegrations = {
  trader: [
    {
      name: 'yahoo_finance',
      displayName: 'Yahoo Finance',
      description: 'Real-time stock market data and financial news',
      icon: TrendingUp,
      configFields: ['api_key'],
    },
    {
      name: 'alpha_vantage',
      displayName: 'Alpha Vantage',
      description: 'Professional financial data and analytics',
      icon: TrendingUp,
      configFields: ['api_key'],
    },
  ],
  student: [
    {
      name: 'google_drive',
      displayName: 'Google Drive',
      description: 'Access and sync your study documents',
      icon: BookOpen,
      configFields: ['client_id', 'client_secret'],
    },
    {
      name: 'notion',
      displayName: 'Notion',
      description: 'Sync with your Notion workspace for notes',
      icon: BookOpen,
      configFields: ['api_key', 'database_id'],
    },
  ],
  founder: [
    {
      name: 'hubspot',
      displayName: 'HubSpot',
      description: 'CRM integration for customer management',
      icon: Building,
      configFields: ['api_key'],
    },
    {
      name: 'gmail',
      displayName: 'Gmail',
      description: 'Email automation and management',
      icon: Building,
      configFields: ['client_id', 'client_secret'],
    },
  ],
};

export default function Integrations() {
  const { profile } = useAuth();
  const { integrations, loading: integrationsLoading, createIntegration, updateIntegration, deleteIntegration } = useIntegrations();
  const { agents, userAgents, loading: agentsLoading } = useAgents();
  const { servers, loading: mcpLoading } = useMCP();
  const { messages, workflows, loading: a2aLoading } = useA2A();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [configData, setConfigData] = useState<Record<string, string>>({});

  const loading = integrationsLoading || agentsLoading || mcpLoading || a2aLoading;

  const userIntegrations = availableIntegrations[profile?.role as keyof typeof availableIntegrations] || [];

  // Get sector-specific data
  const getAllSectorsData = () => {
    const sectors = ['trader', 'student', 'founder'];
    
    return sectors.map(sector => {
      const sectorAgents = agents.filter(agent => agent.role === sector);
      const userSectorAgents = userAgents?.filter(ua => 
        agents.some(a => a.id === ua.agent_id && a.role === sector)
      ) || [];
      const sectorIntegrations = availableIntegrations[sector as keyof typeof availableIntegrations] || [];
      
      return {
        sector,
        displayName: sector.charAt(0).toUpperCase() + sector.slice(1),
        icon: sector === 'trader' ? TrendingUp : sector === 'student' ? BookOpen : Building,
        agents: sectorAgents,
        activeAgents: userSectorAgents.length,
        totalAgents: sectorAgents.length,
        integrations: sectorIntegrations,
        connectedIntegrations: integrations.filter(int => 
          sectorIntegrations.some(si => si.name === int.service_name) && int.active
        ).length
      };
    });
  };

  const getIntegrationStatus = (serviceName: string) => {
    return integrations.find(integration => integration.service_name === serviceName);
  };

  const handleCreateIntegration = async () => {
    if (!selectedService) return;

    const { error } = await createIntegration({
      service_name: selectedService.name,
      config: configData,
      active: true,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create integration",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `${selectedService.displayName} integration created successfully`,
      });
      setIsCreateDialogOpen(false);
      setSelectedService(null);
      setConfigData({});
    }
  };

  const handleToggleIntegration = async (serviceName: string, active: boolean) => {
    const { error } = await updateIntegration(serviceName, { active });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update integration",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Integration ${active ? 'activated' : 'deactivated'}`,
      });
    }
  };

  const handleDeleteIntegration = async (serviceName: string, displayName: string) => {
    if (!window.confirm(`Are you sure you want to delete the ${displayName} integration?`)) return;

    const { error } = await deleteIntegration(serviceName);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete integration",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Integration deleted successfully",
      });
    }
  };

  const openCreateDialog = (service: any) => {
    setSelectedService(service);
    setConfigData({});
    setIsCreateDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading integration dashboard...</p>
        </div>
      </div>
    );
  }

  const sectorsData = getAllSectorsData();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Integration Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive view of AI agents, MCP servers, A2A workflows, and external integrations across all sectors
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="external">External</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="mcp">MCP Servers</TabsTrigger>
            <TabsTrigger value="a2a">A2A Workflows</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Sector Overview Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sectorsData.map((sector) => {
                const SectorIcon = sector.icon;
                const isCurrentUserSector = profile?.role === sector.sector;
                
                return (
                  <Card key={sector.sector} className={`relative overflow-hidden transition-all ${
                    isCurrentUserSector 
                      ? 'ring-2 ring-primary bg-gradient-to-br from-primary/5 to-primary/10' 
                      : 'hover:shadow-lg'
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <SectorIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{sector.displayName}</CardTitle>
                            {isCurrentUserSector && (
                              <Badge variant="default" className="mt-1">Your Sector</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Bot className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">AI Agents</span>
                          </div>
                          <div className="text-2xl font-bold">{sector.activeAgents}/{sector.totalAgents}</div>
                          <div className="text-xs text-muted-foreground">Active/Total</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <ExternalLink className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Integrations</span>
                          </div>
                          <div className="text-2xl font-bold">{sector.connectedIntegrations}/{sector.integrations.length}</div>
                          <div className="text-xs text-muted-foreground">Connected/Available</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Global Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-card border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">MCP Servers</CardTitle>
                  <Server className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{servers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {servers.filter(s => s.status === 'connected').length} connected
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">A2A Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{messages.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Recent communications
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">A2A Workflows</CardTitle>
                  <Network className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workflows.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {workflows.filter(w => w.is_active).length} active
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
                  <Database className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{integrations.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {integrations.filter(i => i.active).length} active
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* External Integrations Tab */}
          <TabsContent value="external" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userIntegrations.map((service) => {
                const integration = getIntegrationStatus(service.name);
                const Icon = service.icon;

                return (
                  <Card key={service.name} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 flex items-center gap-2">
                            <Icon className="h-5 w-5 text-primary" />
                            {service.displayName}
                          </CardTitle>
                          <Badge variant={integration?.active ? "default" : "secondary"} className="mb-3">
                            {integration ? (integration.active ? 'Connected' : 'Inactive') : 'Not Connected'}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        {service.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex gap-2">
                        {integration ? (
                          <>
                            <Switch
                              checked={integration.active}
                              onCheckedChange={(checked) => handleToggleIntegration(service.name, checked)}
                            />
                            <Button
                              onClick={() => handleDeleteIntegration(service.name, service.displayName)}
                              variant="outline"
                              size="sm"
                              className="ml-auto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => openCreateDialog(service)}
                            className="flex-1"
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid gap-6">
              {sectorsData.map((sector) => {
                const SectorIcon = sector.icon;
                return (
                  <Card key={sector.sector} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <SectorIcon className="h-5 w-5 text-primary" />
                        {sector.displayName} Agents
                        <Badge variant="outline" className="ml-auto">
                          {sector.activeAgents} Active
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sector.agents.map((agent) => {
                          const isActive = userAgents?.some(ua => ua.agent_id === agent.id);
                          return (
                            <Card key={agent.id} className={`transition-all ${isActive ? 'ring-1 ring-primary' : ''}`}>
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                      <Bot className="h-4 w-4" />
                                      {agent.name}
                                    </CardTitle>
                                    <Badge variant={isActive ? "default" : "secondary"} className="mt-2">
                                      {isActive ? 'Active' : 'Available'}
                                    </Badge>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground">{agent.description}</p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* MCP Servers Tab */}
          <TabsContent value="mcp" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {servers.map((server) => (
                <Card key={server.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center gap-2">
                          <Server className="h-5 w-5 text-primary" />
                          {server.name}
                        </CardTitle>
                        <Badge variant={server.status === 'connected' ? "default" : "secondary"} className="mb-3">
                          {server.status}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {server.endpoint}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Resources:</span>
                        <span className="font-medium">{server.resources.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tools:</span>
                        <span className="font-medium">{server.tools.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {servers.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No MCP Servers</h3>
                  <p className="text-muted-foreground">
                    Add MCP servers to extend agent capabilities
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* A2A Workflows Tab */}
          <TabsContent value="a2a" className="space-y-6">
            <div className="grid gap-6">
              {/* Workflows */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-primary" />
                    Agent-to-Agent Workflows
                    <Badge variant="outline" className="ml-auto">
                      {workflows.filter(w => w.is_active).length} Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {workflows.map((workflow) => (
                      <Card key={workflow.id} className="border-border/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{workflow.name}</CardTitle>
                            <Badge variant={workflow.is_active ? "default" : "secondary"}>
                              {workflow.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <CardDescription>{workflow.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {workflow.agent_ids.length} agents involved
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {workflows.length === 0 && (
                      <div className="text-center py-8">
                        <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No A2A Workflows</h3>
                        <p className="text-muted-foreground">
                          Create workflows to automate agent interactions
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Recent A2A Messages
                    <Badge variant="outline" className="ml-auto">
                      {messages.length} Total
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {messages.slice(0, 5).map((message) => (
                      <div key={message.id} className="p-3 rounded-lg border border-border/50 bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Bot className="h-4 w-4" />
                            <span className="font-medium">Agent Communication</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {message.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No A2A Messages</h3>
                        <p className="text-muted-foreground">
                          Agent communications will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect {selectedService?.displayName}</DialogTitle>
              <DialogDescription>
                Enter your API credentials to connect {selectedService?.displayName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedService?.configFields.map((field: string) => (
                <div key={field}>
                  <Label htmlFor={field} className="capitalize">
                    {field.replace('_', ' ')}
                  </Label>
                  <Input
                    id={field}
                    type={field.includes('secret') || field.includes('key') ? 'password' : 'text'}
                    value={configData[field] || ''}
                    onChange={(e) => setConfigData(prev => ({ ...prev, [field]: e.target.value }))}
                    placeholder={`Enter your ${field.replace('_', ' ')}`}
                  />
                </div>
              ))}
              <Button onClick={handleCreateIntegration} className="w-full">
                Connect Integration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}