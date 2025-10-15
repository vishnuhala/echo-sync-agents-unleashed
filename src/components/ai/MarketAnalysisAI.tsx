import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { TrendingUp, Loader2 } from 'lucide-react';

const MOCK_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.45, volume: '52.3M', marketCap: '$2.8T', news: 'Strong iPhone sales in Q4', sentiment: 0.75 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.84, volume: '98.2M', marketCap: '$768B', news: 'New Gigafactory announced', sentiment: 0.82 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, volume: '31.5M', marketCap: '$1.8T', news: 'AI advancements in search', sentiment: 0.68 },
];

export const MarketAnalysisAI = () => {
  const { toast } = useToast();
  const [selectedStock, setSelectedStock] = useState(MOCK_STOCKS[0]);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeStock = async () => {
    setIsAnalyzing(true);
    setAnalysis('');

    try {
      const response = await fetch(`https://rmhzvxqvfbhicvjetznl.supabase.co/functions/v1/ai-market-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          marketData: selectedStock,
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');

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
                setAnalysis(prev => prev + content);
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }

      toast({
        title: "Analysis Complete",
        description: `Generated analysis for ${selectedStock.symbol}`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Market Analysis</h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MOCK_STOCKS.map((stock) => (
          <Button
            key={stock.symbol}
            variant={selectedStock.symbol === stock.symbol ? "default" : "outline"}
            onClick={() => setSelectedStock(stock)}
            className="text-sm"
          >
            {stock.symbol}
          </Button>
        ))}
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-semibold">${selectedStock.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Volume:</span>
            <span>{selectedStock.volume}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Market Cap:</span>
            <span>{selectedStock.marketCap}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sentiment:</span>
            <span className="text-green-500">{(selectedStock.sentiment * 100).toFixed(0)}% Positive</span>
          </div>
        </div>
      </Card>

      <Button 
        onClick={analyzeStock} 
        disabled={isAnalyzing}
        className="w-full"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          'Generate AI Analysis'
        )}
      </Button>

      {analysis && (
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Analysis Results:</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {analysis}
          </div>
        </Card>
      )}
    </div>
  );
};
