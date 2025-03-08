import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AddLeadModal from '../components/leads/AddLeadModal';
import { supabase } from '../lib/supabase';
import { Plus, Brain, Users } from 'lucide-react';

const Leads: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase.from('leads').select('*').eq('user_id', user?.id);
      setLeads(data || []);
      setLoading(false);
    };
    fetchLeads();
  }, [user?.id]);

  const handleAddLead = async (leadData: any) => {
    try {
      await supabase.from('leads').insert({ ...leadData, user_id: user?.id });
      setShowModal(false);
      fetchLeads();
    } catch (err) {
      console.error('Error adding lead:', err);
    }
  };

  if (loading) return <div>Loading leads...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leads Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Plus size={18} /><span>Add Lead</span>
          </button>
          <button
            className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Brain size={18} /><span>AI Scoring</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold">{lead.name}</h3>
            <p className="text-gray-600">Company: {lead.company}</p>
            <p className="text-gray-600">Status: {lead.status} | Score: {lead.score}</p>
            <button
              className="mt-2 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
            >
              <Users size={18} /><span>View Details</span>
            </button>
          </div>
        ))}
      </div>
      {showModal && <AddLeadModal onClose={() => setShowModal(false)} onSave={handleAddLead} />}
    </div>
  );
};

export default Leads;