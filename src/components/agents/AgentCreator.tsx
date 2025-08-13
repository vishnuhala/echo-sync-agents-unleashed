import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAgents } from '@/hooks/useAgents';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  Plus, 
  Code, 
  Brain, 
  Settings,
  Database,
  Zap,
  Save,
  TestTube
} from 'lucide-react';

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  framework: 'langchain' | 'adk' | 'custom';
  capabilities: string[];
  ragEnabled: boolean;
}

interface NewAgent {
  name: string;
  description: string;
  framework: 'langchain' | 'adk' | 'custom';
  role: string;
  capabilities: string[];
  ragEnabled: boolean;
  tools: string[];
  systemPrompt: string;
  model: string;
  temperature: number;
}

export const AgentCreator = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates');
  const [newAgent, setNewAgent] = useState<NewAgent>({
    name: '',
    description: '',
    framework: 'langchain',
    role: 'assistant',
    capabilities: [],
    ragEnabled: false,
    tools: [],
    systemPrompt: '',
    model: 'gpt-4o-mini',
    temperature: 0.7
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { refreshAgents } = useAgents();
  const templates: AgentTemplate[] = [
    {
      id: '1',
      name: 'Document Analyst',
      description: 'Specialized in document processing and analysis with RAG capabilities',
      framework: 'langchain',
      capabilities: ['document_processing', 'text_analysis', 'summarization'],
      ragEnabled: true
    },
    {
      id: '2',
      name: 'Code Assistant',
      description: 'Programming and code review assistant with ADK framework',
      framework: 'adk',
      capabilities: ['code_generation', 'debugging', 'optimization'],
      ragEnabled: false
    },
    {
      id: '3',
      name: 'Research Agent',
      description: 'Advanced research and data gathering agent with LlamaIndex integration',
      framework: 'custom',
      capabilities: ['web_search', 'data_analysis', 'report_generation'],
      ragEnabled: true
    }
  ];

  const availableCapabilities = [
    'document_processing',
    'text_analysis',
    'code_generation',
    'web_search',
    'data_analysis',
    'summarization',
    'translation',
    'image_analysis',
    'audio_processing',
    'scheduling',
    'email_automation',
    'database_queries'
  ];

  const availableTools = [
    'web_scraper',
    'pdf_reader',
    'image_processor',
    'calculator',
    'calendar',
    'email_client',
    'database_connector',
    'file_manager',
    'api_client',
    'code_executor'
  ];

  const createFromTemplate = async (template: AgentTemplate) => {
    setIsCreating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create agent in database
      const { data, error } = await supabase.functions.invoke('create-agent', {
        body: {
          name: template.name,
          description: template.description,
          framework: template.framework,
          role: profile?.role ?? 'student',
          capabilities: template.capabilities,
          ragEnabled: template.ragEnabled,
          userId: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Agent Created Successfully!",
        description: `${template.name} is now active and ready to chat`,
      });

      const createdAgent = (data as any)?.agent;
      await refreshAgents();
      
      // Navigate to chat with the newly created agent
      if (createdAgent?.id) {
        navigate(`/chat?agent=${createdAgent.id}`);
      } else {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const createCustomAgent = async () => {
    if (!newAgent.name.trim() || !newAgent.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide agent name and description",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create custom agent in database
      const { data, error } = await supabase.functions.invoke('create-agent', {
        body: {
          name: newAgent.name,
          description: newAgent.description,
          framework: newAgent.framework,
          role: profile?.role ?? 'student',
          capabilities: newAgent.capabilities,
          ragEnabled: newAgent.ragEnabled,
          tools: newAgent.tools,
          systemPrompt: newAgent.systemPrompt,
          model: newAgent.model,
          temperature: newAgent.temperature,
          userId: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Custom Agent Created Successfully!",
        description: `${newAgent.name} is now active and ready to chat`,
      });

      const createdAgent = (data as any)?.agent;
      await refreshAgents();
      
      // Navigate to chat with the newly created agent
      if (createdAgent?.id) {
        navigate(`/chat?agent=${createdAgent.id}`);
      } else {
        navigate('/chat');
      }
      
      // Reset form
      setNewAgent({
        name: '',
        description: '',
        framework: 'langchain',
        role: 'assistant',
        capabilities: [],
        ragEnabled: false,
        tools: [],
        systemPrompt: '',
        model: 'gpt-4o-mini',
        temperature: 0.7
      });
    } catch (error) {
      console.error('Error creating custom agent:', error);
      toast({
        title: "Error",
        description: "Failed to create custom agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleCapability = (capability: string) => {
    setNewAgent(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }));
  };

  const toggleTool = (tool: string) => {
    setNewAgent(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  const getFrameworkIcon = (framework: string) => {
    switch (framework) {
      case 'langchain': return <Brain className="h-4 w-4" />;
      case 'adk': return <Code className="h-4 w-4" />;
      case 'custom': return <Settings className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'langchain': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'adk': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'custom': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Agent Creator</h2>
        <p className="text-muted-foreground">Create new AI agents using LangChain, ADK, or custom frameworks</p>
      </div>

      {/* Tab Selection */}
      <div className="flex space-x-1 rounded-lg bg-muted p-1">
        <Button
          variant={activeTab === 'templates' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('templates')}
          className={activeTab === 'templates' ? 'bg-gradient-primary text-white' : ''}
        >
          Templates
        </Button>
        <Button
          variant={activeTab === 'custom' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('custom')}
          className={activeTab === 'custom' ? 'bg-gradient-primary text-white' : ''}
        >
          Custom Agent
        </Button>
      </div>

      {activeTab === 'templates' && (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="bg-gradient-card border-primary/10 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-primary">
                      {getFrameworkIcon(template.framework)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline" className={getFrameworkColor(template.framework)}>
                        {template.framework.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  {template.ragEnabled && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      <Database className="h-3 w-3 mr-1" />
                      RAG
                    </Badge>
                  )}
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Capabilities</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.capabilities.map((capability) => (
                      <Badge key={capability} variant="secondary" className="text-xs">
                        {capability.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => createFromTemplate(template)}
                  disabled={isCreating}
                  className="w-full bg-gradient-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreating ? 'Creating...' : 'Create Agent'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'custom' && (
        <Card className="bg-gradient-card border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Custom Agent Configuration
            </CardTitle>
            <CardDescription>Build your own AI agent with custom settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  placeholder="Enter agent name"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-role">Role</Label>
                <Select value={newAgent.role} onValueChange={(value) => setNewAgent(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assistant">Assistant</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="researcher">Researcher</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="specialist">Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent-description">Description</Label>
              <Textarea
                id="agent-description"
                placeholder="Describe what this agent does"
                value={newAgent.description}
                onChange={(e) => setNewAgent(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Framework Selection */}
            <div className="space-y-2">
              <Label>Framework</Label>
              <div className="grid grid-cols-3 gap-2">
                {['langchain', 'adk', 'custom'].map((framework) => (
                  <Button
                    key={framework}
                    variant={newAgent.framework === framework ? 'default' : 'outline'}
                    onClick={() => setNewAgent(prev => ({ ...prev, framework: framework as any }))}
                    className={newAgent.framework === framework ? 'bg-gradient-primary' : ''}
                  >
                    {getFrameworkIcon(framework)}
                    <span className="ml-2 capitalize">{framework}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* RAG Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="rag-enabled"
                checked={newAgent.ragEnabled}
                onCheckedChange={(checked) => setNewAgent(prev => ({ ...prev, ragEnabled: checked }))}
              />
              <Label htmlFor="rag-enabled" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Enable RAG (Retrieval-Augmented Generation)
              </Label>
            </div>

            {/* Capabilities */}
            <div className="space-y-2">
              <Label>Capabilities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {availableCapabilities.map((capability) => (
                  <Button
                    key={capability}
                    variant={newAgent.capabilities.includes(capability) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleCapability(capability)}
                    className={newAgent.capabilities.includes(capability) ? 'bg-gradient-primary' : ''}
                  >
                    {capability.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="space-y-2">
              <Label>Tools</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {availableTools.map((tool) => (
                  <Button
                    key={tool}
                    variant={newAgent.tools.includes(tool) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTool(tool)}
                    className={newAgent.tools.includes(tool) ? 'bg-gradient-primary' : ''}
                  >
                    {tool.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select value={newAgent.model} onValueChange={(value) => setNewAgent(prev => ({ ...prev, model: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    <SelectItem value="llama-3.1">Llama 3.1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature: {newAgent.temperature}</Label>
                <input
                  type="range"
                  id="temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newAgent.temperature}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>

            {/* System Prompt */}
            <div className="space-y-2">
              <Label htmlFor="system-prompt">System Prompt</Label>
              <Textarea
                id="system-prompt"
                placeholder="Enter system prompt for the agent"
                value={newAgent.systemPrompt}
                onChange={(e) => setNewAgent(prev => ({ ...prev, systemPrompt: e.target.value }))}
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={createCustomAgent}
                disabled={isCreating}
                className="bg-gradient-primary flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isCreating ? 'Creating...' : 'Create Agent'}
              </Button>
              <Button
                variant="outline"
                disabled={isCreating}
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};