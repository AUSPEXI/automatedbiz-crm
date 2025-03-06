export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'post' | 'comment' | 'reaction' | 'feature' | 'special';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  criteria?: Record<string, any>;
  progress?: Record<string, any>;
  unlockedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'contribution' | 'expertise' | 'influence' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

export interface UserReputation {
  total: number;
  level: number;
  rank: string;
  nextLevel: {
    points: number;
    remaining: number;
  };
  history: {
    id: string;
    action: string;
    points: number;
    timestamp: string;
  }[];
}