import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Bot, Workflow, MessageSquare, Upload, Play } from 'lucide-react';

export default function Help() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Help & Guide</h1>
          <p className="text-muted-foreground text-lg">
            Learn how to use AI agents, document analysis, and workflows
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          {/* Agent Activation */}
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Agent Activation
              </CardTitle>
              <CardDescription>How to activate and use AI agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Steps to activate an agent:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to the Agents page</li>
                  <li>Browse available agents for your role</li>
                  <li>Click "Activate" on any agent (max 5 agents)</li>
                  <li>Once activated, click "Chat" to start conversing</li>
                  <li>To deactivate, click "Deactivate" button</li>
                </ol>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Important Notes:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Maximum 5 agents can be active at once</li>
                  <li>Deactivate unused agents to activate new ones</li>
                  <li>Each agent has specialized capabilities for your role</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Document Analysis */}
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Document Analysis
              </CardTitle>
              <CardDescription>How to upload and analyze documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">How to analyze documents:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to Documents page</li>
                  <li>Click "Upload Document" button</li>
                  <li>Select your file (PDF, Word, Text, etc.)</li>
                  <li>Wait for automatic processing</li>
                  <li>Click "View Analysis" to see AI insights</li>
                  <li>Reference documents in agent chats</li>
                </ol>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Analysis Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Executive summary of content</li>
                  <li>Key points and topics extraction</li>
                  <li>Important data and numbers</li>
                  <li>Actionable insights</li>
                  <li>Potential applications</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Execution */}
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-primary" />
                Workflow Execution
              </CardTitle>
              <CardDescription>How to create and execute workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Creating workflows:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to Workflows page</li>
                  <li>Click "Create Workflow"</li>
                  <li>Enter name and description</li>
                  <li>Choose trigger type (manual, schedule, etc.)</li>
                  <li>Configure workflow steps in JSON format</li>
                  <li>Activate the workflow</li>
                </ol>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Example JSON Configuration:</h4>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "steps": [
    {
      "type": "agent_chat",
      "agent_id": "quiz-generator",
      "message": "Generate quiz",
      "wait_for_response": true
    },
    {
      "type": "document_analysis", 
      "document_id": "doc-id",
      "analysis_type": "summary"
    }
  ]
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Chat with Documents */}
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Chat with Documents
              </CardTitle>
              <CardDescription>How to reference documents in agent conversations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Using documents in chat:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Upload and process your document first</li>
                  <li>Go to chat with any activated agent</li>
                  <li>Click the document icon to select a document</li>
                  <li>Ask questions about the document content</li>
                  <li>Agent will analyze and respond based on document</li>
                </ol>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Example Questions:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>"Summarize the key points from this document"</li>
                  <li>"Create a quiz based on this content"</li>
                  <li>"What are the main takeaways?"</li>
                  <li>"Explain the complex concepts in simple terms"</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/30">
          <CardHeader>
            <CardTitle className="text-primary">Quick Tips for Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Document Tips
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Supported formats: PDF, Word, Text, and more</li>
                  <li>• Wait for "View Analysis" button to appear</li>
                  <li>• Analysis includes AI-powered insights</li>
                  <li>• Documents can be referenced in any agent chat</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Workflow Tips
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Start with simple manual workflows</li>
                  <li>• Use JSON format for step configuration</li>
                  <li>• Test workflows before scheduling</li>
                  <li>• Monitor execution in the workflows page</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}