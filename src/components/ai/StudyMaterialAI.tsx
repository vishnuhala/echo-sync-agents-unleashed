import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { BookOpen, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MOCK_TOPICS = [
  { 
    id: 1, 
    topic: 'Photosynthesis', 
    content: 'Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in chloroplasts and involves light-dependent and light-independent reactions. The overall equation is: 6CO2 + 6H2O + light → C6H12O6 + 6O2.' 
  },
  { 
    id: 2, 
    topic: 'World War II', 
    content: 'World War II (1939-1945) was a global conflict involving most nations. Key events include: invasion of Poland, Pearl Harbor, D-Day, and atomic bombings. Major powers: Allies (US, UK, USSR) vs Axis (Germany, Japan, Italy).' 
  },
  { 
    id: 3, 
    topic: 'Calculus Basics', 
    content: 'Calculus studies continuous change. Key concepts: derivatives (rate of change), integrals (accumulation). The fundamental theorem connects them. Applications include optimization, area under curves, and physics problems.' 
  },
];

export const StudyMaterialAI = () => {
  const { toast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState(MOCK_TOPICS[0]);
  const [contentType, setContentType] = useState<'flashcards' | 'quiz' | 'summary'>('flashcards');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMaterial = async () => {
    setIsGenerating(true);
    setGeneratedContent('');

    try {
      const response = await fetch(`https://rmhzvxqvfbhicvjetznl.supabase.co/functions/v1/ai-study-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: selectedTopic.topic,
          contentType,
          documentContent: selectedTopic.content,
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
        title: "Material Generated",
        description: `Created ${contentType} for ${selectedTopic.topic}`,
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
        <BookOpen className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Study Material Generator</h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MOCK_TOPICS.map((topic) => (
          <Button
            key={topic.id}
            variant={selectedTopic.id === topic.id ? "default" : "outline"}
            onClick={() => setSelectedTopic(topic)}
            className="text-sm"
          >
            {topic.topic}
          </Button>
        ))}
      </div>

      <Tabs value={contentType} onValueChange={(v) => setContentType(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">{selectedTopic.content}</p>
      </Card>

      <Button 
        onClick={generateMaterial} 
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          `Generate ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`
        )}
      </Button>

      {generatedContent && (
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Generated Material:</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {generatedContent}
          </div>
        </Card>
      )}
    </div>
  );
};
