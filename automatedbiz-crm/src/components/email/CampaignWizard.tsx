import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { generateContent } from '../../lib/openai';
import { supabase } from '../../lib/supabase';
import { Wand2, X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const CampaignWizard: React.FC<Props> = ({ onClose }) => {
  const { user } = useAuth();
  const [goal, setGoal] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [segData, compData] = await Promise.all([
        supabase.from('customer_segments').select('id, name').eq('user_id', user.id),
        supabase.from('company_profiles').select('id, name').eq('user_id', user.id),
      ]);
      setSegments(segData.data || []);
      setCompanies(compData.data || []);
    };
    fetchData();
  }, [user]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const content = await generateContent({ type: 'email', userId: user.id, goal, segmentId, companyId });
      const { data: template } = await supabase.from('email_templates').insert({
        user_id: user.id,
        name: `Auto: ${goal}`,
        subject: content.subject,
        content: content.content,
      }).select().single();

      await supabase.from('email_campaigns').insert({
        user_id: user.id,
        template_id: template.id,
        name: `Campaign: ${goal}`,
        status: 'draft',
        scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        segment_id: segmentId,
        company_id: companyId,
      });
      onClose();
    } catch (err) {
      console.error('Error generating campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Generate Email Campaign</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Campaign goal (e.g., Promote product)"
          className="w-full p-2 border rounded mb-4"
        />
        <select value={segmentId} onChange={(e) => setSegmentId(e.target.value)} className="w-full p-2 border rounded mb-4">
          <option value="">Select Segment</option>
          {segments.map((seg) => <option key={seg.id} value={seg.id}>{seg.name}</option>)}
        </select>
        <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full p-2 border rounded mb-4">
          <option value="">Select Company</option>
          {companies.map((comp) => <option key={comp.id} value={comp.id}>{comp.name}</option>)}
        </select>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center justify-center space-x-2"
        >
          {loading ? 'Generating...' : <><Wand2 size={18} /><span>Generate & Schedule</span></>}
        </button>
      </div>
    </div>
  );
};

export default CampaignWizard;