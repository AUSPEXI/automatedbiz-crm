import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Brain, Zap, Settings } from 'lucide-react';

const WebsiteOptimization: React.FC = () => {
  const { user } = useAuth();
  const [optimizations, setOptimizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptimizations = async () => {
      const { data } = await supabase.from('website_optimizations').select('*').eq('user_id', user?.id);
      setOptimizations(data || []);
      setLoading(false);
    };
    fetchOptimizations();
  }, [user?.id]);

  if (loading) return <div>Loading optimizations...</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Website Optimization Dashboard</h1>
      <div className="flex gap-4 mb-4">
        <button
          className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
        >
          <Settings size={18} /><span>Configure</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {optimizations.map((opt) => (
          <div key={opt.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Brain /> {opt.type}</h2>
            <p className="mt-2">{opt.description}</p>
            <button
              className="mt-4 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
            >
              <Zap size={18} /><span>Apply Optimization</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebsiteOptimization;