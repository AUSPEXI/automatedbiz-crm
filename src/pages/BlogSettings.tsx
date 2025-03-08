import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Settings, Save } from 'lucide-react';

const BlogSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<any>({ default_category: '', default_tags: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('blog_settings').select('*').eq('user_id', user?.id).single();
      setSettings(data || { default_category: '', default_tags: [] });
      setLoading(false);
    };
    fetchSettings();
  }, [user?.id]);

  const handleSave = async () => {
    try {
      await supabase.from('blog_settings').upsert({ user_id: user?.id, ...settings });
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Blog Settings</h1>
      <div className="space-y-4">
        <select
          value={settings.default_category}
          onChange={(e) => setSettings({ ...settings, default_category: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Default Category</option>
          {/* Fetch categories dynamically or hardcode for simplicity */}
          <option value="marketing">Marketing</option>
          <option value="technology">Technology</option>
        </select>
        <input
          type="text"
          value={settings.default_tags.join(', ')}
          onChange={(e) => setSettings({ ...settings, default_tags: e.target.value.split(', ').map(t => t.trim()) })}
          placeholder="Default Tags (comma-separated)"
          className="w-full p-2 border rounded"
        />
      </div>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
      >
        <Save size={18} /><span>Save Settings</span>
      </button>
    </div>
  );
};

export default BlogSettings;