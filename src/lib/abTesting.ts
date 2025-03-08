import { supabase } from './supabase';

export interface Variant {
  id: string;
  name: string;
  content: any;
  weight: number;
}

export interface Test {
  id: string;
  name: string;
  description: string;
  variants: Variant[];
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed';
  metrics: string[];
}

export interface TestResult {
  variantId: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
}

class ABTesting {
  async createTest(test: Omit<Test, 'id'>) {
    const { data, error } = await supabase
      .from('ab_tests')
      .insert([test])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getActiveTest(elementId: string): Promise<Test | null> {
    const { data, error } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('status', 'active')
      .eq('element_id', elementId)
      .single();
    if (error) return null;
    return data;
  }

  async recordImpression(testId: string, variantId: string) {
    const { error } = await supabase
      .from('ab_test_impressions')
      .insert([{ test_id: testId, variant_id: variantId, timestamp: new Date().toISOString() }]);
    if (error) throw error;
  }

  async recordConversion(testId: string, variantId: string) {
    const { error } = await supabase
      .from('ab_test_conversions')
      .insert([{ test_id: testId, variant_id: variantId, timestamp: new Date().toISOString() }]);
    if (error) throw error;
  }

  async getTestResults(testId: string): Promise<TestResult[]> {
    const { data: test, error: testError } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('id', testId)
      .single();
    if (testError) throw testError;

    const { data: impressions, error: impressionsError } = await supabase
      .from('ab_test_impressions')
      .select('variant_id, count')
      .eq('test_id', testId);
    if (impressionsError) throw impressionsError;

    const { data: conversions, error: conversionsError } = await supabase
      .from('ab_test_conversions')
      .select('variant_id, count')
      .eq('test_id', testId);
    if (conversionsError) throw conversionsError;

    return test.variants.map(variant => {
      const variantImpressions = impressions.find(i => i.variant_id === variant.id)?.count || 0;
      const variantConversions = conversions.find(c => c.variant_id === variant.id)?.count || 0;
      const conversionRate = variantImpressions > 0 ? variantConversions / variantImpressions : 0;

      return {
        variantId: variant.id,
        impressions: variantImpressions,
        conversions: variantConversions,
        conversionRate,
        confidence: this.calculateConfidence(variantImpressions, variantConversions),
      };
    });
  }

  private calculateConfidence(impressions: number, conversions: number): number {
    if (impressions === 0) return 0;
    const p = conversions / impressions;
    const standardError = Math.sqrt((p * (1 - p)) / impressions);
    return Math.min(1, 1.96 * standardError);
  }
}

export const abTesting = new ABTesting();