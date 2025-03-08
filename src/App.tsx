import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/auth/AuthProvider';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import CustomerSegments from './pages/CustomerSegments';
import EmailAI from './pages/EmailAI';
import SocialMediaAI from './pages/SocialMediaAI';
import WebsiteAI from './pages/WebsiteAI';
import Funnels from './pages/Funnels';
import Campaigns from './pages/Campaigns';
import Advertising from './pages/Advertising';
import Blog from './pages/Blog';
import BlogEditor from './pages/BlogEditor';
import BlogPostView from './pages/BlogPostView';
import BlogSettings from './pages/BlogSettings';
import Community from './pages/Community';
import Analytics from './pages/Analytics';
import ApiIntegrations from './pages/ApiIntegrations';
import ApiDocs from './pages/ApiDocs';
import CompetitorIntelligence from './pages/CompetitorIntelligence';
import Settings from './pages/Settings';
import WebsiteChatAnalytics from './pages/WebsiteChatAnalytics';
import WebsiteChatInterface from './pages/WebsiteChatInterface';
import WebsiteChatMonitoring from './pages/WebsiteChatMonitoring';
import WebsiteChatResponses from './pages/WebsiteChatResponses';
import WebsiteChatSettings from './pages/WebsiteChatSettings';
import WebsiteOptimization from './pages/WebsiteOptimization';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import Automation from './pages/Automation';
import { intelligentAgent } from './lib/intelligentAgent';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => {
  const { user } = useAuth();

  // Initialize or update intelligent agent with user ID when authenticated
  React.useEffect(() => {
    if (user?.id) {
      intelligentAgent.userId = user.id;
      intelligentAgent.optimizeMarketing().catch(console.error);
    }
  }, [user?.id]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
      <Route path="/segments" element={<ProtectedRoute><CustomerSegments /></ProtectedRoute>} />
      <Route path="/email" element={<ProtectedRoute><EmailAI /></ProtectedRoute>} />
      <Route path="/social" element={<ProtectedRoute><SocialMediaAI /></ProtectedRoute>} />
      <Route path="/website" element={<ProtectedRoute><WebsiteAI /></ProtectedRoute>} />
      <Route path="/funnels" element={<ProtectedRoute><Funnels /></ProtectedRoute>} />
      <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
      <Route path="/advertising" element={<ProtectedRoute><Advertising /></ProtectedRoute>} />
      <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
      <Route path="/blog/edit/:id?" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
      <Route path="/blog/post/:slug" element={<ProtectedRoute><BlogPostView /></ProtectedRoute>} />
      <Route path="/blog/settings" element={<ProtectedRoute><BlogSettings /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/integrations" element={<ProtectedRoute><ApiIntegrations /></ProtectedRoute>} />
      <Route path="/integrations/docs" element={<ProtectedRoute><ApiDocs /></ProtectedRoute>} />
      <Route path="/competitors" element={<ProtectedRoute><CompetitorIntelligence /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/chat/analytics" element={<ProtectedRoute><WebsiteChatAnalytics /></ProtectedRoute>} />
      <Route path="/chat/interface" element={<ProtectedRoute><WebsiteChatInterface /></ProtectedRoute>} />
      <Route path="/chat/monitoring" element={<ProtectedRoute><WebsiteChatMonitoring /></ProtectedRoute>} />
      <Route path="/chat/responses" element={<ProtectedRoute><WebsiteChatResponses /></ProtectedRoute>} />
      <Route path="/chat/settings" element={<ProtectedRoute><WebsiteChatSettings /></ProtectedRoute>} />
      <Route path="/optimization" element={<ProtectedRoute><WebsiteOptimization /></ProtectedRoute>} />
      <Route path="/automation" element={<ProtectedRoute><Automation /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;