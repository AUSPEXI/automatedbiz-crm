import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';
import type { Achievement, Badge, UserReputation } from '../types/gamification';

export function useGamification() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchGamificationData() {
      try {
        const [achievementsData, badgesData, userData, historyData, nextLevelData] = await Promise.all([
          supabase
            .from('user_achievements')
            .select('*, achievement:achievements(*)')
            .eq('user_id', user.id),
          supabase
            .from('user_badges')
            .select('*, badge:badges(*)')
            .eq('user_id', user.id),
          supabase
            .from('auth.users')
            .select('reputation, level')
            .eq('id', user.id)
            .single(),
          supabase
            .from('reputation_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('reputation_levels')
            .select('*')
            .gt('level', userData?.level || 1)
            .order('level', { ascending: true })
            .limit(1)
            .single(),
        ]);

        setAchievements(achievementsData.data?.map(ua => ({
          id: ua.achievement.id,
          name: ua.achievement.name,
          description: ua.achievement.description,
          icon: ua.achievement.icon,
          type: ua.achievement.type,
          level: ua.achievement.level,
          points: ua.achievement.points,
          criteria: ua.achievement.criteria,
          progress: ua.progress,
          unlockedAt: ua.unlocked_at,
        })) || []);

        setBadges(badgesData.data?.map(ub => ({
          id: ub.badge.id,
          name: ub.badge.name,
          description: ub.badge.description,
          icon: ub.badge.icon,
          category: ub.badge.category,
          rarity: ub.badge.rarity,
          criteria: ub.badge.criteria,
          unlockedAt: ub.unlocked_at,
        })) || []);

        if (userData && nextLevelData.data) {
          setReputation({
            total: userData.reputation || 0,
            level: userData.level || 1,
            rank: nextLevelData.data.title,
            nextLevel: {
              points: nextLevelData.data.points_required,
              remaining: nextLevelData.data.points_required - (userData.reputation || 0),
            },
            history: historyData.data?.map(h => ({
              id: h.id,
              action: h.action,
              points: h.points,
              timestamp: h.created_at,
            })) || [],
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching gamification data:', error);
        setLoading(false);
      }
    }

    fetchGamificationData();

    const subscription = supabase
      .channel('gamification_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_achievements', filter: `user_id=eq.${user.id}` }, () => fetchGamificationData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_badges', filter: `user_id=eq.${user.id}` }, () => fetchGamificationData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reputation_history', filter: `user_id=eq.${user.id}` }, () => fetchGamificationData())
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return { achievements, badges, reputation, loading };
}