import { useState } from 'react';
import { useWorkflows } from '@/hooks/useWorkflows';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Play, Plus, Settings, Trash2, Calendar, Zap, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Workflows() {
  const { workflows, loading, createWorkflow, updateWorkflow, deleteWorkflow, executeWorkflow } = useWorkflows();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const [newWorkflow, setNewWorkflow] = useState<{
    name: string;
    description: string;
    trigger_type: 'manual' | 'scheduled' | 'event';
    config: Record<string, any>;
    trigger_config: Record<string, any>;
    active: boolean;
  }>({
    name: '',
    description: '',
    trigger_type: 'manual',
    config: {},
    trigger_config: {},
    active: true,
  });

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workflow name",
        variant: "destructive",
      });
      return;
    }

    const { error } = await createWorkflow(newWorkflow);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create workflow",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Workflow created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewWorkflow({
        name: '',
        description: '',
        trigger_type: 'manual',
        config: {},
        trigger_config: {},
        active: true,
      });
    }
  };

  const handleExecuteWorkflow = async (id: string) => {
    setExecutingId(id);
    const { error } = await executeWorkflow(id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to execute workflow",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Workflow executed successfully",
      });
    }

    setExecutingId(null);
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    const { error } = await updateWorkflow(id, { active });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Workflow ${active ? 'activated' : 'deactivated'}`,
      });
    }
  };

  const handleDeleteWorkflow = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    const { error } = await deleteWorkflow(id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Workflow deleted successfully",
      });
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'manual':
        return <Play className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'event':
        return <Zap className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Workflows</h1>
            <p className="text-muted-foreground text-lg">
              Automate your AI agent interactions and create custom workflows
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workflow</DialogTitle>
                <DialogDescription>
                  Build custom automation workflows for your AI agents
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Workflow Name</Label>
                  <Input
                    id="name"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter workflow name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this workflow does"
                  />
                </div>
                <div>
                  <Label htmlFor="trigger-type">Trigger Type</Label>
                  <Select
                    value={newWorkflow.trigger_type}
                    onValueChange={(value: 'manual' | 'scheduled' | 'event') => 
                      setNewWorkflow(prev => ({ ...prev, trigger_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="event">Event-driven</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newWorkflow.active}
                    onCheckedChange={(checked) => setNewWorkflow(prev => ({ ...prev, active: checked }))}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                <Button onClick={handleCreateWorkflow} className="w-full">
                  Create Workflow
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      {getTriggerIcon(workflow.trigger_type)}
                      {workflow.name}
                    </CardTitle>
                    <Badge variant={workflow.active ? "default" : "secondary"} className="mb-3">
                      {workflow.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <Switch
                    checked={workflow.active}
                    onCheckedChange={(checked) => handleToggleActive(workflow.id, checked)}
                  />
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {workflow.description || 'No description provided'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExecuteWorkflow(workflow.id)}
                    disabled={!workflow.active || executingId === workflow.id}
                    className="flex-1"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {executingId === workflow.id ? 'Running...' : 'Execute'}
                  </Button>
                  <Button
                    onClick={() => handleDeleteWorkflow(workflow.id, workflow.name)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {workflows.length === 0 && (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Workflows Yet</h3>
            <p className="text-muted-foreground">
              Create your first workflow to automate AI agent interactions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}