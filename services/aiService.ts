import { SleepData } from '../types/database';
import { config } from '../lib/config';

const OPENAI_API_KEY = config.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Missing OpenAI API key');
}

export const aiService = {
  async generateResponse(prompt: string, sleepData: SleepData[] | null = null): Promise<string> {
    try {
      const latestSleep = sleepData?.[0];
      const sleepSummary = latestSleep ? 
        `On ${new Date(latestSleep.date).toLocaleDateString()}, you slept for ${latestSleep.sleep_duration?.toFixed(1) ?? 'unknown'} hours total, including ${latestSleep.deep_sleep_duration?.toFixed(1) ?? 'unknown'} hours of deep sleep and ${latestSleep.rem_sleep_duration?.toFixed(1) ?? 'unknown'} hours of REM sleep. Your resting heart rate was ${latestSleep.resting_heart_rate ?? 'unknown'} bpm.` 
        : 'No sleep data available.';

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a sleep analysis assistant. Your role is to help users understand their sleep patterns and provide actionable advice for improvement. Be concise and specific in your responses.`
            },
            {
              role: 'user',
              content: `Sleep Data: ${sleepSummary}\n\nQuestion: ${prompt}`
            }
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate response');
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();

    } catch (error) {
      console.error('AI Service error:', error);
      throw new Error('Failed to generate response. Please try again later.');
    }
  }
}; 