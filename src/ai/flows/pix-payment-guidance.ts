// pix-payment-guidance.ts
'use server';

/**
 * @fileOverview Provides AI-powered guidance for subscribers on how Pix payments work and how to resolve common issues.
 *
 * - pixPaymentGuidance - A function that returns guidance about pix payments.
 * - PixPaymentGuidanceInput - The input type for the pixPaymentGuidance function.
 * - PixPaymentGuidanceOutput - The return type for the pixPaymentGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PixPaymentGuidanceInputSchema = z.object({
  question: z
    .string()
    .describe(
      'The subscriber question about Pix payments, e.g., how to make a Pix payment, or what to do if a Pix payment fails.'
    ),
});
export type PixPaymentGuidanceInput = z.infer<typeof PixPaymentGuidanceInputSchema>;

const PixPaymentGuidanceOutputSchema = z.object({
  answer: z.string().describe('The answer to the subscriber question.'),
});
export type PixPaymentGuidanceOutput = z.infer<typeof PixPaymentGuidanceOutputSchema>;

export async function pixPaymentGuidance(input: PixPaymentGuidanceInput): Promise<PixPaymentGuidanceOutput> {
  return pixPaymentGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pixPaymentGuidancePrompt',
  input: {schema: PixPaymentGuidanceInputSchema},
  output: {schema: PixPaymentGuidanceOutputSchema},
  prompt: `You are a helpful AI assistant that provides guidance on how to use Pix payments.

  Answer the following question about Pix payments:
  {{question}}
  `,
});

const pixPaymentGuidanceFlow = ai.defineFlow(
  {
    name: 'pixPaymentGuidanceFlow',
    inputSchema: PixPaymentGuidanceInputSchema,
    outputSchema: PixPaymentGuidanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
