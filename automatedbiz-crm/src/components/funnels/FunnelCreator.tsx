import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { generateContent } from '../../lib/openai';
import { supabase } from '../../lib/supabase';
import { Wand2, X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const FunnelCreator: React.FC<Props> = ({ onClose }) => {
  const { user } = useAuth();
  const [goal, setGoal] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase.from('company_profiles').select('id, name').eq('user_id', user.id);
      setCompanies(data || []);
    };
    fetchCompanies();
  }, [user]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const content = await generateContent({ type: 'funnel', userId: user.id, goal, companyId });
      await supabase.from('funnels').insert({
        user_id: user.id,
        name: content.title,
        subdomain: `${content.title.toLowerCase().replace(/\s+/g, '-')}.automatedbiz.com`,
        content: JSON.stringify(content),
        status: 'draft',
        template: 'default',
        industry: 'General',
        ai_generated: true,
      });
      onClose();
    } catch (err) {
      console.error('Error generating funnel:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Generate Funnel Page</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Funnel goal (e.g., Lead capture)"
          className="w-full p-2 border rounded mb-4"
        />
        <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full p-2 border rounded mb-4">
          <option value="">Select Company</option>
          {companies.map((comp) => <option key={comp.id} value={comp.id}>{comp.name}</option>)}
        </select>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center justify-center space-x-2"
        >
          {loading ? 'Generating...' : <><Wand2 size={18} /><span>Generate & Save</span></>}
        </button>
      </div>
    </div>
  );
};

export default FunnelCreator;