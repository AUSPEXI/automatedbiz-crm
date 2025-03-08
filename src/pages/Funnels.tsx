import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import FunnelCreator from '../components/funnels/FunnelCreator';
import VideoProductionWizard from '../components/video/VideoProductionWizard';
import { Plus, Brain, Globe, Video } from 'lucide-react';

const Funnels: React.FC = () => {
  const { user } = useAuth();
  const [funnels, setFunnels] = useState<any[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [showVideoWizard, setShowVideoWizard] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFunnels = async () => {
      const { data } = await supabase.from('funnels').select('*').eq('user_id', user?.id);
      setFunnels(data || []);
      setLoading(false);
    };
    fetchFunnels();
  }, [user?.id]);

  if (loading) return <div>Loading funnels...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Funnels Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreator(true)}
            className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Plus size={18} /><span>Create Funnel</span>
          </button>
          <button
            onClick={() => setShowVideoWizard(true)}
            className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Video size={18} /><span>Generate Video</span>
          </button>
          <button
            className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Brain size={18} /><span>AI Optimize</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {funnels.map((funnel) => (
          <div key={funnel.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold">{funnel.name}</h3>
            <p className="text-gray-600">Subdomain: {funnel.subdomain}</p>
            <p className="text-gray-600">Status: {funnel.status}</p>
            <button
              className="mt-2 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
            >
              <Globe size={18} /><span>Preview</span>
            </button>
          </div>
        ))}
      </div>
      {showCreator && <FunnelCreator onClose={() => setShowCreator(false)} />}
      {showVideoWizard && <VideoProductionWizard onClose={() => setShowVideoWizard(false)} />}
    </div>
  );
};

export default Funnels;