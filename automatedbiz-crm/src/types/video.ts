export interface VideoProduction {
  id: string;
  title: string;
  type: 'youtube' | 'website' | 'funnel' | 'blog' | 'social';
  content: string;
  status: 'draft' | 'generated' | 'published';
  url?: string;
  analytics: {
    views: number;
    engagement: number;
    conversions: number;
  };
  createdAt: string;
}