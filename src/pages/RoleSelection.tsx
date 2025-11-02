import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/types/database';
import { TrendingUp, GraduationCap, Rocket, CheckCircle } from 'lucide-react';

const roleData = {
  trader: {
    title: 'Stock Trader',
    description: 'AI agents for market analysis, portfolio management, and trading insights',
    icon: TrendingUp,
    features: [
      'Market Sentiment Analysis',
      'Portfolio Risk Assessment',
      'Trade Recommendations',
      'Real-time Market Alerts',
    ],
  },
  student: {
    title: 'Student',
    description: 'AI agents for learning, note-taking, and academic success',
    icon: GraduationCap,
    features: [
      'Note Summarization',
      'Quiz Generation',
      'Study Planning',
      'Doubt Resolution',
    ],
  },
  founder: {
    title: 'Startup Founder',
    description: 'AI agents for business management, CRM, and growth strategies',
    icon: Rocket,
    features: [
      'CRM Management',
      'Email Assistance',
      'Meeting Planning',
      'Competitor Analysis',
    ],
  },
};

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const { updateProfile, profile, user } = useAuth();
  const navigate = useNavigate();

  // Ensure session is ready before allowing role selection
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsSessionReady(true);
      } else {
        // Redirect to auth if no session
        navigate('/auth');
      }
    };
    checkSession();
  }, [navigate]);

  const handleRoleSelect = async () => {
    if (!selectedRole || !isSessionReady) return;

    setIsLoading(true);
    try {
      // Get fresh session before making the API call
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: "Session Error",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Call the secure edge function to assign role
      let { data, error } = await supabase.functions.invoke('select-initial-role', {
        body: { role: selectedRole }
      });

      // If unauthorized, try to refresh the session once and retry
      if (error && (error.message?.includes('Unauthorized') || (error as any)?.context?.response?.status === 401)) {
        await supabase.auth.refreshSession();
        const retry = await supabase.functions.invoke('select-initial-role', {
          body: { role: selectedRole }
        });
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error('Role selection error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to assign role. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Role Selected!",
          description: `Welcome to EchoSync as a ${roleData[selectedRole].title}`,
        });
        // Refresh the profile to get the updated role
        await updateProfile({ onboarding_completed: true });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please refresh and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Choose Your Role</h1>
          <p className="text-xl text-muted-foreground">
            Select your primary role to get personalized AI agents tailored to your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {Object.entries(roleData).map(([role, data]) => {
            const Icon = data.icon;
            const isSelected = selectedRole === role;
            
            return (
              <Card
                key={role}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-primary shadow-lg scale-105'
                    : 'hover:shadow-md hover:scale-102'
                }`}
                onClick={() => setSelectedRole(role as UserRole)}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className={`p-3 rounded-full ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                    }`}>
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{data.title}</CardTitle>
                  <CardDescription>{data.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {data.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            onClick={handleRoleSelect}
            disabled={!selectedRole || isLoading || !isSessionReady}
            size="lg"
            className="px-8"
          >
            {isLoading ? 'Setting up your workspace...' : !isSessionReady ? 'Loading...' : 'Continue to Dashboard'}
          </Button>
          {selectedRole && isSessionReady && (
            <p className="text-sm text-muted-foreground mt-2">
              You can change your role later in settings
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;