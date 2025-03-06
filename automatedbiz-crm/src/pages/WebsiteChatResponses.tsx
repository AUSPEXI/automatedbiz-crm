import React from 'react';
import WebsiteChatResponses from '../components/website/WebsiteChatResponses'; // Assuming this exists
import { MessageSquare, Brain, Plus } from 'lucide-react';

const WebsiteChatResponsesPage: React.FC = () => (
  <div className="space-y-6 p-6">
    <h1 className="text-2xl font-bold">Website Chat Responses</h1>
    <div className="flex gap-4 mb-4">
      <button
        className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
      >
        <Plus size={18} /><span>Create Response</span>
      </button>
      <button
        className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
      >
        <Brain size={18} /><span>AI Suggestions</span>
      </button>
    </div>
    <WebsiteChatResponses />
  </div>
);

export default WebsiteChatResponsesPage;