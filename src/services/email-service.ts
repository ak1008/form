
'use server';
/**
 * @fileOverview A service for sending emails.
 * This is a placeholder and currently logs to console instead of sending real emails.
 *
 * - sendQuoteRequestEmail - Sends an email containing the quote request details.
 */

import type { GenerateQuoteRequestInput } from '@/ai/flows/generate-quote-request';

const HARDCODED_RECIPIENT_EMAIL = "operations-team@example.com"; // Hard-coded as per requirement

interface EmailDetails {
  input: GenerateQuoteRequestInput;
  quoteRequest: string;
}

export async function sendQuoteRequestEmail({ input, quoteRequest }: EmailDetails): Promise<void> {
  const subject = "New ConfiguQuote Request Generated";
  const body = `
A new quote request has been generated with the following details:

Configuration Input:
--------------------
Daily Log Volume (GB): ${input.logsPerDayGb}
Data Retention Period: ${input.retentionDays} days
Data-at-Rest Encryption Required: ${input.dataAtRestEncryptionRequired ? 'Yes' : 'No'}
Operating Model: ${input.operatingModel}

Generated RFQ:
--------------
${quoteRequest}

--------------------
This is an automated notification from ConfiguQuote.
`;

  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  console.log("SIMULATING SENDING EMAIL (actual email not sent):");
  console.log(`To: ${HARDCODED_RECIPIENT_EMAIL}`);
  console.log(`Subject: ${subject}`);
  console.log("Body:");
  console.log(body);
  console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");

  // In a real application, you would use an email sending library (e.g., Nodemailer, SendGrid) here.
  // For example (pseudo-code):
  //
  // import nodemailer from 'nodemailer';
  // const transporter = nodemailer.createTransport({ /* SMTP config */ });
  // await transporter.sendMail({
  //   from: '"ConfiguQuote System" <noreply@example.com>',
  //   to: HARDCODED_RECIPIENT_EMAIL,
  //   subject: subject,
  //   text: body,
  // });
  // console.log("Email sent successfully (simulated).");

  return Promise.resolve();
}
