import { supabase } from './supabase';

export async function awardPoints(
  userId: string,
  points: number,
  action: string,
  referenceType: string,
  referenceId: string,
) {
  try {
    const { data: user, error: userError } = await supabase
      .from('auth.users')
      .select('reputation, level')
      .eq('id', userId)
      .single();
    if (userError) throw userError;

    const newReputation = (user?.reputation || 0) + points;

    const { data: nextLevel } = await supabase
      .from('reputation_levels')
      .select('level, points_required')
      .lte('points_required', newReputation)
      .order('level', { ascending: false })
      .limit(1)
      .single();

    const { error: updateError } = await supabase
      .from('auth.users')
      .update({ reputation: newReputation, level: nextLevel?.level || user?.level })
      .eq('id', userId);
    if (updateError) throw updateError;

    const { error: historyError } = await supabase
      .from('reputation_history')
      .insert({ user_id: userId, points, action, reference_type: referenceType, reference_id: referenceId });
    if (historyError) throw historyError;

    await checkAchievements(userId);
    await checkBadges(userId);

    return { newReputation, newLevel: nextLevel?.level };
  } catch (error) {
    console.error('Failed to award points:', error);
    throw error;
  }
}

async function checkAchievements(userId: string) {
  const { data: achievements } = await supabase.from('achievements').select('*');
  if (!achievements) return;

  for (const achievement of achievements) {
    const criteria = achievement.criteria as Record<string, number>;
    let criteriaMatch = true;

    for (const [key, value] of Object.entries(criteria)) {
      const { count } = await supabase
        .from(key === 'posts' ? 'community_posts' : key === 'helpful_reactions' ? 'community_reactions' : 'feature_requests')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq(key === 'helpful_reactions' ? 'type' : 'status', key === 'helpful_reactions' ? 'helpful' : 'accepted');
      if (!count || count < value) {
        criteriaMatch = false;
        break;
      }
    }

    if (criteriaMatch) {
      const { count } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id);
      if (!count) {
        await supabase
          .from('user_achievements')
          .insert({ user_id: userId, achievement_id: achievement.id, unlocked_at: new Date().toISOString() });
        await awardPoints(userId, achievement.points, `Unlocked achievement: ${achievement.name}`, 'achievement', achievement.id);
      }
    }
  }
}

async function checkBadges(userId: string) {
  const { data: badges } = await supabase.from('badges').select('*');
  if (!badges) return;

  for (const badge of badges) {
    const criteria = badge.criteria as Record<string, number>;
    let criteriaMatch = true;

    for (const [key, value] of Object.entries(criteria)) {
      if (key === 'reputation') {
        const { data: user } = await supabase
          .from('auth.users')
          .select('reputation')
          .eq('id', userId)
          .single();
        if (!user || user.reputation < value) {
          criteriaMatch = false;
          break;
        }
      } else if (key === 'achievements') {
        const { count } = await supabase
          .from('user_achievements')
          .select('*', { count: 'exact' })
          .eq('user_id', userId);
        if (!count || count < value) {
          criteriaMatch = false;
          break;
        }
      } else {
        const { count } = await supabase
          .from(key === 'posts' ? 'community_posts' : 'feature_requests')
          .select('*', { count: 'exact' })
          .eq('user_id', userId);
        if (!count || count < value) {
          criteriaMatch = false;
          break;
        }
      }
    }

    if (criteriaMatch) {
      const { count } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('badge_id', badge.id);
      if (!count) {
        await supabase
          .from('user_badges')
          .insert({ user_id: userId, badge_id: badge.id, unlocked_at: new Date().toISOString() });
      }
    }
  }
}