import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/types/database';
import { TrendingUp, GraduationCap, Rocket, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const { refreshProfile, profile } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('assign-role', {
        body: { role: selectedRole }
      });

      if (error) {
        console.error('Error assigning role:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to assign your role. Please try again.",
          variant: "destructive",
        });
      } else if (data?.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      } else {
        // Refresh profile to get updated data
        await refreshProfile();
        
        toast({
          title: "Role Selected!",
          description: `Welcome to EchoSync as a ${roleData[selectedRole].title}`,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
            disabled={!selectedRole || isLoading}
            size="lg"
            className="px-8"
          >
            {isLoading ? 'Setting up your workspace...' : 'Continue to Dashboard'}
          </Button>
          {selectedRole && (
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