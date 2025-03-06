export interface CustomerSegment {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  criteria: Record<string, any>;
  rules: {
    operator: 'AND' | 'OR';
    conditions: any[];
  };
  size: number;
  engagement: {
    emailOpenRate: number;
    clickThroughRate: number;
    conversionRate: number;
    averageResponse: number;
  };
  created_at: string;
  updated_at: string;
}