import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReport } from '../hooks/useReport';
import { useRealtimeMetric } from '../hooks/useRealtimeMetric';
import { supabase } from '../lib/supabase';
import { intelligentAgent } from '../lib/intelligentAgent';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, Users, DollarSign, Lightbulb } from 'lucide-react';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState('campaign_performance');
  const { report, loading, error, exportReport } = useReport({
    type: 'marketing',
    filters: { user_id: user?.id, metric: selectedMetric, timeframe: '7d' },
  });
  const { value: realTimeValue, loading: realTimeLoading, error: realTimeError } = useRealtimeMetric('active_users');
  const [agentSuggestions, setAgentSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (report) {
        await supabase.from('analytics_events').insert({
          user_id: user?.id,
          type: 'analytics_view',
          data: report,
          timestamp: new Date().toISOString(),
        });
        const suggestions = await intelligentAgent.optimizeMarketing();
        setAgentSuggestions(suggestions.map(s => `Optimize ${s.type} to ${s.value}`));
      }
    };
    fetchAnalytics();
  }, [report, user?.id]);

  if (loading || realTimeLoading) return <div>Loading analytics...</div>;
  if (error || realTimeError) return <div>Error loading analytics: {error?.message || realTimeError?.message}</div>;

  const chartData = report?.data.map((item: any) => ({
    name: item.date,
    value: item.value,
    category: item.category,
  })) || [];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Marketing Analytics</h1>
      <div className="flex gap-4">
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="campaign_performance">Campaign Performance</option>
          <option value="lead_conversion">Lead Conversion</option>
          <option value="customer_engagement">Customer Engagement</option>
          <option value="revenue">Revenue</option>
          <option value="video_engagement">Video Engagement</option>
        </select>
        <button
          onClick={() => exportReport('csv')}
          className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C]"
        >
          Export CSV
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><TrendingUp /> Real-Time Metrics</h2>
          <p className="mt-2">Active Users: {realTimeValue?.activeUsers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Users /> Customer Insights</h2>
          <p className="mt-2">Total Customers: {report?.summary.total_customers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><DollarSign /> Revenue</h2>
          <p className="mt-2">Total Revenue: ${report?.summary.total_revenue?.toLocaleString() || 0}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Brain /> AI Recommendations</h2>
        <p className="mt-2">Based on analytics, optimize {selectedMetric} with:</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          {agentSuggestions.map((suggestion, idx) => (
            <li key={idx} className="text-gray-600">{suggestion}</li>
          ))}
        </ul>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#FF3366" name={selectedMetric} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Lightbulb /> Intelligent Agent Insights</h2>
        <p className="mt-2">The agent suggests harmonizing campaigns, videos, and funnels for a 15% lift in ROI. Apply now!</p>
        <button
          onClick={() => intelligentAgent.optimizeMarketing().catch(console.error)}
          className="mt-2 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C]"
        >
          Apply Optimization
        </button>
      </div>
    </div>
  );
};

export default Analytics;