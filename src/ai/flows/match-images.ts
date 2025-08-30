'use server';
/**
 * @fileOverview Image matching AI agent that matches lost items with uploaded pictures.
 *
 * - matchImages - A function that handles the image matching process.
 * - MatchImagesInput - The input type for the matchImages function.
 * - MatchImagesOutput - The return type for the matchImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchImagesInputSchema = z.object({
  lostItemDescription: z
    .string()
    .describe('The description of the lost item including name and identifying features.'),
  lostItemPhotoDataUri: z
    .string()
    .describe(
      "A photo of the lost item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  foundItemPhotoDataUri: z
    .string()
    .describe(
      "A photo of the found item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type MatchImagesInput = z.infer<typeof MatchImagesInputSchema>;

const MatchImagesOutputSchema = z.object({
  matchCertainty: z
    .number()
    .describe(
      'A number between 0 and 1 indicating how certain the AI is that the images match, with 1 being perfectly certain.'
    ),
  reasoning: z
    .string()
    .describe('The reasoning the AI used to determine the match certainty.'),
});
export type MatchImagesOutput = z.infer<typeof MatchImagesOutputSchema>;

export async function matchImages(input: MatchImagesInput): Promise<MatchImagesOutput> {
  return matchImagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchImagesPrompt',
  input: {schema: MatchImagesInputSchema},
  output: {schema: MatchImagesOutputSchema},
  prompt: `You are an AI expert at determining if a found item photo matches the description and photo of a lost item.

    You will be given the description of the lost item, and a photo of the lost item.
    You will also be given a photo of a found item.

    You must determine how likely it is that the found item is the lost item, and express this as a floating point number between 0 and 1 in the matchCertainty field.
    In the reasoning field, explain the rational for the matchCertainty score.

    Lost item description: {{{lostItemDescription}}}
    Lost item photo: {{media url=lostItemPhotoDataUri}}
    Found item photo: {{media url=foundItemPhotoDataUri}}`,
});

const matchImagesFlow = ai.defineFlow(
  {
    name: 'matchImagesFlow',
    inputSchema: MatchImagesInputSchema,
    outputSchema: MatchImagesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
