import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  GraduationCap, 
  Rocket, 
  Settings, 
  Bot, 
  Activity,
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const { profile, signOut } = useAuth();

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No agents activated yet
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Ready to start working
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workflows</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Create your first workflow
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Set up your AI agents to start automating your workflows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Activate Your First Agent</div>
                  <div className="text-sm text-muted-foreground">
                    Choose from specialized agents for your role
                  </div>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Connect External Services</div>
                  <div className="text-sm text-muted-foreground">
                    Integrate with your existing tools and platforms
                  </div>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Create a Workflow</div>
                  <div className="text-sm text-muted-foreground">
                    Automate tasks with custom workflows
                  </div>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-sm text-muted-foreground">
                    Track your agents' performance and insights
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle>Phase 2: Agent Marketplace</CardTitle>
            <CardDescription>
              Your specialized AI agents will be available here soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Agent ecosystem coming soon!</p>
              <p className="text-muted-foreground">
                We're building specialized AI agents for {getRoleDisplayName(profile?.role).toLowerCase()}s
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;