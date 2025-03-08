import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  post: { id: string; title: string; excerpt: string; slug: string; publish_date: string };
}

const BlogPostCard: React.FC<Props> = ({ post }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <h3 className="text-lg font-semibold">{post.title}</h3>
    <p className="text-gray-600 mt-2">{post.excerpt}</p>
    <Link to={`/blog/post/${post.slug}`} className="text-[#FF3366] mt-2 inline-block">Read More</Link>
    <p className="text-sm text-gray-500 mt-2">{new Date(post.publish_date).toLocaleDateString()}</p>
  </div>
);

export default BlogPostCard;