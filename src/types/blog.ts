export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  category_id?: string;
  status: 'draft' | 'published' | 'scheduled';
  publish_date?: string;
  seo_title?: string;
  seo_description?: string;
  author_id: string;
  ai_generated: boolean;
  ai_prompt?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}