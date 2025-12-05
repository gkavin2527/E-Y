'use server';
/**
 * @fileOverview A Genkit flow for creating personalized travel packing lists.
 * - planTrip: The main function that takes travel details and returns outfit suggestions.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { categories } from '@/lib/data';

// Get a simplified list of available product categories to guide the model
const availableCategories = [
    ...categories.men.map(c => `Men's ${c.name}`),
    ...categories.women.map(c => `Women's ${c.name}`),
].join(', ');

// Define the schema for the trip planner input
const TripPlannerInputSchema = z.object({
  destination: z.string().describe('The user\'s travel destination (e.g., "Paris, France").'),
  duration: z.number().int().min(1).describe('The duration of the trip in days.'),
  style: z.enum(['casual', 'business', 'beach', 'adventurous']).describe('The user\'s preferred style of clothing.'),
});
export type TripPlannerInput = z.infer<typeof TripPlannerInputSchema>;

// Define the schema for a single outfit suggestion
const OutfitSuggestionSchema = z.object({
    top: z.string().describe("A specific top to wear (e.g., 'White Linen Shirt')."),
    bottom: z.string().describe("A specific bottom to wear (e.g., 'Khaki Chinos')."),
    footwear: z.string().describe("Specific footwear to wear (e.g., 'Leather Loafers')."),
    accessory: z.string().optional().describe("An optional accessory to complete the outfit (e.g., 'Classic Chronograph Watch')."),
});

// Define the schema for the output for a single day
const DailyPlanSchema = z.object({
    day: z.number().describe("The day number (e.g., 1)."),
    title: z.string().describe("A catchy title for the day's activity and outfit (e.g., 'Day 1: Arrival & City Exploration')."),
    outfit: OutfitSuggestionSchema.describe("The suggested outfit for the day."),
});

// Define the schema for the final output of the flow
const TripPlannerOutputSchema = z.object({
  title: z.string().describe("A creative and fitting title for the entire trip plan, e.g., 'An Adventurous 5 Days in Costa Rica'."),
  introduction: z.string().describe("A brief, friendly introduction to the packing list, setting the tone for the trip."),
  packingList: z.array(DailyPlanSchema).describe("An array of daily outfit plans."),
});
export type TripPlannerOutput = z.infer<typeof TripPlannerOutputSchema>;

// Define the main function that the client will call
export async function planTrip(input: TripPlannerInput): Promise<TripPlannerOutput> {
  return tripPlannerFlow(input);
}

// Define the Genkit prompt
const prompt = ai.definePrompt({
  name: 'tripPlannerPrompt',
  input: { schema: TripPlannerInputSchema },
  output: { schema: TripPlannerOutputSchema },
  prompt: `
    You are an expert travel stylist for an e-commerce fashion brand called E&Y.
    Your task is to create a personalized, day-by-day packing and outfit plan for a user's trip.

    Analyze the user's destination to infer the likely weather and cultural setting.
    Consider the trip's duration and the user's preferred style.

    **Instructions:**
    1.  Create a creative title for the trip plan.
    2.  Write a brief, encouraging introduction for the user.
    3.  Generate a packing list with one distinct outfit suggestion for each day of the trip.
    4.  For each day, provide a title for the day's likely activity and the suggested outfit.
    5.  All clothing items must be plausible products from our store. You can invent specific product names (e.g., "The Explorer Jacket," "Sunset Linen Shirt") but they must fit into our existing categories.
    
    **Available Product Categories:** ${availableCategories}

    **User's Trip Details:**
    -   **Destination:** {{{destination}}}
    -   **Duration:** {{{duration}}} days
    -   **Style Preference:** {{{style}}}

    Now, generate the complete trip plan.
  `,
});


// Define the Genkit flow
const tripPlannerFlow = ai.defineFlow(
  {
    name: 'tripPlannerFlow',
    inputSchema: TripPlannerInputSchema,
    outputSchema: TripPlannerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate a trip plan.');
    }
    return output;
  }
);
