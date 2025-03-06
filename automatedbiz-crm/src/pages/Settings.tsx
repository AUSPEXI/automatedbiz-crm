import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import RoleManagement from '../components/settings/RoleManagement';
import { Settings as SettingsIcon, Lock, User, Eye } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [privacyPolicy, setPrivacyPolicy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      const { data } = await supabase
        .from('company_profiles')
        .select('privacy_policy')
        .eq('user_id', user?.id)
        .single();
      setPrivacyPolicy(data?.privacy_policy || null);
      setLoading(false);
    };
    fetchPolicy();
  }, [user?.id]);

  const handleSavePolicy = async (policy: string) => {
    await supabase
      .from('company_profiles')
      .update({ privacy_policy: policy })
      .eq('user_id', user?.id);
    setPrivacyPolicy(policy);
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><SettingsIcon /> General Settings</h2>
          {/* Add general settings here */}
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Lock /> Role Management</h2>
          <RoleManagement />
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><User /> User Management</h2>
          {/* Add user management here */}
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Eye /> Privacy Policy</h2>
          <textarea
            value={privacyPolicy || ''}
            onChange={(e) => setPrivacyPolicy(e.target.value)}
            placeholder="Describe how you collect, use, and share data (e.g., 'We collect marketing data for optimization, with your consent, and share only anonymized aggregates for platform improvement.')"
            className="w-full p-2 border rounded h-32"
          />
          <button
            onClick={() => handleSavePolicy(privacyPolicy || '')}
            className="mt-2 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C]"
          >
            Save Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;