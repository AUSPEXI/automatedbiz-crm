const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async () => {
  try {
    const now = new Date().toISOString();
    const { data: posts, error: postsError } = await supabase
      .from('social_posts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now);

    if (postsError) throw postsError;

    for (const post of posts) {
      // Simulate posting to social media platform (e.g., Buffer API call)
      console.log(`Posting to ${post.platform}: ${post.content}`);

      await supabase
        .from('social_posts')
        .update({ status: 'published', published_at: now })
        .eq('id', post.id);

      await supabase.from('analytics_events').insert({
        user_id: post.user_id,
        type: 'social_post_published',
        data: { post_id: post.id, platform: post.platform },
        timestamp: now,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Content scheduled successfully', posts: posts.length }),
    };
  } catch (error) {
    console.error('Error scheduling content:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to schedule content' }),
    };
  }
};