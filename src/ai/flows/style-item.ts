
'use server';
/**
 * @fileOverview An AI agent that provides styling suggestions for a given clothing item.
 * - styleItem: The main function that takes a product name and returns outfit ideas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema for the styleItem input
const StyleItemInputSchema = z.object({
  productName: z.string().describe("The name of the clothing item to be styled."),
});
export type StyleItemInput = z.infer<typeof StyleItemInputSchema>;


// Define the schema for a single outfit
const OutfitSchema = z.object({
    name: z.string().describe("A creative name for the outfit style (e.g., 'Weekend Casual', 'Office Sharp', 'Evening Elegance')."),
    description: z.string().describe("A brief description of the outfit's vibe and where it could be worn."),
    items: z.array(z.string()).describe("A list of other clothing items or accessories that would complete the outfit."),
});

// Define the schema for the final output of the flow
const StyleItemOutputSchema = z.object({
  outfits: z.array(OutfitSchema).length(3).describe("An array of exactly three distinct outfit suggestions."),
});
export type StyleItemOutput = z.infer<typeof StyleItemOutputSchema>;


// Define the main function that the client will call
export async function styleItem(input: StyleItemInput): Promise<StyleItemOutput> {
  return styleItemFlow(input);
}


// Define the Genkit prompt
const prompt = ai.definePrompt({
  name: 'styleItemPrompt',
  input: { schema: StyleItemInputSchema },
  output: { schema: StyleItemOutputSchema },
  prompt: `
    You are a professional fashion stylist for an e-commerce brand called E&Y.
    Your task is to create three distinct and appealing outfit suggestions based on a single product that the user has already purchased.

    **Core Product:** {{{productName}}}

    **Instructions:**
    1.  Generate exactly three different outfits.
    2.  For each outfit, provide a creative and descriptive name (e.g., "Art Gallery Afternoon," "Downtown Dinner Date," "Casual Friday").
    3.  For each outfit, write a short, appealing description of the look and occasion.
    4.  For each outfit, list 3-4 other specific clothing items or accessories (e.g., "black skinny jeans," "leather ankle boots," "silver hoop earrings") that would complete the look.
    
    Do not mention the core product in the list of items. Assume the user already has it.
    Focus on creating complete, stylish, and inspiring looks.
  `,
});


// Define the Genkit flow
const styleItemFlow = ai.defineFlow(
  {
    name: 'styleItemFlow',
    inputSchema: StyleItemInputSchema,
    outputSchema: StyleItemOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate style suggestions.');
    }
    return output;
  }
);
