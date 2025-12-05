'use server';
/**
 * @fileOverview A Genkit flow for handling chat conversations with the Gemini model.
 * - chat: The main function that takes conversation history and returns the model's response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ChatMessageSchema } from './types';
import type { ChatMessage } from './types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getSdks } from '@/firebase';
import type { Product } from '@/lib/types';


// Define a tool for searching products
const productSearch = ai.defineTool(
  {
    name: 'productSearch',
    description: 'Search for products in the store catalog based on a query.',
    inputSchema: z.object({
      query: z.string().describe('The user\'s search query for products.'),
    }),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        category: z.string(),
        gender: z.string(),
      })
    ),
  },
  async ({ query: searchQuery }) => {
    console.log(`Tool called: productSearch with query: ${searchQuery}`);
    // This is a server-side flow, so we can initialize a temporary
    // Firebase instance to query the database.
    const { firestore } = getSdks();
    const productsRef = collection(firestore, 'products');

    // Simple search: case-insensitive match on name.
    // For a real app, a more robust search service like Algolia is recommended.
    const q = query(
      productsRef,
      where('name', '>=', searchQuery),
      where('name', '<=', searchQuery + '\uf8ff')
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return [];
    }

    const products = snapshot.docs.map(doc => {
        const data = doc.data() as Product;
        return {
            id: doc.id,
            name: data.name,
            price: data.price,
            category: data.category || 'unknown',
            gender: data.gender
        }
    })
    return products;
  }
);


// Define the schema for the chat flow input
const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema),
});

// Define the schema for the chat flow output
const ChatOutputSchema = z.object({
  message: z.string(),
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({ history }) => {
    // Validate that we have history
    if (!history || history.length === 0) {
      return { message: "I'm sorry, I didn't receive a message." };
    }

    // Separate the last message (user's current message) from the conversation history
    const conversationHistory = history.slice(0, -1);
    const currentMessage = history[history.length - 1];

    if (!currentMessage?.content) {
      return { message: "I'm sorry, I didn't receive a message." };
    }

    // Build the generate request with conversation history
    const response = await ai.generate({
      prompt: currentMessage.content,
      // Include previous conversation context if available
      history: conversationHistory.map(msg => ({
        role: msg.role,
        content: [{ text: msg.content }],
      })),
      tools: [productSearch], // Make the product search tool available to the model
    });

    // Check if response exists and has text content
    if (!response?.text) {
      return { message: "I'm sorry, I couldn't generate a response." };
    }
    
    return { 
      message: response.text,
    };
  }
);

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
