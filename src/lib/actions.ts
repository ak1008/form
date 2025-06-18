// src/lib/actions.ts
'use server';

import { generateQuoteRequest, type GenerateQuoteRequestInput, type GenerateQuoteRequestOutput } from '@/ai/flows/generate-quote-request';

interface ActionResult {
  data?: GenerateQuoteRequestOutput;
  error?: string;
}

export async function handleGenerateQuoteRequest(input: GenerateQuoteRequestInput): Promise<ActionResult> {
  try {
    // Validate input here if necessary, though react-hook-form + zod should handle client-side.
    // For server actions, it's good practice to re-validate if the action can be called from other places.
    const result = await generateQuoteRequest(input);
    return { data: result };
  } catch (error) {
    console.error("Error generating quote request:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unknown error occurred while generating the quote request." };
  }
}
