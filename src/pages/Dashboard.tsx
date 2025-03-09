import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeMetric } from '../hooks/useRealtimeMetric';
import { useGamification } from '../hooks/useGamification';
import { supabase } from '../lib/supabase';
import { Dashboard as DashboardIcon, Brain, Zap, Award, Video } from 'lucide-react';
import VideoProductionWizard from '../components/video/VideoProductionWizard';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { value: activeUsers, loading: usersLoading } = useRealtimeMetric('active_users');
  const { achievements, badges, reputation, loading: gamificationLoading } = useGamification();
  const [metrics, setMetrics] = useState<any>({ leads: 0, campaigns: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [showVideoWizard, setShowVideoWizard] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      const [leads, campaigns, revenue] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact' }).eq('user_id', user?.id),
        supabase.from('email_campaigns').select('*', { count: 'exact' }).eq('user_id', user?.id),
        supabase.rpc('calculate_revenue', { user_id: user?.id }),
      ]);
      setMetrics({
        leads: leads.count || 0,
        campaigns: campaigns.count || 0,
        revenue: revenue.data?.total || 0,
      });
      setLoading(false);
    };
    fetchMetrics();
  }, [user?.id]);

  if (loading || usersLoading || gamificationLoading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Welcome, {profile?.full_name || 'User'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><DashboardIcon /> Active Users</h2>
          <p className="mt-2">{activeUsers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold">Leads</h2>
          <p className="mt-2">{metrics.leads}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold">Campaigns</h2>
          <p className="mt-2">{metrics.campaigns}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold">Revenue</h2>
          <p className="mt-2">${metrics.revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Award /> Reputation</h2>
          <p className="mt-2">Level {reputation?.level || 1}: {reputation?.total || 0} points</p>
          <p className="text-sm text-gray-600">{reputation?.nextLevel?.remaining || 0} to {reputation?.rank}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Brain /> AI Insights</h2>
          <p className="mt-2">Optimize campaigns with real-time data and predictive analytics.</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Zap /> Recent Achievements</h2>
          <ul className="mt-2 space-y-2">
            {achievements.slice(0, 3).map((ach) => (
              <li key={ach.id} className="flex items-center gap-2">
                <span className="text-[#FF3366]">{ach.icon}</span>
                <span>{ach.name} - {ach.points} points</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-gray-600">Badges: {badges.length}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Video /> Video Production</h2>
        <p className="mt-2">Create targeted marketing videos for YouTube and more with AI.</p>
        <button
          onClick={() => setShowVideoWizard(true)}
          className="mt-4 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
        >
          <Video size={18} /><span>Generate Video</span>
        </button>
      </div>
      {showVideoWizard && <VideoProductionWizard onClose={() => setShowVideoWizard(false)} />}
    </div>
  );
};

export default Dashboard;