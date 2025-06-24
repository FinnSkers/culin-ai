import { config } from 'dotenv';
import { modelMapping, AIFlow } from './model-mapping';
config();

export interface LLMConfig {
  apiKey: string;
  model: string;
}

export const getLLMConfig = (): LLMConfig => {
  return {
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY_LLM || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
    model: process.env.NEXT_PUBLIC_OPENROUTER_MODEL_LLM || process.env.NEXT_PUBLIC_OPENROUTER_MODEL || '',
  };
};

export const getFallbackLLMConfig = (): LLMConfig => {
  return {
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY_FALLBACK || '',
    model: process.env.NEXT_PUBLIC_OPENROUTER_MODEL_FALLBACK || '',
  };
};

/**
 * Calls the OpenRouter LLM with static model routing and fallback logic.
 * @param prompt - The prompt to send to the LLM.
 * @param flow - The AI flow/task name (for model selection).
 * @param config - Optional override for LLMConfig.
 */
export async function callLLM({ prompt, flow, config }: { prompt: string; flow: AIFlow; config?: LLMConfig }) {
  const apiKey = config?.apiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY_LLM || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
  const models = modelMapping[flow]?.models || [config?.model || process.env.NEXT_PUBLIC_OPENROUTER_MODEL_LLM || process.env.NEXT_PUBLIC_OPENROUTER_MODEL || ''];
  let lastError: any = null;
  for (const model of models) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!response.ok) throw new Error(`OpenRouter API error for model ${model}`);
      return await response.json();
    } catch (err) {
      lastError = err;
      // Try next model in the list
    }
  }
  // Fallback to fallback API key/model if available
  const fallbackApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY_FALLBACK || '';
  const fallbackModel = process.env.NEXT_PUBLIC_OPENROUTER_MODEL_FALLBACK || '';
  if (fallbackApiKey && fallbackModel && (!config || config.apiKey !== fallbackApiKey)) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${fallbackApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: fallbackModel,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!response.ok) throw new Error('OpenRouter API fallback error');
      return await response.json();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('All OpenRouter models failed');
}

// Utility to sanitize LLM output for JSON.parse
export function sanitizeLLMJson(content: string): string {
  // Remove Markdown code block markers and trim
  return content.replace(/^```[a-zA-Z]*\n?|```$/g, '').trim();
}
