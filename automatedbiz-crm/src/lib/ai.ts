import { supabase } from './supabase';
import * as tf from '@tensorflow/tfjs';
import { HuggingFaceInference } from 'huggingface.js'; // Hypothetical; use Hugging Face Transformers via WebAssembly or Node.js

interface AIError extends Error {
  code: string;
  retryable: boolean;
}

class AIGenerationError extends Error implements AIError {
  code: string;
  retryable: boolean;

  constructor(message: string, code: string, retryable = false) {
    super(message);
    this.name = 'AIGenerationError';
    this.code = code;
    this.retryable = retryable;
  }
}

export const ai = {
  async generateContent({ type, userId, goal, platform, segmentId, companyId }: {
    type: 'ad' | 'email' | 'social' | 'blog' | 'video_script' | 'voiceover';
    userId: string;
    goal: string;
    platform?: string;
    segmentId?: string;
    companyId?: string;
  }) {
    try {
      let prompt = '';
      let contentStructure: any = {};

      const { data: company } = companyId ? await supabase.from('company_profiles').select('brand_voice, target_audience').eq('id', companyId).single() : { data: null };
      const { data: segment } = segmentId ? await supabase.from('customer_segments').select('criteria').eq('id', segmentId).single() : { data: null };

      switch (type) {
        case 'video_script':
          prompt = `Generate a ${platform || 'business'} video script for ${goal}. Company: ${company?.brand_voice?.name || 'Generic'}, Audience: ${segment?.criteria?.demographics || 'All'}, Length: 60 seconds, include a CTA.`;
          contentStructure = { content: '' };
          break;
        case 'voiceover':
          prompt = `Generate a natural-sounding voiceover script for ${goal}. Use a professional tone, 60 seconds long.`;
          contentStructure = { content: '' };
          break;
        // ... existing cases (ad, email, social, blog) ...
      }

      // Use Hugging Face Transformers (open-source, free) for text generation
      // Mock implementation; in production, use WebAssembly or Node.js bindings
      const hf = new HuggingFaceInference('https://api-inference.huggingface.co/models/gpt2');
      const response = await hf.textGeneration({ inputs: prompt, parameters: { max_length: 200 } });
      const content = response[0].generated_text || '';

      const parsedContent = JSON.parse(content) || contentStructure;
      Object.keys(contentStructure).forEach(key => {
        parsedContent[key] = parsedContent[key] || contentStructure[key];
      });

      await supabase.from('analytics_events').insert({
        user_id: userId,
        type: 'ai_content_generated',
        data: { type, goal, platform, segmentId, companyId, content: parsedContent },
        timestamp: new Date().toISOString(),
      });

      return parsedContent;
    } catch (error: any) {
      if (error.status === 429) throw new AIGenerationError('Rate limit exceeded.', 'RATE_LIMIT_EXCEEDED', true);
      throw new AIGenerationError('Failed to generate content', 'GENERATION_FAILED', false);
    }
  },

  async withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
    let lastError: Error;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (!(error as AIError).retryable || i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
    throw lastError!;
  },
};