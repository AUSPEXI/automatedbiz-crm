import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReport } from '../hooks/useReport';
import { supabase } from '../lib/supabase';
import AdContentWizard from '../components/advertising/AdContentWizard';
import AddBudgetModal from '../components/advertising/AddBudgetModal';
import CreateCampaignModal from '../components/advertising/CreateCampaignModal';
import CampaignMetrics from '../components/advertising/CampaignMetrics';
import { Plus, DollarSign, Brain } from 'lucide-react';

const Advertising: React.FC = () => {
  const { user } = useAuth();
  const [showAdWizard, setShowAdWizard] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const { report, loading, error } = useReport({
    type: 'advertising',
    filters: { user_id: user?.id, timeframe: '7d' },
  });

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data } = await supabase.from('email_campaigns').select('*').eq('user_id', user?.id);
      setCampaigns(data || []);
    };
    fetchCampaigns();

    // Log analytics for intelligent agent
    if (report) {
      supabase.from('analytics_events').insert({
        user_id: user?.id,
        type: 'advertising_view',
        data: report,
        timestamp: new Date().toISOString(),
      });
    }
  }, [user?.id, report]);

  if (loading) return <div>Loading advertising data...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Advertising Dashboard</h1>
      <div className="flex gap-4">
        <button
          onClick={() => setShowAdWizard(true)}
          className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
        >
          <Plus size={18} /><span>Create Ad</span>
        </button>
        <button
          onClick={() => setShowBudgetModal(true)}
          className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
        >
          <DollarSign size={18} /><span>Add Budget</span>
        </button>
        <button
          onClick={() => setShowCampaignModal(true)}
          className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
        >
          <Plus size={18} /><span>Create Campaign</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold">{campaign.name}</h3>
            <p className="text-gray-600">Status: {campaign.status}</p>
            <CampaignMetrics data={campaign} />
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Brain /> AI Recommendations</h2>
        <p className="mt-2">Optimize ad performance with {report?.summary.recommendation || 'targeted segments'}.</p>
      </div>
      {showAdWizard && <AdContentWizard onClose={() => setShowAdWizard(false)} />}
      {showBudgetModal && <AddBudgetModal onClose={() => setShowBudgetModal(false)} />}
      {showCampaignModal && <CreateCampaignModal onClose={() => setShowCampaignModal(false)} />}
    </div>
  );
};

export default Advertising;