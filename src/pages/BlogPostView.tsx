import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { blogService } from '../lib/blog';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const BlogPostView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const data = await blogService.getPostBySlug(slug);
      setPost(data);
      setLoading(false);
      supabase.from('analytics_events').insert({
        type: 'blog_view',
        data: { post_id: data?.id, slug },
        timestamp: new Date().toISOString(),
      });
    };
    fetchPost();
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="space-y-6 p-6">
      <button onClick={() => window.history.back()} className="flex items-center gap-2 text-[#FF3366] hover:text-[#E62E5C]">
        <ArrowLeft size={18} /> Back
      </button>
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="text-gray-600">Published: {new Date(post.publish_date).toLocaleDateString()}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} className="prose max-w-none" />
    </div>
  );
};

export default BlogPostView;