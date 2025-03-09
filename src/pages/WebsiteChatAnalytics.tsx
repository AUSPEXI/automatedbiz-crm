import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import WebsiteChatAnalytics from '../components/website/WebsiteChatAnalytics'; // Assuming this exists
import { BarChart2, Brain, Download } from 'lucide-react';

const WebsiteChatAnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState('7d');

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Website Chat Analytics</h1>
      <div className="flex gap-4">
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
        <button
          className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
        >
          <Download size={18} /><span>Export</span>
        </button>
      </div>
      <WebsiteChatAnalytics />
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Brain /> AI Recommendations</h2>
        <p className="mt-2">Improve chat performance by optimizing response times and AI accuracy.</p>
      </div>
    </div>
  );
};

export default WebsiteChatAnalyticsPage;