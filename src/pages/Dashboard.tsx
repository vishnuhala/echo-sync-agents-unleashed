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

  const activeAgents = userAgents?.length || 0;
  const availableAgents = agents?.filter(a => a.role === profile?.role).length || 0;
  const totalDocuments = documents?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold">EchoSync</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getRoleIcon(profile?.role)}
                <span className="font-medium">{profile?.full_name}</span>
                <Badge variant="secondary">
                  {getRoleDisplayName(profile?.role)}
                </Badge>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0]}!
          </h2>
          <p className="text-lg text-muted-foreground">
            {getWelcomeMessage(profile?.role)}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAgents}</div>
              <p className="text-xs text-muted-foreground">
                {activeAgents} of {availableAgents} activated
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocuments}</div>
              <p className="text-xs text-muted-foreground">
                Files uploaded for analysis
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              {getRoleIcon(profile?.role)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.full_name?.split(' ')[0] || 'User'}</div>
              <p className="text-xs text-muted-foreground capitalize">
                {getRoleDisplayName(profile?.role)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/agents')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                AI Agents
              </CardTitle>
              <CardDescription>
                Discover and activate AI agents for your role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {availableAgents} agents available
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeAgents} currently active
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Explore
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/documents')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Documents
              </CardTitle>
              <CardDescription>
                Upload and manage your documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {totalDocuments} documents uploaded
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, TXT supported
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/workflows')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Workflows
              </CardTitle>
              <CardDescription>
                Automate agent interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Automation workflows
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Schedule & trigger agents
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/analytics')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Analytics
              </CardTitle>
              <CardDescription>
                Track performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Performance insights
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Usage patterns & trends
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View
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