'use server';
/**
 * @fileOverview An AI flow for finding similar items.
 *
 * - findSimilarItems - A function that finds items from a list that are similar to a given source item.
 * - FindSimilarItemsInput - The input type for the findSimilarItems function.
 * - FindSimilarItemsOutput - The return type for the findSimilarItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindSimilarItemsInputSchema = z.object({
    sourceItem: z.object({
        name: z.string(),
        description: z.string(),
        category: z.string(),
        imageDataUri: z.string().optional(),
    }).describe("The item to find similarities for."),
    searchItems: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        category: z.string(),
        imageDataUri: z.string().optional(),
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

Consider the item's name, description, category, and pay close attention to the provided images. A good match will be in the same category and have a very similar name, description, and appearance.

Source Lost Item:
- Name: {{{sourceItem.name}}}
- Description: {{{sourceItem.description}}}
- Category: {{{sourceItem.category}}}
{{#if sourceItem.imageDataUri}}
- Image: {{media url=sourceItem.imageDataUri}}
{{/if}}


Found Items to Search Through:
{{#each searchItems}}
- ID: {{{this.id}}}
  - Name: {{{this.name}}}
  - Description: {{{this.description}}}
  - Category: {{{this.category}}}
  {{#if this.imageDataUri}}
  - Image: {{media url=this.imageDataUri}}
  {{/if}}
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
