import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useReport } from '../hooks/useReport';
import { aiInsightsService } from '../lib/aiInsights';
import { supabase } from '../lib/supabase';
import { Brain, Zap, Settings } from 'lucide-react';

const Automation: React.FC = () => {
  const { user } = useAuth();
  const [segmentId, setSegmentId] = useState('');
  const [insights, setInsights] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const { report, loading, error } = useReport({
    type: 'automation',
    filters: { user_id: user?.id, timeframe: '30d' },
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: segments } = await supabase.from('customer_segments').select('id, name').eq('user_id', user?.id);
      if (segments?.length) setSegmentId(segments[0].id);

      const { data: autoData } = await supabase.from('automations').select('*').eq('user_id', user?.id);
      setAutomations(autoData || []);

      if (segmentId) {
        const insightsData = await aiInsightsService.generateInsights(segmentId);
        setInsights(insightsData);
        supabase.from('analytics_events').insert({
          user_id: user?.id,
          type: 'automation_insight',
          data: insightsData,
          timestamp: new Date().toISOString(),
        });
      }
    };
    fetchData();
  }, [user?.id, segmentId]);

  if (loading) return <div>Loading automation data...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleOptimize = async (insight: any) => {
    try {
      await supabase.from('automation_tasks').insert({
        user_id: user?.id,
        type: 'campaign_optimization',
        action: insight.action,
        segment_id: segmentId,
        status: 'pending',
      });
      setInsights(insights.filter(i => i.action !== insight.action));
    } catch (err) {
      console.error('Error optimizing:', err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Automation Dashboard</h1>
      <select
        value={segmentId}
        onChange={(e) => setSegmentId(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">Select Segment</option>
        {automations.map((seg) => <option key={seg.id} value={seg.id}>{seg.name}</option>)}
      </select>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Brain /> AI Insights</h2>
          {insights.map((insight, idx) => (
            <div key={idx} className="p-4 border rounded-lg mb-4">
              <h3 className="font-medium">{insight.title}</h3>
              <p className="text-gray-600">{insight.description}</p>
              <button
                onClick={() => handleOptimize(insight)}
                className="mt-2 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C]"
              >
                Optimize
              </button>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Zap /> Automation Tasks</h2>
          <p className="mt-2">Active automations: {automations.length}</p>
          <button
            onClick={() => {/* Configure new automation */}}
            className="mt-4 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Settings size={18} /><span>Configure Automation</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Automation;