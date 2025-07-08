import { useState } from 'react';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Trash2, TrendingUp, BookOpen, Building, ExternalLink } from 'lucide-react';
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
  const { integrations, loading, createIntegration, updateIntegration, deleteIntegration } = useIntegrations();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [configData, setConfigData] = useState<Record<string, string>>({});

  const userIntegrations = availableIntegrations[profile?.role as keyof typeof availableIntegrations] || [];

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
          <p className="text-muted-foreground">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">External Integrations</h1>
          <p className="text-muted-foreground text-lg">
            Connect external services to enhance your AI agents' capabilities
          </p>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList>
            <TabsTrigger value="available">Available Integrations</TabsTrigger>
            <TabsTrigger value="configured">My Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-6">
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

          <TabsContent value="configured" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map((integration) => {
                const serviceInfo = userIntegrations.find(s => s.name === integration.service_name);
                const Icon = serviceInfo?.icon || ExternalLink;

                return (
                  <Card key={integration.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 flex items-center gap-2">
                            <Icon className="h-5 w-5 text-primary" />
                            {serviceInfo?.displayName || integration.service_name}
                          </CardTitle>
                          <Badge variant={integration.active ? "default" : "secondary"} className="mb-3">
                            {integration.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <Switch
                          checked={integration.active}
                          onCheckedChange={(checked) => handleToggleIntegration(integration.service_name, checked)}
                        />
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        Connected on {new Date(integration.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <Button
                        onClick={() => handleDeleteIntegration(integration.service_name, serviceInfo?.displayName || integration.service_name)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {integrations.length === 0 && (
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Integrations Connected</h3>
                <p className="text-muted-foreground">
                  Connect external services to enhance your AI agents
                </p>
              </div>
            )}
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