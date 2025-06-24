'use server';
/**
 * @fileOverview A safety alert AI agent for detecting kitchen accidents.
 *
 * - getSafetyAlert - A function that handles the safety alert process.
 * - SafetyAlertInput - The input type for the getSafetyAlert function.
 * - SafetyAlertOutput - The return type for the getSafetyAlert function.
 */

import { getLLMConfig, callLLM } from '@/ai/openrouter';
import { AIFlow } from '@/ai/model-mapping';
import { sanitizeLLMJson } from '@/ai/openrouter';

export type SafetyAlertInput = {
  photoDataUri: string;
};
export type SafetyAlertOutput = {
  alertType: string;
  severity: string;
  instructions: string;
};

/**
 * Detects kitchen safety hazards from an image using the OpenRouter LLM.
 * @param input - { photoDataUri: string }
 * @returns { alertType, severity, instructions }
 */
export async function getSafetyAlert(input: SafetyAlertInput): Promise<SafetyAlertOutput> {
  const prompt = `You are a kitchen safety expert. Analyze the following image (data URI) and return ONLY a JSON object with these fields:\n{\n  \"alertType\": string,\n  \"severity\": string,\n  \"instructions\": string\n}\nIf no alert is detected, use \"none\" for alertType and severity, and an empty string for instructions.\n\nImage: ${input.photoDataUri}\n\nJSON:`;
  let output: SafetyAlertOutput = { alertType: 'none', severity: 'none', instructions: '' };
  try {
    const result = await callLLM({ prompt, flow: 'getSafetyAlert' });
    const content = result.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(sanitizeLLMJson(content));
    if (
      typeof parsed.alertType === 'string' &&
      typeof parsed.severity === 'string' &&
      typeof parsed.instructions === 'string'
    ) {
      output = parsed;
    } else {
      throw new Error('Invalid LLM output shape');
    }
  } catch (err) {
    // Optionally log error for debugging
    console.error('getSafetyAlert error:', err);
    // output remains as safe fallback
  }
  return output;
}
