import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { blogService } from '../lib/blog';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, X } from 'lucide-react';

const BlogEditor: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Partial<any>>({ title: '', content: '', status: 'draft' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (id === 'new') {
        setLoading(false);
        return;
      }
      const data = await blogService.getPostBySlug(id!);
      setPost(data || {});
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  const handleSave = async () => {
    try {
      if (id === 'new') {
        await blogService.createPost({ ...post, user_id: user?.id });
      } else {
        await blogService.updatePost(id!, post);
      }
      navigate('/blog');
    } catch (err) {
      console.error('Error saving post:', err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{id === 'new' ? 'New Post' : 'Edit Post'}</h1>
        <button onClick={() => navigate('/blog')} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
      </div>
      <input
        type="text"
        value={post.title}
        onChange={(e) => setPost({ ...post, title: e.target.value })}
        placeholder="Title"
        className="w-full p-2 border rounded mb-4"
      />
      <textarea
        value={post.content}
        onChange={(e) => setPost({ ...post, content: e.target.value })}
        placeholder="Content"
        className="w-full p-2 border rounded mb-4 h-64"
      />
      <select
        value={post.status}
        onChange={(e) => setPost({ ...post, status: e.target.value })}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="scheduled">Scheduled</option>
      </select>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center space-x-2"
      >
        <Save size={18} /><span>Save Post</span>
      </button>
    </div>
  );
};

export default BlogEditor;