import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Megaphone, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MOCK_BUSINESSES = [
  { 
    id: 1,
    name: 'TechStart Inc',
    industry: 'SaaS',
    topic: 'AI automation tools',
    goal: 'Increase trial signups',
    audience: 'Small business owners aged 30-45'
  },
  { 
    id: 2,
    name: 'EcoWear',
    industry: 'E-commerce',
    topic: 'Sustainable fashion',
    goal: 'Drive product sales',
    audience: 'Environmentally conscious millennials'
  },
  { 
    id: 3,
    name: 'FitLife App',
    industry: 'Health & Fitness',
    topic: 'Home workout programs',
    goal: 'Boost app downloads',
    audience: 'Busy professionals aged 25-40'
  },
];

export const ContentMarketingAI = () => {
  const { toast } = useToast();
  const [selectedBusiness, setSelectedBusiness] = useState(MOCK_BUSINESSES[0]);
  const [contentType, setContentType] = useState<'blog' | 'social' | 'email'>('blog');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContent = async () => {
    setIsGenerating(true);
    setGeneratedContent('');

    try {
      const response = await fetch(`https://rmhzvxqvfbhicvjetznl.supabase.co/functions/v1/ai-content-marketing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType,
          businessInfo: selectedBusiness,
          targetAudience: selectedBusiness.audience,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                setGeneratedContent(prev => prev + content);
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }

      toast({
        title: "Content Generated",
        description: `Created ${contentType} for ${selectedBusiness.name}`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Content Marketing</h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MOCK_BUSINESSES.map((business) => (
          <Button
            key={business.id}
            variant={selectedBusiness.id === business.id ? "default" : "outline"}
            onClick={() => setSelectedBusiness(business)}
            className="text-sm"
          >
            {business.name}
          </Button>
        ))}
      </div>

      <Tabs value={contentType} onValueChange={(v) => setContentType(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="blog">Blog Post</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="email">Email Campaign</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="p-4 bg-muted/50">
        <div className="space-y-1 text-sm">
          <div><span className="font-semibold">Industry:</span> {selectedBusiness.industry}</div>
          <div><span className="font-semibold">Audience:</span> {selectedBusiness.audience}</div>
          <div><span className="font-semibold">Goal:</span> {selectedBusiness.goal}</div>
        </div>
      </Card>

      <Button 
        onClick={generateContent} 
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          `Generate ${contentType === 'blog' ? 'Blog Post' : contentType === 'social' ? 'Social Posts' : 'Email'}`
        )}
      </Button>

      {generatedContent && (
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Generated Content:</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {generatedContent}
          </div>
        </Card>
      )}
    </div>
  );
};
