import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useDocuments } from '@/hooks/useDocuments';
import { 
  Database, 
  Upload, 
  Search, 
  FileText, 
  Brain,
  Zap,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Download,
  Plus
} from 'lucide-react';

interface VectorIndex {
  id: string;
  name: string;
  description: string;
  documentsCount: number;
  vectorsCount: number;
  status: 'building' | 'ready' | 'error';
  lastUpdated: Date;
  embeddingModel: string;
}

interface RAGQuery {
  id: string;
  query: string;
  results: Array<{
    content: string;
    source: string;
    score: number;
  }>;
  timestamp: Date;
}

export const RAGSystem = () => {
  const { documents } = useDocuments();
  const [vectorIndexes, setVectorIndexes] = useState<VectorIndex[]>([
    {
      id: '1',
      name: 'General Knowledge Base',
      description: 'Main document collection for general queries',
      documentsCount: 15,
      vectorsCount: 1250,
      status: 'ready',
      lastUpdated: new Date(),
      embeddingModel: 'text-embedding-3-small'
    },
    {
      id: '2',
      name: 'Technical Documentation',
      description: 'Technical specs and API documentation',
      documentsCount: 8,
      vectorsCount: 640,
      status: 'building',
      lastUpdated: new Date(),
      embeddingModel: 'text-embedding-3-large'
    }
  ]);
  const [queryHistory, setQueryHistory] = useState<RAGQuery[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState('1');
  const [isQuerying, setIsQuerying] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate building progress
    const buildingIndex = vectorIndexes.find(idx => idx.status === 'building');
    if (buildingIndex && buildProgress < 100) {
      const timer = setTimeout(() => {
        setBuildProgress(prev => Math.min(prev + 10, 100));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (buildProgress === 100) {
      setVectorIndexes(prev => prev.map(idx => 
        idx.status === 'building' ? { ...idx, status: 'ready' } : idx
      ));
    }
  }, [buildProgress, vectorIndexes]);

  const performRAGQuery = async () => {
    if (!currentQuery.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setIsQuerying(true);

    // Simulate RAG query
    setTimeout(() => {
      const mockResults = [
        {
          content: "This is a relevant excerpt from the document that matches your query about AI agents and their capabilities.",
          source: "AI_Agents_Guide.pdf",
          score: 0.95
        },
        {
          content: "Another relevant section discussing the implementation of multi-agent systems and their communication protocols.",
          source: "Multi_Agent_Systems.pdf", 
          score: 0.87
        },
        {
          content: "Additional context about agent frameworks and their integration with various tools and APIs.",
          source: "Agent_Framework_Docs.pdf",
          score: 0.82
        }
      ];

      const newQuery: RAGQuery = {
        id: Date.now().toString(),
        query: currentQuery,
        results: mockResults,
        timestamp: new Date()
      };

      setQueryHistory(prev => [newQuery, ...prev]);
      setCurrentQuery('');
      setIsQuerying(false);

      toast({
        title: "Query Complete",
        description: `Found ${mockResults.length} relevant results`,
      });
    }, 2000);
  };

  const rebuildIndex = async (indexId: string) => {
    setVectorIndexes(prev => prev.map(idx => 
      idx.id === indexId 
        ? { ...idx, status: 'building', lastUpdated: new Date() }
        : idx
    ));
    setBuildProgress(0);

    toast({
      title: "Rebuilding Index",
      description: "Vector index rebuild started",
    });
  };

  const createNewIndex = () => {
    const newIndex: VectorIndex = {
      id: Date.now().toString(),
      name: `Index ${vectorIndexes.length + 1}`,
      description: 'New vector index',
      documentsCount: 0,
      vectorsCount: 0,
      status: 'building',
      lastUpdated: new Date(),
      embeddingModel: 'text-embedding-3-small'
    };

    setVectorIndexes(prev => [...prev, newIndex]);
    setBuildProgress(0);

    toast({
      title: "Index Created",
      description: "New vector index is being built",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'building': return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-success/10 text-success border-success/20';
      case 'building': return 'bg-primary/10 text-primary border-primary/20';
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">RAG System (LlamaIndex)</h2>
          <p className="text-muted-foreground">Retrieval-Augmented Generation with vector search</p>
        </div>
        <Button onClick={createNewIndex} className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Index
        </Button>
      </div>

      {/* RAG Query Interface */}
      <Card className="bg-gradient-card border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            RAG Query Interface
          </CardTitle>
          <CardDescription>Search through your document knowledge base</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Enter your query to search through documents..."
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <Button 
              onClick={performRAGQuery}
              disabled={isQuerying || !currentQuery.trim()}
              className="bg-gradient-primary self-end"
            >
              <Search className="h-4 w-4 mr-2" />
              {isQuerying ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vector Indexes */}
      <Card className="bg-gradient-card border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Vector Indexes
          </CardTitle>
          <CardDescription>Manage your document vector indexes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {vectorIndexes.map((index) => (
              <div key={index.id} className="p-4 rounded-lg border border-border/50 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-primary">
                      <Database className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{index.name}</h4>
                      <p className="text-sm text-muted-foreground">{index.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(index.status)}>
                      {getStatusIcon(index.status)}
                      <span className="ml-1 capitalize">{index.status}</span>
                    </Badge>
                    {index.status === 'ready' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => rebuildIndex(index.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {index.status === 'building' && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Building index...</span>
                      <span>{buildProgress}%</span>
                    </div>
                    <Progress value={buildProgress} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Documents:</span>
                    <div className="font-medium">{index.documentsCount}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vectors:</span>
                    <div className="font-medium">{index.vectorsCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Model:</span>
                    <div className="font-medium">{index.embeddingModel}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Updated:</span>
                    <div className="font-medium">{index.lastUpdated.toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Query Results */}
      {queryHistory.length > 0 && (
        <Card className="bg-gradient-card border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Query Results
            </CardTitle>
            <CardDescription>Recent RAG search results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {queryHistory.map((query) => (
                <div key={query.id} className="border border-border/50 rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Query: "{query.query}"</h4>
                    <span className="text-sm text-muted-foreground">
                      {query.timestamp.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {query.results.map((result, index) => (
                      <div key={index} className="p-3 rounded-lg bg-card border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{result.source}</span>
                          </div>
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            {(result.score * 100).toFixed(1)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{result.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Integration */}
      <Card className="bg-gradient-card border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Document Integration
          </CardTitle>
          <CardDescription>
            Connect your uploaded documents ({documents?.length || 0} available)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {documents && documents.length > 0 ? (
              <div className="space-y-2">
                  {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 rounded border border-border/50">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{doc.filename || 'Document'}</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        Ready
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Index
                    </Button>
                  </div>
                ))}
                {documents.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    ... and {documents.length - 5} more documents
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Documents</h3>
                <p className="text-muted-foreground mb-4">
                  Upload documents to build your RAG knowledge base
                </p>
                <Button className="bg-gradient-primary">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};