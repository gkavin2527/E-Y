'use server';
/**
 * @fileOverview A Genkit flow for handling chat conversations with the Gemini model.
 * - chat: The main function that takes conversation history and returns the model's response.
 * - ChatMessageSchema: The Zod schema for a single chat message.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generate } from 'genkit/ai';

// Define the schema for a single chat message
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

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
    const response = await generate({
      model: ai.model,
      prompt: {
        messages: history,
      },
    });

    const choice = response.choices[0];
    if (!choice || !choice.message.content) {
        return { message: "I'm sorry, I couldn't generate a response." };
    }

    return { message: choice.message.content.text };
  }
);
