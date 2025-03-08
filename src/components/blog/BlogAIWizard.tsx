import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { generateContent } from '../../lib/openai';
import { supabase } from '../../lib/supabase';
import { Wand2, X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const BlogAIWizard: React.FC<Props> = ({ onClose }) => {
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
      const content = await generateContent({ type: 'blog', userId: user.id, goal, companyId });
      await supabase.from('blog_posts').insert({
        user_id: user.id,
        title: content.title,
        slug: content.title.toLowerCase().replace(/\s+/g, '-'),
        excerpt: content.excerpt,
        content: content.content,
        author_id: user.id,
        status: 'scheduled',
        publish_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        company_id: companyId,
        ai_generated: true,
      });
      onClose();
    } catch (err) {
      console.error('Error generating blog:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Generate Blog Post</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Blog goal (e.g., Explain AI benefits)"
          className="w-full p-2 border rounded mb-4"
        />
        <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full p-2 border rounded mb-4">
          <option value="">Select Company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>{company.name}</option>
          ))}
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

export default BlogAIWizard;