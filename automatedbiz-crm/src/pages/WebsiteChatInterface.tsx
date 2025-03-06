import React from 'react';
import WebsiteChatInterface from '../components/website/WebsiteChatInterface'; // Assuming this exists
import { MessageSquare, Brain } from 'lucide-react';

const WebsiteChatInterfacePage: React.FC = () => (
  <div className="space-y-6 p-6">
    <h1 className="text-2xl font-bold">Website Chat Interface</h1>
    <WebsiteChatInterface />
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold flex items-center gap-2"><Brain /> AI Suggestions</h2>
      <p className="mt-2">Enhance chat interactions with AI-driven personalization and automation.</p>
    </div>
  </div>
);

export default WebsiteChatInterfacePage;