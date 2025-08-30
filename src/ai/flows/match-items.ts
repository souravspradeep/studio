'use server';

/**
 * @fileOverview This file contains the Genkit flow for intelligently matching found items to lost item posts.
 *
 * It uses descriptions and images to find potential matches and notifies potential owners.
 *
 * - matchItems - A function that handles the item matching process.
 * - MatchItemsInput - The input type for the matchItems function.
 * - MatchItemsOutput - The return type for the matchItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchItemsInputSchema = z.object({
  lostItemDescription: z
    .string()
    .describe('The description of the lost item provided by the user.'),
  lostItemPhotoDataUri: z
    .string()
    .describe(
      "A photo of the lost item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  foundItemDescription: z
    .string()
    .describe('The description of the found item.'),
  foundItemPhotoDataUri: z
    .string()
    .describe(
      "A photo of the found item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type MatchItemsInput = z.infer<typeof MatchItemsInputSchema>;

const MatchItemsOutputSchema = z.object({
  matchProbability: z
    .number()
    .describe(
      'The probability that the found item matches the lost item, ranging from 0 to 1.'
    ),
  reasoning: z
    .string()
    .describe('The reasoning behind the match probability score.'),
});
export type MatchItemsOutput = z.infer<typeof MatchItemsOutputSchema>;

export async function matchItems(input: MatchItemsInput): Promise<MatchItemsOutput> {
  return matchItemsFlow(input);
}

const matchItemsPrompt = ai.definePrompt({
  name: 'matchItemsPrompt',
  input: {schema: MatchItemsInputSchema},
  output: {schema: MatchItemsOutputSchema},
  prompt: `You are an AI assistant helping to match lost items with found items.

You will be given a description and a photo of a lost item, as well as a description and a photo of a found item.

Based on the descriptions and the images, you will determine the probability that the found item matches the lost item.

You should consider partial matches in descriptions and images.

Lost Item Description: {{{lostItemDescription}}}
Lost Item Photo: {{media url=lostItemPhotoDataUri}}
Found Item Description: {{{foundItemDescription}}}
Found Item Photo: {{media url=foundItemPhotoDataUri}}

Output the matchProbability as a number between 0 and 1, and include your reasoning.
`,
});

const matchItemsFlow = ai.defineFlow(
  {
    name: 'matchItemsFlow',
    inputSchema: MatchItemsInputSchema,
    outputSchema: MatchItemsOutputSchema,
  },
  async input => {
    const {output} = await matchItemsPrompt(input);
    return output!;
  }
);
