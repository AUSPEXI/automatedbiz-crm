import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { generateContent } from '../../lib/openai';
import { supabase } from '../../lib/supabase';
import { Wand2, X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const ContentWizard: React.FC<Props> = ({ onClose }) => {
  const { user } = useAuth();
  const [goal, setGoal] = useState('');
  const [platform, setPlatform] = useState('facebook');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const content = await generateContent({ type: 'social', userId: user.id, goal, platform });
      await supabase.from('social_posts').insert({
        user_id: user.id,
        content: content.content,
        platform,
        status: 'draft',
        scheduled_for: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      });
      onClose();
    } catch (err) {
      console.error('Error generating social post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Generate Social Post</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Post goal (e.g., Announce sale)"
          className="w-full p-2 border rounded mb-4"
        />
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full p-2 border rounded mb-4">
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="twitter">Twitter</option>
          <option value="linkedin">LinkedIn</option>
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

export default ContentWizard;