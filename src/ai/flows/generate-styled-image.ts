'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a styled product image with a model.
 * - generateStyledImage: Generates an image of a model wearing a specific product.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProductSchema = z.object({
    name: z.string(),
    description: z.string(),
    category: z.string().optional(),
    gender: z.enum(['men', 'women']),
    images: z.array(z.string()),
});

const GenerateStyledImageInputSchema = z.object({
  product: ProductSchema,
});

const GenerateStyledImageOutputSchema = z.object({
  media: z.string().describe('The generated image as a data URI.'),
});

/**
 * Generates an image of a model wearing the provided product.
 * @param input - An object containing the product details.
 * @returns A promise that resolves to an object containing the image data URI.
 */
export async function generateStyledImage(input: z.infer<typeof GenerateStyledImageInputSchema>): Promise<z.infer<typeof GenerateStyledImageOutputSchema>> {
  return generateStyledImageFlow(input);
}

// Define the Genkit flow for styled image generation
const generateStyledImageFlow = ai.defineFlow(
  {
    name: 'generateStyledImageFlow',
    inputSchema: GenerateStyledImageInputSchema,
    outputSchema: GenerateStyledImageOutputSchema,
  },
  async ({ product }) => {
    // const { name, description, category, gender, images } = product;
    // const productImageUrl = images[0]; 

    // // Construct a detailed prompt for the image generation model
    // const prompt = `
    //   Generate a high-quality, photorealistic image for an e-commerce website.
    //   The image should feature a ${gender === 'men' ? 'male' : 'female'} model wearing the following clothing item:
    //   - Product Name: ${name}
    //   - Category: ${category || 'clothing'}
    //   - Description: ${description}

    //   The model should be styled in a full outfit that complements the product.
    //   The setting should be a clean, modern, and aesthetically pleasing environment (e.g., a studio with soft lighting, a minimalist urban setting, or a beautiful natural landscape that fits the clothing style).
    //   The overall mood should be fashionable, chic, and inspiring.
    //   Ensure the product is clearly visible and is the main focus of the image.

    //   Use the following image as a reference for the product's appearance:
    // `;

    // // Use a powerful image generation model like Imagen 2 or Gemini Pro Vision
    // const { media } = await ai.generate({
    //   model: 'googleai/gemini-2.5-flash-image-preview',
    //   prompt: [
    //     { media: { url: productImageUrl } },
    //     { text: prompt },
    //   ],
    //   config: {
    //     // responseModalities is deprecated and should not be used for gemini-2.5-flash-image-preview
    //   },
    // });

    // if (!media) {
    //   throw new Error('Image generation failed to produce media.');
    // }

    // Return the image data URI
    // return { media: media.url };
    
    // Return a placeholder to avoid hitting rate limits on the free tier.
    return { media: 'https://picsum.photos/seed/ai-stylist/600/800' };
  }
);
