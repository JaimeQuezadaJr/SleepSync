import { config } from '../lib/config';
import { SleepData } from '../types/database';

// Replace with your computer's actual IP address
const OLLAMA_URL = "http://10.0.0.171:11434/api/generate";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const aiService = {
  // Keep track of conversation history
  conversationHistory: [] as Message[],
  lastContext: null as any, // Store Ollama's context

  async generateResponse(prompt: string, sleepData: SleepData[] | null = null): Promise<string> {
    try {
      // Format sleep data into readable context
      let sleepContext = '';
      if (sleepData && sleepData.length > 0) {
        sleepContext = `Here is your recent sleep data:\n${sleepData.map(day => 
          `Date: ${new Date(day.date).toLocaleDateString()}
           - Total Sleep: ${day.sleep_duration?.toFixed(1) ?? 'unknown'} hours
           - Deep Sleep: ${day.deep_sleep_duration?.toFixed(1) ?? 'unknown'} hours
           - REM Sleep: ${day.rem_sleep_duration?.toFixed(1) ?? 'unknown'} hours
           - Light Sleep: ${day.light_sleep_duration?.toFixed(1) ?? 'unknown'} hours
           - Resting Heart Rate: ${day.resting_heart_rate ?? 'unknown'} bpm`
        ).join('\n')}\n\n`;
      }

      // Combine sleep context with user prompt
      const fullPrompt = sleepContext + prompt;

      // Add user message to history
      this.conversationHistory.push({ role: 'user', content: fullPrompt });

      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama3.2",
          prompt: fullPrompt,
          context: this.lastContext, // Send previous context
          stream: false
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Ollama API error:', error);
        throw new Error('Failed to generate response');
      }

      const data = await response.json();
      
      // Store the new context for next message
      this.lastContext = data.context;
      
      // Add assistant response to history
      this.conversationHistory.push({ role: 'assistant', content: data.response });

      return data.response;

    } catch (error) {
      console.error('AI Service error:', error);
      throw new Error('Failed to connect to Ollama. Please check your network settings.');
    }
  },

  // Method to clear conversation history
  clearConversation() {
    this.conversationHistory = [];
    this.lastContext = null;
  }
};