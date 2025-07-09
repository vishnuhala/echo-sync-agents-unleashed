import { useAuth } from '@/hooks/useAuth';
import { useAgents } from '@/hooks/useAgents';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  GraduationCap, 
  Rocket, 
  Settings, 
  Bot, 
  FileText,
  MessageSquare,
  Zap,
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const { profile, signOut } = useAuth();
  const { agents, userAgents, loading: agentsLoading } = useAgents();
  const { documents, loading: documentsLoading } = useDocuments();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'trader':
        return <TrendingUp className="h-5 w-5" />;
      case 'student':
        return <GraduationCap className="h-5 w-5" />;
      case 'founder':
        return <Rocket className="h-5 w-5" />;
      default:
        return <Bot className="h-5 w-5" />;
    }
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'trader':
        return 'Stock Trader';
      case 'student':
        return 'Student';
      case 'founder':
        return 'Startup Founder';
      default:
        return 'Unknown Role';
    }
  };

  const getWelcomeMessage = (role?: string) => {
    switch (role) {
      case 'trader':
        return 'Your AI agents are ready to analyze markets and optimize your portfolio.';
      case 'student':
        return 'Your AI learning assistants are ready to help you study and succeed.';
      case 'founder':
        return 'Your AI business agents are ready to accelerate your startup growth.';
      default:
        return 'Welcome to your AI agent ecosystem.';
    }
  };

  const activeAgents = userAgents?.filter(ua => 
    agents.some(a => a.id === ua.agent_id && a.active)
  ).length || 0;
  const availableAgents = agents?.filter(a => a.role === profile?.role).length || 0;
  const totalDocuments = documents?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Header with Gradient */}
      <header className="border-b border-border/50 bg-gradient-card backdrop-blur-sm shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-primary shadow-glow">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  EchoSync
                </h1>
                <p className="text-xs text-muted-foreground">AI Agent Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gradient-card backdrop-blur-sm rounded-lg px-4 py-2 shadow-card border border-border/50">
                <div className="p-1.5 rounded-full bg-gradient-primary shadow-glow">
                  {getRoleIcon(profile?.role)}
                </div>
                <div className="text-right">
                  <span className="font-medium text-sm text-foreground">{profile?.full_name}</span>
                  <Badge variant="secondary" className="ml-2 text-xs bg-gradient-secondary text-white border-0">
                    {getRoleDisplayName(profile?.role)}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/settings')}
                className="hover:bg-accent/20 text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="hover:bg-destructive/20 text-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Role-Specific Styling */}
        <div className="mb-8 relative">
          <div className={`absolute inset-0 rounded-2xl blur-3xl opacity-20 ${
            profile?.role === 'trader' ? 'bg-gradient-business' :
            profile?.role === 'student' ? 'bg-gradient-student' :
            profile?.role === 'founder' ? 'bg-gradient-founder' :
            'bg-gradient-primary'
          }`} />
          <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-elegant border">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-4 rounded-xl ${
                profile?.role === 'trader' ? 'bg-gradient-business' :
                profile?.role === 'student' ? 'bg-gradient-student' :
                profile?.role === 'founder' ? 'bg-gradient-founder' :
                'bg-gradient-primary'
              }`}>
                {getRoleIcon(profile?.role)}
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Welcome back, {profile?.full_name?.split(' ')[0]}! 
                  {profile?.role === 'trader' && ' 📈'}
                  {profile?.role === 'student' && ' 🎓'}
                  {profile?.role === 'founder' && ' 🚀'}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {getWelcomeMessage(profile?.role)}
                </p>
              </div>
            </div>
            
            {/* Role-specific quick stats */}
            {profile?.role === 'trader' && (
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-success/10 rounded-lg p-3 border border-success/20">
                  <div className="text-success font-bold text-lg">+12.5%</div>
                  <div className="text-xs text-muted-foreground">Portfolio Growth</div>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                  <div className="text-primary font-bold text-lg">$25.4K</div>
                  <div className="text-xs text-muted-foreground">Active Positions</div>
                </div>
                <div className="bg-warning/10 rounded-lg p-3 border border-warning/20">
                  <div className="text-warning font-bold text-lg">8</div>
                  <div className="text-xs text-muted-foreground">Alerts Today</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-card to-card/50 shadow-card border-0 hover:shadow-elegant transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Bot className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAgents}</div>
              <p className="text-xs text-muted-foreground">
                {activeAgents} of {availableAgents} activated
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-card/50 shadow-card border-0 hover:shadow-elegant transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-primary">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocuments}</div>
              <p className="text-xs text-muted-foreground">
                Files uploaded for analysis
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-card/50 shadow-card border-0 hover:shadow-elegant transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-primary">
                {getRoleIcon(profile?.role)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.full_name?.split(' ')[0] || 'User'}</div>
              <p className="text-xs text-muted-foreground capitalize">
                {getRoleDisplayName(profile?.role)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-success/10 to-success/5 shadow-card border-success/20 hover:shadow-elegant transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <div className="p-2 rounded-lg bg-success">
                <Settings className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">Active</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions with Beautiful Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group bg-gradient-to-br from-card to-primary/5 shadow-card border-0 hover:shadow-glow transition-all duration-500 cursor-pointer transform hover:-translate-y-1" onClick={() => navigate('/agents')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-primary group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold">AI Agents</div>
                  <div className="text-xs text-muted-foreground">Intelligent Assistants</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available:</span>
                  <span className="font-medium">{availableAgents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active:</span>
                  <span className="font-medium text-success">{activeAgents}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 group-hover:bg-primary group-hover:text-white transition-colors">
                  Explore Agents →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-card to-primary/5 shadow-card border-0 hover:shadow-glow transition-all duration-500 cursor-pointer transform hover:-translate-y-1" onClick={() => navigate('/documents')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-primary group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold">Documents</div>
                  <div className="text-xs text-muted-foreground">AI Analysis Ready</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span className="font-medium">{totalDocuments}</span>
                </div>
                <div className="text-xs text-muted-foreground">PDF, DOC, TXT supported</div>
                <Button variant="outline" size="sm" className="w-full mt-3 group-hover:bg-primary group-hover:text-white transition-colors">
                  Manage Files →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-card to-primary/5 shadow-card border-0 hover:shadow-glow transition-all duration-500 cursor-pointer transform hover:-translate-y-1" onClick={() => navigate('/workflows')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-primary group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold">Workflows</div>
                  <div className="text-xs text-muted-foreground">Smart Automation</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Create powerful automation workflows</div>
                <div className="text-xs text-muted-foreground">Schedule & trigger agents</div>
                <Button variant="outline" size="sm" className="w-full mt-3 group-hover:bg-primary group-hover:text-white transition-colors">
                  Create Workflow →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-card to-primary/5 shadow-card border-0 hover:shadow-glow transition-all duration-500 cursor-pointer transform hover:-translate-y-1" onClick={() => navigate('/analytics')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-primary group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold">Analytics</div>
                  <div className="text-xs text-muted-foreground">Performance Insights</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Track agent performance</div>
                <div className="text-xs text-muted-foreground">Usage patterns & trends</div>
                <Button variant="outline" size="sm" className="w-full mt-3 group-hover:bg-primary group-hover:text-white transition-colors">
                  View Metrics →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started - For users with no active agents */}
        {activeAgents === 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Set up your AI agents to start automating your workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => navigate('/agents')}
                >
                  <div className="text-left">
                    <div className="font-medium">Activate Agents</div>
                    <div className="text-sm text-muted-foreground">
                      Choose specialized AI agents
                    </div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => navigate('/documents')}
                >
                  <div className="text-left">
                    <div className="font-medium">Upload Documents</div>
                    <div className="text-sm text-muted-foreground">
                      Add files for AI analysis
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => navigate('/workflows')}
                >
                  <div className="text-left">
                    <div className="font-medium">Create Workflows</div>
                    <div className="text-sm text-muted-foreground">
                      Automate agent tasks
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => navigate('/integrations')}
                >
                  <div className="text-left">
                    <div className="font-medium">Connect Services</div>
                    <div className="text-sm text-muted-foreground">
                      External integrations
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;