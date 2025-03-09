import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Users, MessageSquare, Plus, ThumbsUp, ArrowUp } from 'lucide-react';

const Community: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [activeTab, setActiveTab] = useState<'posts' | 'features'>('posts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [postsData, featuresData] = await Promise.all([
        supabase.from('community_posts').select('*, user:users(full_name)').eq('status', 'published'),
        supabase.from('feature_requests').select('*, user:users(full_name)').eq('user_id', user?.id),
      ]);
      setPosts(postsData.data || []);
      setFeatures(featuresData.data || []);
      setLoading(false);
    };
    fetchData();
  }, [user?.id]);

  const handlePost = async () => {
    if (!newPost.title || !newPost.content) return;
    await supabase.from('community_posts').insert({
      user_id: user?.id,
      title: newPost.title,
      content: newPost.content,
      type: 'discussion',
      status: 'published',
    });
    setNewPost({ title: '', content: '' });
    fetchData();
  };

  const handleVote = async (featureId: string) => {
    await supabase.from('feature_votes').insert({ feature_id: featureId, user_id: user?.id });
    fetchData();
  };

  if (loading) return <div>Loading community...</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Community</h1>
      <div className="flex gap-4 mb-4">
        <button onClick={() => setActiveTab('posts')} className={`px-4 py-2 ${activeTab === 'posts' ? 'bg-[#FF3366] text-white' : 'bg-gray-200'}`}>Posts</button>
        <button onClick={() => setActiveTab('features')} className={`px-4 py-2 ${activeTab === 'features' ? 'bg-[#FF3366] text-white' : 'bg-gray-200'}`}>Features</button>
      </div>
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              placeholder="Post Title"
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="Share your thoughts..."
              className="w-full p-2 border rounded mb-2"
            />
            <button
              onClick={handlePost}
              className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
            >
              <Plus size={18} /><span>Post</span>
            </button>
          </div>
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <p className="text-gray-600">{post.content}</p>
              <p className="text-gray-500 text-sm">By {post.user.full_name} on {new Date(post.created_at).toLocaleDateString()}</p>
              <button className="mt-2 px-2 py-1 bg-gray-100 rounded flex items-center gap-1"><ThumbsUp size={16} /> Like</button>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'features' && (
        <div className="space-y-4">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
              <p className="text-gray-500 text-sm">By {feature.user.full_name} | Status: {feature.status}</p>
              <button
                onClick={() => handleVote(feature.id)}
                className="mt-2 px-2 py-1 bg-gray-100 rounded flex items-center gap-1"
              >
                <ArrowUp size={16} /> Vote
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;