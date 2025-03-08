import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ContentWizard from '../components/social/ContentWizard';
import { supabase } from '../lib/supabase';
import { MessageSquare, Brain, Plus } from 'lucide-react';

const SocialMediaAI: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.from('social_posts').select('*').eq('user_id', user?.id);
      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, [user?.id]);

  if (loading) return <div>Loading social posts...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Social Media AI Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowWizard(true)}
            className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Plus size={18} /><span>Create Post</span>
          </button>
          <button
            className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Brain size={18} /><span>AI Optimize</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold">{post.content.slice(0, 50)}...</h3>
            <p className="text-gray-600">Platform: {post.platform} | Status: {post.status}</p>
            <p className="text-gray-600">Scheduled: {new Date(post.scheduled_for).toLocaleString()}</p>
            <button
              className="mt-2 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
            >
              <MessageSquare size={18} /><span>Post Now</span>
            </button>
          </div>
        ))}
      </div>
      {showWizard && <ContentWizard onClose={() => setShowWizard(false)} />}
    </div>
  );
};

export default SocialMediaAI;