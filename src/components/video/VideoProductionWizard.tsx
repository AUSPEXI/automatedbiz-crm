import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ai, aiInsightsService } from '../../lib/ai';
import { supabase } from '../../lib/supabase';
import { useReport } from '../../hooks/useRealtimeMetric';
import { useGamification } from '../../hooks/useGamification';
import { Wand2, X, Play, Edit, Award } from 'lucide-react';
import { VideoProduction } from '../../types/video';

interface Props {
  onClose: () => void;
}

const VideoProductionWizard: React.FC<Props> = ({ onClose }) => {
  const { user } = useAuth();
  const { awardPoints } = useGamification();
  const [goal, setGoal] = useState('');
  const [audience, setAudience] = useState('');
  const [productId, setProductId] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState<VideoProduction | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const { value: videoPerformance, loading: performanceLoading } = useReport('video_engagement');

  useEffect(() => {
    const fetchData = async () => {
      const [prodData, segData] = await Promise.all([
        supabase.from('company_products').select('id, name, features, benefits').eq('company_id', user?.id),
        supabase.from('customer_segments').select('id, name, criteria').eq('user_id', user?.id),
      ]);
      setProducts(prodData.data || []);
      setSegments(segData.data || []);
    };
    fetchData();
  }, [user?.id]);

  const handleGenerate = async () => {
    if (!goal || !audience || !productId) {
      alert('Please fill in all required fields. Ensure FFmpeg and Coqui TTS are installed locally.');
      return;
    }
    setLoading(true);
    try {
      const { data: company } = await supabase
        .from('company_profiles')
        .select('brand_voice, target_audience, content_preferences')
        .eq('user_id', user?.id)
        .single();
      const { data: product } = await supabase
        .from('company_products')
        .select('name, features, benefits')
        .eq('id', productId)
        .single();
      const { data: segment } = await supabase
        .from('customer_segments')
        .select('criteria, engagement')
        .eq('id', audience)
        .single();

      const script = await ai.generateContent({
        type: 'video_script',
        userId: user?.id || '',
        goal: `Create a ${platform} video for ${goal} targeting ${segment?.name || 'general audience'}, promoting ${product?.name} with brand voice: ${JSON.stringify(company?.brand_voice || '{}')}`,
        platform,
        segmentId: audience,
        companyId: user?.id || '',
      });

      const visuals = {
        images: product?.features?.map((f: string) => `https://via.placeholder.com/1280x720.png?text=${f}`) || ['https://via.placeholder.com/1280x720.png?text=Video+Preview'],
        template: 'business-marketing',
        cta: `Visit our ${platform === 'youtube' ? 'YouTube channel' : platform} for more!`,
        brandColor: company?.brand_voice?.color || '#FF3366',
        font: company?.content_preferences?.font || 'Arial',
      };
      const voiceover = await ai.generateContent({
        type: 'voiceover',
        userId: user?.id || '',
        goal: script.content || script,
      });

      const videoData = await videoProductionService.generateVideo({
        script: script.content || script,
        visuals,
        voiceover: voiceover.content || voiceover,
        platform,
      });
      setVideo({
        id: `vid-${Date.now()}`,
        title: `${goal} - ${product?.name}`,
        type: platform,
        content: script.content || script,
        status: 'generated',
        url: videoData.url,
        analytics: { views: 0, engagement: 0, conversions: 0 },
        createdAt: new Date().toISOString(),
      });

      await supabase.from('video_productions').insert({
        user_id: user?.id,
        title: `${goal} - ${product?.name}`,
        type: platform,
        content: script.content || script,
        status: 'generated',
        analytics: { views: 0, engagement: 0, conversions: 0 },
        created_at: new Date().toISOString(),
      });

      await supabase.from('analytics_events').insert({
        user_id: user?.id,
        type: 'video_generated',
        data: { goal, platform, productId, audience, performance: videoPerformance },
        timestamp: new Date().toISOString(),
      });

      await awardPoints(user?.id || '', 100, 'Created Marketing Video', 'video', `vid-${Date.now()}`);
    } catch (err) {
      console.error('Error generating video:', err);
      alert('Failed to generate video. Ensure FFmpeg and Coqui TTS are installed locally and configured correctly.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!video) return;
    // Mock in-browser editor (in production, build a React component with Canvas)
    alert(`Editing video at ${video.url}. Use our free editor to tweak script: "${video.content}"`);
    // Example: Build a simple editor with HTML5 Canvas or react-player for drag-and-drop
  };

  const handlePublish = async () => {
    if (!video) return;
    try {
      await supabase.from('video_productions').update({ status: 'published' }).eq('id', video.id);
      await supabase.from('analytics_events').insert({
        user_id: user?.id,
        type: 'video_published',
        data: { url: video.url, platform: video.type },
        timestamp: new Date().toISOString(),
      });
      alert(`Video published to ${video.type}! Check analytics for performance.`);

      // Optimize based on analytics
      await videoProductionService.optimizeVideo(video.id, video.analytics);
    } catch (err) {
      console.error('Error publishing video:', err);
      alert('Failed to publish video. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Generate Business Marketing Video (Free, Open-Source)</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Video goal (e.g., Promote Product X, Showcase Case Study Y)"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#FF3366]"
          />
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#FF3366]"
          >
            <option value="">Select Target Audience/Segment</option>
            {segments.map((seg) => <option key={seg.id} value={seg.id}>{seg.name}</option>)}
          </select>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#FF3366]"
          >
            <option value="">Select Product/Service</option>
            {products.map((prod) => <option key={prod.id} value={prod.id}>{prod.name}</option>)}
          </select>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#FF3366]"
          >
            <option value="youtube">YouTube</option>
            <option value="website">Website</option>
            <option value="funnel">Funnel Page</option>
            <option value="blog">Blog</option>
            <option value="social">Social Media</option>
          </select>
          <button
            onClick={handleGenerate}
            disabled={loading || !goal || !audience || !productId}
            className="w-full px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center justify-center space-x-2 transition-all"
          >
            {loading ? 'Generating...' : <><Wand2 size={18} /><span>Generate Video (Free)</span></>}
          </button>
          {video && (
            <div className="mt-4 space-y-4">
              <video controls src={video.url} className="w-full rounded-lg shadow-md" poster="https://via.placeholder.com/1280x720.png?text=Video+Preview" />
              <div className="flex gap-4">
                <button
                  onClick={handleEdit}
                  className="flex-1 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center justify-center space-x-2 transition-all"
                >
                  <Edit size={18} /><span>Edit Video (Free Editor)</span>
                </button>
                <button
                  onClick={handlePublish}
                  className="flex-1 px-4 py-2 bg-[#FF3366] text-white rounded-lg hover:bg-[#E62E5C] flex items-center justify-center space-x-2 transition-all"
                >
                  <Play size={18} /><span>Publish to {video.type}</span>
                </button>
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-2"><Award size={16} /> Earned 100 points for creating this video!</p>
            </div>
          )}
          {!performanceLoading && videoPerformance && (
            <div className="mt-4 bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">AI Recommendation: Based on analytics, optimize video length to {videoPerformance.optimal_duration || 60}s for {platform} to increase engagement by {videoPerformance.engagement_boost || 10}%.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoProductionWizard;