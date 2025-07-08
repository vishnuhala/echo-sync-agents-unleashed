import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Bot, ArrowRight, Zap, Shield, Cpu } from 'lucide-react';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (!profile?.role || !profile?.onboarding_completed) {
        navigate('/role-selection');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Bot className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading EchoSync...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 rounded-full bg-primary/10 backdrop-blur-sm">
                <Bot className="h-16 w-16 text-primary" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              EchoSync
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              Your Autonomous Agent Ecosystem
            </p>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Intelligent AI agents that act like a virtual team, autonomously managing workflows, 
              decision-making, and task execution for Stock Traders, Students, and Startup Founders.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="px-8 py-6 text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-6 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose EchoSync?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI agents don't just assist—they think, learn, and act autonomously 
              to deliver results tailored to your role.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Autonomous Execution</h3>
              <p className="text-muted-foreground">
                Agents work independently, making decisions and executing tasks 
                without constant supervision.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Role-Specific Intelligence</h3>
              <p className="text-muted-foreground">
                Specialized agents trained for Stock Trading, Academic Success, 
                and Startup Growth scenarios.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                <Cpu className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Scalable Ecosystem</h3>
              <p className="text-muted-foreground">
                From individual workflows to complex multi-agent orchestration, 
                scale as your needs grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-card/50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your Agent Team?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join the future of autonomous productivity. Start with our 
            specialized agents and scale to a complete AI ecosystem.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="px-8 py-6 text-lg"
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
