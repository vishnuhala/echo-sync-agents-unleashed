import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useDocuments } from '@/hooks/useDocuments';
import { useRAG } from '@/hooks/useRAG';
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

// Types imported from useRAG hook

export const RAGSystem = () => {
  const { documents } = useDocuments();
  const { 
    vectorIndexes, 
    queryHistory, 
    loading,
    createVectorIndex,
    performRAGQuery,
    rebuildVectorIndex,
    indexDocuments
  } = useRAG();
  
  const [currentQuery, setCurrentQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [lastResults, setLastResults] = useState<Array<{ content: string; source: string; score: number }>>([]);
  const [newIndexName, setNewIndexName] = useState('');
  const [newIndexDescription, setNewIndexDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  // Set first available index as selected
  useEffect(() => {
    if (vectorIndexes.length > 0 && !selectedIndex) {
      setSelectedIndex(vectorIndexes[0].id);
    }
  }, [vectorIndexes, selectedIndex]);

  const handlePerformQuery = async () => {
    if (!currentQuery.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    if (!selectedIndex) {
      toast({
        title: "No Index Selected",
        description: "Please select a vector index first",
        variant: "destructive",
      });
      return;
    }

    setIsQuerying(true);

    try {
      const res = await performRAGQuery(currentQuery, selectedIndex);
      const resultsArray = Array.isArray((res as any)?.results)
        ? ((res as any).results as Array<{ content: string; source: string; score: number }>)
        : [];
      setLastResults(resultsArray);
      if (resultsArray.length === 0) {
        toast({
          title: 'No matches found',
          description: 'No content in your imported sources matched your query. Try rephrasing or importing more pages.',
        });
      }
      setCurrentQuery('');
    } catch (error) {
      console.error('Query error:', error);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleCreateIndex = async () => {
    if (!newIndexName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Please enter an index name",
        variant: "destructive",
      });
      return;
    }

    try {
      await createVectorIndex(newIndexName, newIndexDescription);
      setNewIndexName('');
      setNewIndexDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Create index error:', error);
    }
  };

  const handleIndexDocuments = async (indexId: string, docIds: string[]) => {
    try {
      await indexDocuments(indexId, docIds);
      toast({ title: 'Indexed', description: 'Document indexed to the selected vector index.' });
    } catch (error) {
      console.error('Index documents error:', error);
    }
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
        <Button onClick={() => setShowCreateForm(true)} className="bg-gradient-primary">
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
          {vectorIndexes.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Vector Index:</label>
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="">Select an index...</option>
                {vectorIndexes.map((index) => (
                  <option key={index.id} value={index.id}>
                    {index.name} ({index.status})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              placeholder="Enter your query to search through documents..."
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <Button 
              onClick={handlePerformQuery}
              disabled={isQuerying || !currentQuery.trim() || !selectedIndex}
              className="bg-gradient-primary self-end"
            >
              <Search className="h-4 w-4 mr-2" />
              {isQuerying ? 'Searching...' : 'Search'}
            </Button>
          </div>
          {lastResults.length === 0 && currentQuery.trim() === '' && (
            <p className="text-sm text-muted-foreground">Tip: Select an index above, then ask about your imported page. Results will appear below.</p>
          )}
        </CardContent>
      </Card>

      {/* Latest Results (live) */}
      {lastResults.length > 0 && (
        <Card className="bg-gradient-card border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Latest Results
            </CardTitle>
            <CardDescription>Answers from your most recent search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lastResults.map((result, i) => (
                <div key={i} className="p-3 rounded-lg bg-card border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {typeof result.source === 'string' && result.source.startsWith('http') ? (
                        <a href={result.source} target="_blank" rel="noopener noreferrer" className="font-medium text-sm underline underline-offset-2">
                          {result.source}
                        </a>
                      ) : (
                        <span className="font-medium text-sm">{result.source}</span>
                      )}
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      {(result.score * 100).toFixed(1)}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Index Form */}
      {showCreateForm && (
        <Card className="bg-gradient-card border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Vector Index
            </CardTitle>
            <CardDescription>Create a new vector index for your documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Index Name</label>
              <Input
                placeholder="Enter index name..."
                value={newIndexName}
                onChange={(e) => setNewIndexName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Enter index description..."
                value={newIndexDescription}
                onChange={(e) => setNewIndexDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateIndex} className="bg-gradient-primary">
                Create Index
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
            {vectorIndexes.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Vector Indexes</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first vector index to start using RAG
                </p>
                <Button onClick={() => setShowCreateForm(true)} className="bg-gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Index
                </Button>
              </div>
            ) : (
              vectorIndexes.map((index) => (
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
                          onClick={() => rebuildVectorIndex(index.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Documents:</span>
                      <div className="font-medium">{index.documents_count}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vectors:</span>
                      <div className="font-medium">{index.vectors_count.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Model:</span>
                      <div className="font-medium">{index.embedding_model}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <div className="font-medium">{new Date(index.last_updated_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
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
                       {new Date(query.created_at).toLocaleString()}
                     </span>
                  </div>
                  
                  <div className="space-y-3">
                    {query.results.map((result, index) => (
                      <div key={index} className="p-3 rounded-lg bg-card border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                             {typeof result.source === 'string' && result.source.startsWith('http') ? (
                               <a href={result.source} target="_blank" rel="noopener noreferrer" className="font-medium text-sm underline underline-offset-2">
                                 {result.source}
                               </a>
                             ) : (
                               <span className="font-medium text-sm">{result.source}</span>
                             )}
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
            Connect your uploaded documents ({documents?.length || 0} available) or import from a URL (web scraping)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Import from URL */}
          <ImportFromUrl selectedIndex={selectedIndex} />

          <div className="grid gap-4 mt-6">
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
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleIndexDocuments(selectedIndex || vectorIndexes[0]?.id, [doc.id])}
                      disabled={!selectedIndex && vectorIndexes.length === 0}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Index to Selected
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
                  Upload documents or import from a URL to build your RAG knowledge base
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

// Lightweight URL import component inside this file to avoid large changes
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const ImportFromUrl = ({ selectedIndex }: { selectedIndex: string }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleImport = async () => {
    if (!url.trim()) {
      toast({ title: 'Invalid URL', description: 'Please enter a valid URL', variant: 'destructive' });
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('rag-ingest-url', {
        body: { url, userId: user?.id },
      });
      if (error) throw error;
      toast({ title: 'Imported', description: 'Web page imported as a document. You can now index it.' });
      setUrl('');
    } catch (e: any) {
      console.error('Import error:', e);
      toast({ title: 'Import Failed', description: e.message || 'Could not import URL', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-2">Import from URL</label>
        <Input
          placeholder="https://example.com/article"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <Button onClick={handleImport} disabled={loading} className="bg-gradient-primary">
        {loading ? 'Importing...' : 'Import URL'}
      </Button>
    </div>
  );
};