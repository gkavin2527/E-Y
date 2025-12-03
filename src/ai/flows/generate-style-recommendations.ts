'use server';

/**
 * @fileOverview Generates personalized style recommendations based on user browsing history and past purchases.
 *
 * - generateStyleRecommendations - A function that generates style recommendations.
 * - StyleRecommendationsInput - The input type for the generateStyleRecommendations function.
 * - StyleRecommendationsOutput - The return type for the generateStyleRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleRecommendationsInputSchema = z.object({
  browsingHistory: z
    .array(z.string())
    .describe('A list of product IDs representing the user browsing history.'),
  pastPurchases: z
    .array(z.string())
    .describe('A list of product IDs representing the user past purchases.'),
  preferredStyles: z
    .string()
    .optional()
    .describe('The user preferred styles such as Minimal, Casual, Formal etc.'),
});
export type StyleRecommendationsInput = z.infer<typeof StyleRecommendationsInputSchema>;

const StyleRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('A list of product IDs recommended for the user.'),
});
export type StyleRecommendationsOutput = z.infer<typeof StyleRecommendationsOutputSchema>;

export async function generateStyleRecommendations(
  input: StyleRecommendationsInput
): Promise<StyleRecommendationsOutput> {
  return generateStyleRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleRecommendationsPrompt',
  input: {schema: StyleRecommendationsInputSchema},
  output: {schema: StyleRecommendationsOutputSchema},
  prompt: `You are a personal style assistant. Based on the user's browsing history, past purchases, and preferred styles, recommend products that they might like.

Browsing History: {{browsingHistory}}
Past Purchases: {{pastPurchases}}
Preferred Styles: {{preferredStyles}}

Recommend products (list of product IDs) that match the user's taste:
`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const generateStyleRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateStyleRecommendationsFlow',
    inputSchema: StyleRecommendationsInputSchema,
    outputSchema: StyleRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
