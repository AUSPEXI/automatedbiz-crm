import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import SegmentTemplates from '../components/segmentation/SegmentTemplates';
import { Users, Brain, Plus } from 'lucide-react';

const CustomerSegments: React.FC = () => {
  const { user } = useAuth();
  const [segments, setSegments] = useState<any[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSegments = async () => {
      const { data } = await supabase
        .from('customer_segments')
        .select('*, customer_segment_members(count)')
        .eq('user_id', user?.id);
      setSegments(data || []);
      setLoading(false);
    };
    fetchSegments();

    const subscription = supabase
      .channel('customer_segments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_segments', filter: `user_id=eq.${user?.id}` }, () => fetchSegments())
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  if (loading) return <div>Loading segments...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customer Segments</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowTemplates(true)}
            className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Plus size={18} /><span>Create Segment</span>
          </button>
          <button
            className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Brain size={18} /><span>AI Segment</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {segments.map((segment) => (
          <div key={segment.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold">{segment.name}</h3>
            <p className="text-gray-600">Description: {segment.description}</p>
            <p className="text-gray-600">Size: {segment.customer_segment_members[0]?.count || segment.size}</p>
            <button
              className="mt-2 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
            >
              <Users size={18} /><span>View Customers</span>
            </button>
          </div>
        ))}
      </div>
      {showTemplates && <SegmentTemplates onClose={() => setShowTemplates(false)} onSegmentCreated={() => fetchSegments()} />}
    </div>
  );
};

export default CustomerSegments;