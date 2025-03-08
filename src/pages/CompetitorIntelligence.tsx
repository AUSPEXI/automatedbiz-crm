import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Target, Brain, Search } from 'lucide-react';

const CompetitorIntelligence: React.FC = () => {
  const { user } = useAuth();
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompetitors = async () => {
      const { data } = await supabase.from('competitor_analysis').select('*').eq('user_id', user?.id);
      setCompetitors(data || []);
      setLoading(false);
    };
    fetchCompetitors();
  }, [user?.id]);

  if (loading) return <div>Loading competitor data...</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Competitor Intelligence</h1>
      <div className="flex gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search competitors..."
          className="p-2 border rounded flex-1"
        />
        <button
          className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
        >
          <Search size={18} /><span>Analyze</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {competitors.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((competitor) => (
          <div key={competitor.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold">{competitor.name}</h3>
            <p className="text-gray-600">Strengths: {competitor.strengths}</p>
            <p className="text-gray-600">Weaknesses: {competitor.weaknesses}</p>
            <button
              className="mt-2 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
            >
              <Brain size={18} /><span>AI Insights</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitorIntelligence;