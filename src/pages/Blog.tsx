import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import BlogPostCard from '../components/blog/BlogPostCard';
import BlogAIWizard from '../components/blog/BlogAIWizard';
import VideoProductionWizard from '../components/video/VideoProductionWizard';
import { supabase } from '../lib/supabase';
import { Plus, Brain, Video } from 'lucide-react';

const Blog: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [showBlogWizard, setShowBlogWizard] = useState(false);
  const [showVideoWizard, setShowVideoWizard] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.from('blog_posts').select('*').eq('user_id', user?.id).range((page - 1) * 10, page * 10 - 1);
      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, [user?.id, page]);

  if (loading) return <div>Loading blog posts...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blog Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowBlogWizard(true)}
            className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Plus size={18} /><span>Create Post</span>
          </button>
          <button
            onClick={() => setShowVideoWizard(true)}
            className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Video size={18} /><span>Create Video</span>
          </button>
          <button
            className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
          >
            <Brain size={18} /><span>AI Suggestions</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => <BlogPostCard key={post.id} post={post} />)}
      </div>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Next
        </button>
      </div>
      {showBlogWizard && <BlogAIWizard onClose={() => setShowBlogWizard(false)} />}
      {showVideoWizard && <VideoProductionWizard onClose={() => setShowVideoWizard(false)} />}
    </div>
  );
};

export default Blog;