'use server';
/**
 * @fileOverview An AI flow for finding similar items.
 *
 * - findSimilarItems - A function that finds items from a list that are similar to a given source item.
 * - FindSimilarItemsInput - The input type for the findSimilarItems function.
 * - FindSimilarItemsOutput - The return type for the findSimilarItems function.
 */

import {ai} from '@/ai/genkit';
import type { Item } from '@/lib/types';
import {z} from 'genkit';

const FindSimilarItemsInputSchema = z.object({
    sourceItem: z.object({
        name: z.string(),
        description: z.string(),
        category: z.string(),
    }).describe("The item to find similarities for."),
    searchItems: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        category: z.string(),
    })).describe("The list of items to search through."),
});

export type FindSimilarItemsInput = z.infer<typeof FindSimilarItemsInputSchema>;

const FindSimilarItemsOutputSchema = z.object({
    similarItemIds: z.array(z.string()).describe("An array of IDs of the items that are considered similar to the source item."),
});
export type FindSimilarItemsOutput = z.infer<typeof FindSimilarItemsOutputSchema>;

export async function findSimilarItems(input: FindSimilarItemsInput): Promise<FindSimilarItemsOutput> {
  return findSimilarItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findSimilarItemsPrompt',
  input: {schema: FindSimilarItemsInputSchema},
  output: {schema: FindSimilarItemsOutputSchema},
  prompt: `You are an expert at finding similarities between lost and found items.
You will be given a source item that is lost, and a list of items that have been found.
Your task is to compare the source "lost" item with every item in the "found" list and identify which of the found items are potential matches.

Consider the item's name, description, and category. A good match will be in the same category and have a very similar name and description.

Source Lost Item:
- Name: {{{sourceItem.name}}}
- Description: {{{sourceItem.description}}}
- Category: {{{sourceItem.category}}}

Found Items to Search Through:
{{#each searchItems}}
- ID: {{{this.id}}}
  - Name: {{{this.name}}}
  - Description: {{{this.description}}}
  - Category: {{{this.category}}}
{{/each}}

Return a JSON object with the key "similarItemIds" containing an array of the IDs of the found items that are strong potential matches. If no items are similar, return an empty array.
`,
});

const findSimilarItemsFlow = ai.defineFlow(
  {
    name: 'findSimilarItemsFlow',
    inputSchema: FindSimilarItemsInputSchema,
    outputSchema: FindSimilarItemsOutputSchema,
  },
  async input => {
    if (input.searchItems.length === 0) {
        return { similarItemIds: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
