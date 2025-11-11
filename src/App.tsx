import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AgentsProvider } from "@/hooks/useAgents";
import { DocumentsProvider } from "@/hooks/useDocuments";
import { WorkflowsProvider } from "@/hooks/useWorkflows";
import { IntegrationsProvider } from "@/hooks/useIntegrations";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RoleSelection from "./pages/RoleSelection";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import Chat from "./pages/Chat";
import Documents from "./pages/Documents";
import Workflows from "./pages/Workflows";
import Integrations from "./pages/Integrations";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import MCPEditor from "./pages/MCPEditor";
import Testing from "./pages/Testing";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AgentsProvider>
          <DocumentsProvider>
            <WorkflowsProvider>
              <IntegrationsProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
                    <Route path="/chat/:agentId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                    <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
                    <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
                    <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
                    <Route path="/mcp-editor" element={<ProtectedRoute><MCPEditor /></ProtectedRoute>} />
                    <Route path="/testing" element={<ProtectedRoute><Testing /></ProtectedRoute>} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </IntegrationsProvider>
            </WorkflowsProvider>
          </DocumentsProvider>
        </AgentsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
