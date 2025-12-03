'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating richer product descriptions based on user search history.
 *
 * The flow takes a product name and user search history as input and generates a detailed product description
 * including information about how to wear it, how it feels, and what it's good for.
 *
 * @interface GenerateProductDescriptionsInput - Defines the input schema for the generateProductDescriptions function.
 * @interface GenerateProductDescriptionsOutput - Defines the output schema for the generateProductDescriptions function.
 * @function generateProductDescriptions - The main function that triggers the flow and returns the enhanced product description.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionsInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  searchHistory: z.string().describe('The user search history.'),
});
export type GenerateProductDescriptionsInput = z.infer<typeof GenerateProductDescriptionsInputSchema>;

const GenerateProductDescriptionsOutputSchema = z.object({
  productDescription: z.string().describe('An enhanced product description.'),
});
export type GenerateProductDescriptionsOutput = z.infer<typeof GenerateProductDescriptionsOutputSchema>;

export async function generateProductDescriptions(input: GenerateProductDescriptionsInput): Promise<GenerateProductDescriptionsOutput> {
  return generateProductDescriptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionsPrompt',
  input: {schema: GenerateProductDescriptionsInputSchema},
  output: {schema: GenerateProductDescriptionsOutputSchema},
  prompt: `You are an experienced fashion assistant.

  Based on the product name and user's search history, create a rich and appealing product description.
  Include information about how to wear it, how it feels, and what it is good for. Try to infer user intent from search history.

  Product Name: {{{productName}}}
  User Search History: {{{searchHistory}}}

  Write the product description:
  `,
});

const generateProductDescriptionsFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionsFlow',
    inputSchema: GenerateProductDescriptionsInputSchema,
    outputSchema: GenerateProductDescriptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
