import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const orgId = import.meta.env.VITE_OPENAI_ORG_ID;

if (!apiKey) console.warn('Missing OpenAI API key. AI features will be disabled.');

export const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
  organization: orgId === 'auto' ? undefined : orgId,
  dangerouslyAllowBrowser: true,
});

export const isOpenAIConfigured = () => !!apiKey && apiKey !== 'your_openai_api_key';

export const getMockAIResponse = (topic: string) => ({
  choices: [{
    message: {
      content: `# ${topic}

## Introduction
This is a sample blog post about ${topic} for development purposes.

## Main Points
1. Key point 1
2. Key point 2
3. Key point 3

## Analysis
Analysis of ${topic} for businesses.

## Best Practices
- Practice 1
- Practice 2
- Practice 3

## Conclusion
${topic} is crucial for businesses.`
    }
  }],
});

export const handleAIError = (error: any): Error => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.error?.message || 'Unknown API error';
    if (status === 401) return new Error('Invalid OpenAI API key.');
    if (status === 429) return new Error('Rate limit exceeded. Try again later.');
    if (status === 500) return new Error('OpenAI service error. Try again later.');
    return new Error(`OpenAI API error: ${message}`);
  }
  if (error.code === 'ECONNREFUSED') return new Error('Could not connect to OpenAI API.');
  return error instanceof Error ? error : new Error('Unexpected error occurred');
};