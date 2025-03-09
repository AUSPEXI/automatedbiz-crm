import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import CampaignWizard from '../components/email/CampaignWizard';
import { supabase } from '../lib/supabase';
import { Plus, Mail, Brain } from 'lucide-react';

const Campaigns: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data } = await supabase.from('email_campaigns').select('*').eq('user_id', user?.id);
      setCampaigns(data || []);
      setLoading(false);
    };
    fetchCampaigns();
  }, [user?.id]);

  if (loading) return <div>Loading campaigns...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Campaigns Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowWizard(true)}
            className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Plus size={18} /><span>Create Campaign</span>
          </button>
          <button
            className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Brain size={18} /><span>AI Optimize</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold">{campaign.name}</h3>
            <p className="text-gray-600">Status: {campaign.status} | Scheduled: {new Date(campaign.scheduled_for).toLocaleString()}</p>
            <button
              className="mt-2 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
            >
              <Mail size={18} /><span>Send Now</span>
            </button>
          </div>
        ))}
      </div>
      {showWizard && <CampaignWizard onClose={() => setShowWizard(false)} />}
    </div>
  );
};

export default Campaigns;