'use server';

/**
 * @fileOverview Implements a robust voice-first interaction for the CulinAI app.
 *
 * - voiceCommand - A function that processes voice commands related to cooking.
 */

import { getLLMConfig, callLLM, sanitizeLLMJson } from '@/ai/openrouter';
import { AIFlow } from '@/ai/model-mapping';
import wav from 'wav';
import { generateRecipeImage } from './generate-recipe-image';

// Removed Genkit/zod code and imports for model-agnostic use
// Define plain TypeScript types for all inputs/outputs
export type VoiceCommandInput = {
  command: string;
  recipeInstructions?: string;
  currentStep?: number;
  // generateAudio?: boolean;
  // voiceName?: string;
};
export type VoiceCommandOutput = {
  response: string;
  // audioResponse?: string;
  action: string;
  recipe?: GenerateRecipeOutput;
};
export type GenerateRecipeOutput = {
  recipeName: string;
  ingredients: string;
  instructions: string;
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  photoDataUri?: string;
};

export async function voiceCommand(input: VoiceCommandInput): Promise<VoiceCommandOutput> {
  return voiceCommandFlow(input);
}

// Replace all ai.definePrompt/ai.defineFlow logic with OpenRouter LLM abstraction and plain types
// This file will need a more detailed refactor for each prompt/flow, but here is a starting point:

// Example: intent classification
export async function classifyIntent(command: string, inRecipe: boolean): Promise<string> {
  const prompt = `Classify the user's intent based on their command and whether they are currently in a recipe.\n\nCommand: "${command}"\nIn Recipe: ${inRecipe}\nPossible actions: next, previous, repeat, scanIngredients, safetyAlert, createRecipe, startCooking, none.\nRespond with only the action.`;
  const result = await callLLM({ prompt, flow: 'voiceCommand' });
  return (result.choices?.[0]?.message?.content || '').trim();
}

// General cooking question
export async function answerGeneralCookingQuestion(command: string, recipeContext?: string): Promise<string> {
  const prompt = `You are a witty, slightly edgy AI cooking assistant. Answer the user's general cooking question with some personality.\n${recipeContext ? `Recipe Context: ${recipeContext}\n` : ''}User's Question: "${command}"\nYour Answer:`;
  const result = await callLLM({ prompt, flow: 'voiceCommand' });
  return (result.choices?.[0]?.message?.content || '').trim();
}

// Recipe parser
export async function parseRecipeFromDictation(command: string): Promise<any> {
  const prompt = `You are a recipe parsing expert. A user has dictated a recipe conversationally. Your job is to extract the recipe name, a newline-separated list of ingredients, and a newline-separated list of instructions. Be intelligent about parsing quantities and steps. If nutrition information isn't provided, generate a reasonable estimate for a standard serving. The user's dictation is: "${command}". Return the result as JSON.`;
  const result = await callLLM({ prompt, flow: 'voiceCommand' });
  try {
    return JSON.parse(sanitizeLLMJson(result.choices?.[0]?.message?.content || '{}'));
  } catch {
    return {};
  }
}


// This flow now contains the robust logic for generating responses.
async function voiceCommandFlow(input: VoiceCommandInput): Promise<VoiceCommandOutput> {
    const instructions = input.recipeInstructions?.split('\n').filter(s => s.trim()) || [];
    const currentStep = input.currentStep ?? -1;
    const inRecipe = instructions.length > 0;

    // 1. Classify the intent
    const action = await classifyIntent(input.command, inRecipe);
    
    let responseText = "";
    let recipePayload: GenerateRecipeOutput | undefined = undefined;


    // 2. Build the response text based on deterministic logic
    switch (action) {
        case 'next':
            if (inRecipe && currentStep >= 0 && currentStep < instructions.length - 1) {
                const newStep = currentStep + 1;
                responseText = `Step ${newStep + 1}: ${instructions[newStep]}`;
            } else if (inRecipe) {
                responseText = "You're on the last step! Looks like you're all done. Congratulations!";
            } else {
                responseText = "You're not in a recipe right now. I can't go to the next step.";
            }
            break;
        case 'previous':
            if (inRecipe && currentStep > 0) {
                const newStep = currentStep - 1;
                responseText = `Step ${newStep + 1}: ${instructions[newStep]}`;
            } else if (inRecipe) {
                responseText = "You're at the beginning. Can't go back any further!";
            } else {
                responseText = "You're not in a recipe, so there's no previous step to go to.";
            }
            break;
        case 'repeat':
             if (inRecipe && currentStep >= 0) {
                responseText = `Here's step ${currentStep + 1} again: ${instructions[currentStep]}`;
            } else {
                responseText = "There's nothing for me to repeat right now.";
            }
            break;
        case 'scanIngredients':
            responseText = "Okay, show me the goods. I'll scan them in.";
            break;
        case 'safetyAlert':
            responseText = "Sure thing. Point your camera at the scene of the potential crime and I'll take a look.";
            break;
        case 'startCooking':
            if (inRecipe) {
                responseText = "Alright, let's get this party started! Switching to cooking mode.";
            } else {
                responseText = "There's no recipe open for me to start. Please generate one first.";
            }
            break;
        case 'createRecipe': {
            const recipeParseResult = await parseRecipeFromDictation(input.command);
            if (!recipeParseResult.output) {
                responseText = "I'm sorry, I couldn't seem to pull a recipe from that. Could you try again, maybe starting with 'Create a recipe for...'?";
            } else {
                const parsedRecipe = recipeParseResult.output;
                
                const imageResult = await generateRecipeImage({ recipeTitle: parsedRecipe.recipeName }).catch(err => {
                    console.error("Image generation failed for voice recipe, proceeding without image:", err);
                    return { photoDataUri: undefined };
                });

                recipePayload = {
                    ...parsedRecipe,
                    photoDataUri: imageResult.photoDataUri,
                };

                responseText = `I've got your recipe for ${parsedRecipe.recipeName}. Opening it up for you now.`;
            }
            break;
        }
        case 'none':
            const recipeContext = inRecipe && currentStep >=0 ? `The user is on step ${currentStep + 1}: "${instructions[currentStep]}"` : "The user is not currently in a recipe.";
            const generalResponse = await answerGeneralCookingQuestion(input.command, recipeContext);
            responseText = generalResponse || "Sorry, I'm not sure how to answer that.";
            break;
    }

    // TODO: Generate audio from the response text if requested
    // let audioResponse: string | undefined;

    // if (input.generateAudio) {
    //   try {
    //     const { media } = await ai.generate({
    //       model: 'googleai/gemini-2.5-flash-preview-tts',
    //       config: {
    //         responseModalities: ['AUDIO'],
    //         speechConfig: {
    //           voiceConfig: {
    //             prebuiltVoiceConfig: { voiceName: input.voiceName || 'Algenib' },
    //           },
    //         },
    //       },
    //       prompt: responseText,
    //     });

    //     if (media) {
    //         const audioBuffer = Buffer.from(
    //           media.url.substring(media.url.indexOf(',') + 1),
    //           'base64'
    //         );
    //         audioResponse = 'data:audio/wav;base64,' + (await toWav(audioBuffer));
    //     } else {
    //        console.error('TTS generation did not return media.');
    //     }
    //   } catch (error) {
    //     console.error("TTS generation failed:", error);
    //     // Do not throw; just proceed without audio. The user will see the text response.
    //   }
    // }

    return {
      response: responseText,
      // audioResponse,
      action: action as VoiceCommandOutput['action'],
      recipe: recipePayload,
    };
}


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
