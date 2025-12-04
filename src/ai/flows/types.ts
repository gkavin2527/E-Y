
import { z } from 'zod';

/**
 * @fileOverview This file contains shared Zod schemas and TypeScript types for AI flows.
 */

// Define the schema for a single chat message
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
