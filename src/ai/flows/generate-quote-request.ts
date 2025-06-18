
// src/ai/flows/generate-quote-request.ts
'use server';

/**
 * @fileOverview Generates a request for quotation based on user-provided configuration requirements
 * and sends the details via a simulated email.
 *
 * - generateQuoteRequest - A function that generates a quote request and triggers an email.
 * - GenerateQuoteRequestInput - The input type for the generateQuoteRequest function.
 * - GenerateQuoteRequestOutput - The return type for the generateQuoteRequest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { sendQuoteRequestEmail } from '@/services/email-service';

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

// This is the main function exported and called by server actions.
// It orchestrates the flow execution and the email sending side-effect.
export async function generateQuoteRequest(
  input: GenerateQuoteRequestInput
): Promise<GenerateQuoteRequestOutput> {
  // Execute the Genkit flow to get the quote request.
  const flowOutput = await generateQuoteRequestFlow(input);

  // After successfully generating the quote, attempt to send the email.
  // This is treated as a side-effect. Failure here won't fail the main operation
  // of returning the quote, but it will be logged.
  try {
    await sendQuoteRequestEmail({ input, quoteRequest: flowOutput.quoteRequest });
  } catch (emailError) {
    console.error("Failed to send quote request email (non-critical side-effect):", emailError);
  }

  return flowOutput; // Return the primary output (the generated quote)
}

const prompt = ai.definePrompt({
  name: 'generateQuoteRequestPrompt',
  input: {schema: GenerateQuoteRequestInputSchema},
  output: {schema: GenerateQuoteRequestOutputSchema},
  prompt: `Generate a request for quotation based on the following configuration requirements:\n\nLogs per day (GB): {{{logsPerDayGb}}}\nRetention period (days): {{{retentionDays}}}\nData-at-rest encryption required: {{#if dataAtRestEncryptionRequired}}Yes{{else}}No{{/if}}\nOperating model: {{{operatingModel}}}\n\nPlease ensure the request is clear, concise, and includes all necessary information for the vendor to provide an accurate quote.`,
});

// This is the Genkit flow definition. It remains focused on the AI generation task.
const generateQuoteRequestFlow = ai.defineFlow(
  {
    name: 'generateQuoteRequestFlow',
    inputSchema: GenerateQuoteRequestInputSchema,
    outputSchema: GenerateQuoteRequestOutputSchema,
  },
  async (input: GenerateQuoteRequestInput): Promise<GenerateQuoteRequestOutput> => {
    const {output} = await prompt(input);
    if (!output || typeof output.quoteRequest !== 'string') {
        console.error("Prompt did not return the expected output format.", output);
        throw new Error("Failed to generate quote request due to an unexpected response from the AI model.");
    }
    return output;
  }
);
