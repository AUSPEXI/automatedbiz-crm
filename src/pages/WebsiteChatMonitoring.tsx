import React from 'react';
import WebsiteChatMonitoring from '../components/website/WebsiteChatMonitoring'; // Assuming this exists
import { MessageSquare, Brain, AlertCircle } from 'lucide-react';

const WebsiteChatMonitoringPage: React.FC = () => (
  <div className="space-y-6 p-6">
    <h1 className="text-2xl font-bold">Website Chat Monitoring</h1>
    <WebsiteChatMonitoring />
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold flex items-center gap-2"><Brain /> AI Alerts</h2>
      <p className="mt-2">Monitor high-priority chats and leverage AI for quick resolutions.</p>
      <div className="mt-2 flex gap-2">
        <AlertCircle size={20} className="text-yellow-500" />
        <span className="text-yellow-600">2 high-priority chats detected</span>
      </div>
    </div>
  </div>
);

export default WebsiteChatMonitoringPage;