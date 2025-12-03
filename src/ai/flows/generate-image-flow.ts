'use server';
/**
 * @fileOverview This file defines Genkit flows for image generation and management.
 * - generateImage: Generates an image from a text prompt using a text-to-image model.
 * - saveImages: A tool for saving the list of generated images back to the placeholder JSON file.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

// Define the schema for the image generation output
const GenerateImageOutputSchema = z.object({
  media: z.string().describe('The generated image as a data URI.'),
});

/**
 * Generates an image based on a text prompt.
 * @param prompt - The text prompt describing the desired image.
 * @returns A promise that resolves to an object containing the image data URI.
 */
export async function generateImage(prompt: string): Promise<z.infer<typeof GenerateImageOutputSchema>> {
  return generateImageFlow(prompt);
}

// Define the Genkit flow for image generation
const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: z.string(),
    outputSchema: GenerateImageOutputSchema,
  },
  async (prompt) => {
    // Use a text-to-image model to generate the image
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `A high-quality, photorealistic product image for an e-commerce website. ${prompt}. Clean, studio lighting, plain background.`,
      config: {
        // Specify that the response should include an image
        responseModalities: ['IMAGE'],
      },
    });

    if (!media) {
      throw new Error('Image generation failed to produce media.');
    }

    // Return the image data URI
    return { media: media.url };
  }
);


const ImagePlaceholderSchema = z.object({
  id: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  imageHint: z.string(),
  prompt: z.string().optional(),
});


// Define a tool to save the updated image list to the JSON file
export const saveImages = ai.defineTool(
    {
      name: 'saveImages',
      description: 'Saves the list of placeholder images to the JSON file.',
      inputSchema: z.array(ImagePlaceholderSchema),
      outputSchema: z.void(),
    },
    async (images: ImagePlaceholder[]) => {
      const filePath = path.join(process.cwd(), 'src', 'lib', 'placeholder-images.json');
      const dataToSave = { placeholderImages: images };
      await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    }
  );
