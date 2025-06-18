// src/ai/flows/generate-quote-request.ts
'use server';

/**
 * @fileOverview Generates a request for quotation based on user-provided configuration requirements.
 *
 * - generateQuoteRequest - A function that generates a quote request.
 * - GenerateQuoteRequestInput - The input type for the generateQuoteRequest function.
 * - GenerateQuoteRequestOutput - The return type for the generateQuoteRequest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuoteRequestInputSchema = z.object({
  logsPerDayGb: z.number().describe('The amount of logs per day in GB.'),
  retentionDays: z
    .enum(['30', '60', '90'])
    .describe('The data retention period in days.'),
  dataAtRestEncryptionRequired: z
    .boolean()
    .describe('Whether data-at-rest encryption is required.'),
  operatingModel: z
    .enum(['fully managed', 'managed', 'self-serve'])
    .describe('The operating model.'),
});
export type GenerateQuoteRequestInput = z.infer<typeof GenerateQuoteRequestInputSchema>;

const GenerateQuoteRequestOutputSchema = z.object({
  quoteRequest: z.string().describe('The generated request for quotation.'),
});
export type GenerateQuoteRequestOutput = z.infer<typeof GenerateQuoteRequestOutputSchema>;

export async function generateQuoteRequest(
  input: GenerateQuoteRequestInput
): Promise<GenerateQuoteRequestOutput> {
  return generateQuoteRequestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuoteRequestPrompt',
  input: {schema: GenerateQuoteRequestInputSchema},
  output: {schema: GenerateQuoteRequestOutputSchema},
  prompt: `Generate a request for quotation based on the following configuration requirements:\n\nLogs per day (GB): {{{logsPerDayGb}}}\nRetention period (days): {{{retentionDays}}}\nData-at-rest encryption required: {{#if dataAtRestEncryptionRequired}}Yes{{else}}No{{/if}}\nOperating model: {{{operatingModel}}}\n\nPlease ensure the request is clear, concise, and includes all necessary information for the vendor to provide an accurate quote.`,
});

const generateQuoteRequestFlow = ai.defineFlow(
  {
    name: 'generateQuoteRequestFlow',
    inputSchema: GenerateQuoteRequestInputSchema,
    outputSchema: GenerateQuoteRequestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
