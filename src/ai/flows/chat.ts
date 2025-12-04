
'use server';
/**
 * @fileOverview A Genkit flow for handling chat conversations with the Gemini model.
 * - chat: The main function that takes conversation history and returns the model's response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ChatMessageSchema } from './types';
import type { ChatMessage } from './types';


// Define the schema for the chat flow input
const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema),
});

// Define the schema for the chat flow output
const ChatOutputSchema = z.object({
  message: z.string(),
});

/**
 * Sends the conversation history to the Gemini model and gets the next response.
 * @param input An object containing the conversation history.
 * @returns A promise that resolves to the model's response.
 */
export async function chat(
  input: z.infer<typeof ChatInputSchema>
): Promise<z.infer<typeof ChatOutputSchema>> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({ history }) => {
    const response = await ai.generate({
      model: ai.model,
      prompt: history,
    });

    const choice = response.choices[0];
    if (!choice || !choice.message.content) {
        return { message: "I'm sorry, I couldn't generate a response." };
    }

    return { message: choice.message.content as string };
  }
);
