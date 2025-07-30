'use server';
/**
 * @fileOverview An address validation AI agent.
 *
 * - validateAddress - A function that handles the address validation process.
 * - ValidateAddressInput - The input type for the validateAddress function.
 * - ValidateAddressOutput - The return type for the validateAddress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateAddressInputSchema = z.object({
  add1: z.string().describe('Address line 1'),
  add2: z.string().describe('Address line 2').optional(),
  add3: z.string().describe('Address line 3').optional(),
  add4: z.string().describe('Address line 4').optional(),
  add5: z.string().describe('Address line 5').optional(),
  postcode: z.string().describe('Postal code'),
});
export type ValidateAddressInput = z.infer<typeof ValidateAddressInputSchema>;

const ValidateAddressOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the address is valid or not'),
  validationMessage: z.string().describe('The validation message for the address.'),
});
export type ValidateAddressOutput = z.infer<typeof ValidateAddressOutputSchema>;

export async function validateAddress(input: ValidateAddressInput): Promise<ValidateAddressOutput> {
  return validateAddressFlow(input);
}

const validateAddressPrompt = ai.definePrompt({
  name: 'validateAddressPrompt',
  input: {schema: ValidateAddressInputSchema},
  output: {schema: ValidateAddressOutputSchema},
  prompt: `You are an address validation expert. Given the following address, determine if it is a valid address. If not, explain why.

Address:
Add1: {{{add1}}}
Add2: {{{add2}}}
Add3: {{{add3}}}
Add4: {{{add4}}}
Add5: {{{add5}}}
Postcode: {{{postcode}}}

Respond with JSON in the following format:
{
  "isValid": true/false,
  "validationMessage": "Explanation of why the address is valid or invalid"
}
`,
});

const validateAddressFlow = ai.defineFlow(
  {
    name: 'validateAddressFlow',
    inputSchema: ValidateAddressInputSchema,
    outputSchema: ValidateAddressOutputSchema,
  },
  async input => {
    const {output} = await validateAddressPrompt(input);
    return output!;
  }
);
