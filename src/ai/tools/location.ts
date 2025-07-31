'use server';
/**
 * @fileOverview Location-based AI tools.
 *
 * - getDistance - A tool to calculate the distance between two locations.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Simple mock distance lookup. In a real application, this would call a mapping API.
const distances: Record<string, Record<string, number>> = {
  'london': { 'new york': 5567, 'paris': 344, 'manchester': 330 },
  'new york': { 'london': 5567, 'los angeles': 3936 },
  'manchester': { 'london': 330 },
};

function lookupDistance(loc1: string, loc2: string): number | null {
    const l1 = loc1.toLowerCase().split(' ').pop() || '';
    const l2 = loc2.toLowerCase().split(' ').pop() || '';
    return distances[l1]?.[l2] ?? distances[l2]?.[l1] ?? null;
}

export const getDistance = ai.defineTool(
  {
    name: 'getDistance',
    description: 'Returns the distance in kilometers between two locations.',
    inputSchema: z.object({
      loc1: z.string().describe('The first location.'),
      loc2: z.string().describe('The second location.'),
    }),
    outputSchema: z.object({
        distanceKm: z.number().optional().describe('The distance in kilometers.'),
    }),
  },
  async ({ loc1, loc2 }) => {
    // In a real-world scenario, you would call a service like Google Maps API.
    // For this prototype, we'll use a mocked lookup.
    const distance = lookupDistance(loc1, loc2);
    if (distance) {
        return { distanceKm: distance };
    }
    // Return a random distance for unknown pairs for demonstration
    return { distanceKm: Math.floor(Math.random() * 5000) + 200 };
  }
);
