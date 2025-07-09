import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Key
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Settings() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
    security: true
  });
  const [profileData, setProfileData] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    role: profile?.role || ''
  });
  const [supportMessage, setSupportMessage] = useState('');

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSupportSubmit = () => {
    if (!supportMessage.trim()) return;
    
    toast({
      title: "Support Request Sent",
      description: "Your message has been sent to our support team. We'll get back to you within 24 hours.",
    });
    setSupportMessage('');
  };

  const handleDeleteAccount = async () => {
    // In a real app, this would be handled server-side
    toast({
      title: "Account Deletion Request",
      description: "Your account deletion request has been submitted. You'll receive an email with further instructions.",
      variant: "destructive",
    });
  };

  const downloadData = () => {
    // In a real app, this would generate and download user data
    toast({
      title: "Data Export",
      description: "Your data export has been started. You'll receive an email when it's ready for download.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Support
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      Email cannot be changed. Contact support for assistance.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {profileData.role}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Role determines available AI agents and features
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-semibold">API Access</h4>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value="sk-1234567890abcdef"
                        disabled
                        className="bg-muted font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="icon">
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Use this API key to integrate with external applications
                    </p>
                  </div>
                </div>

                <Button onClick={handleProfileUpdate} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, email: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, push: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about new features and offers
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, marketing: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Important security notifications (recommended)
                      </p>
                    </div>
                    <Switch
                      checked={notifications.security}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, security: checked }))
                      }
                    />
                  </div>
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Security */}
          <TabsContent value="privacy">
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Manage your privacy settings and account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline">Setup 2FA</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">Download Your Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Get a copy of all your data
                      </p>
                    </div>
                    <Button variant="outline" onClick={downloadData}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/50">
                    <div className="space-y-1">
                      <h4 className="font-medium text-destructive">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance">
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <Button variant="outline" className="h-20 flex-col gap-2">
                        <div className="w-6 h-6 rounded bg-background border"></div>
                        Light
                      </Button>
                      <Button variant="outline" className="h-20 flex-col gap-2 bg-primary/5">
                        <div className="w-6 h-6 rounded bg-primary"></div>
                        Dark
                      </Button>
                      <Button variant="outline" className="h-20 flex-col gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-r from-primary to-secondary"></div>
                        Auto
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="justify-start bg-primary/5">
                        🇺🇸 English
                      </Button>
                      <Button variant="outline" className="justify-start">
                        🇪🇸 Spanish
                      </Button>
                      <Button variant="outline" className="justify-start">
                        🇫🇷 French
                      </Button>
                      <Button variant="outline" className="justify-start">
                        🇩🇪 German
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">UTC-5 (Eastern Time)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customer Support */}
          <TabsContent value="support">
            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Contact Support
                  </CardTitle>
                  <CardDescription>
                    Get help from our customer support team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="supportMessage">Describe your issue</Label>
                    <Textarea
                      id="supportMessage"
                      placeholder="Please describe your issue or question in detail..."
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <Button onClick={handleSupportSubmit} disabled={!supportMessage.trim()}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-primary/20">
                <CardHeader>
                  <CardTitle>Other Ways to Reach Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">Email Support</h4>
                        <p className="text-sm text-muted-foreground">support@yourapp.com</p>
                        <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">Phone Support</h4>
                        <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                        <p className="text-xs text-muted-foreground">Mon-Fri, 9AM-6PM EST</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Frequently Asked Questions</h4>
                    <div className="space-y-2">
                      <details className="p-3 border rounded">
                        <summary className="cursor-pointer font-medium">How do I activate more agents?</summary>
                        <p className="text-sm text-muted-foreground mt-2">
                          You can activate up to 5 agents per role. Go to the Agents page and click "Activate" on any available agent.
                        </p>
                      </details>
                      
                      <details className="p-3 border rounded">
                        <summary className="cursor-pointer font-medium">How does document analysis work?</summary>
                        <p className="text-sm text-muted-foreground mt-2">
                          Upload your document, wait for processing, then click "View Analysis" to see AI-powered insights.
                        </p>
                      </details>
                      
                      <details className="p-3 border rounded">
                        <summary className="cursor-pointer font-medium">Can I change my account role?</summary>
                        <p className="text-sm text-muted-foreground mt-2">
                          Account roles determine available features and agents. Contact support to discuss role changes.
                        </p>
                      </details>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}