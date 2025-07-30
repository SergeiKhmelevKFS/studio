
'use server';
/**
 * @fileOverview An AI agent for detecting potential discount card misuse.
 *
 * - detectCardMisuse - A function that analyzes card transactions based on a set of business rules.
 * - DetectCardMisuseInput - The input type for the detectCardMisuse function.
 * - DetectCardMisuseOutput - The return type for the detectCardMisuse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { cardSchema, transactionSchema } from '@/lib/types';

// Schemas for individual records are imported from lib/types
const CardWithTransactionsSchema = cardSchema.extend({
    transactions: z.array(transactionSchema),
    reasons: z.array(z.string()).optional(),
});

const DetectCardMisuseInputSchema = z.object({
  cards: z.array(cardSchema),
  transactions: z.array(transactionSchema),
});
export type DetectCardMisuseInput = z.infer<typeof DetectCardMisuseInputSchema>;

const DetectCardMisuseOutputSchema = z.object({
  flaggedCards: z.array(CardWithTransactionsSchema.extend({
      reasons: z.array(z.string()),
  })),
});
export type DetectCardMisuseOutput = z.infer<typeof DetectCardMisuseOutputSchema>;

export async function detectCardMisuse(input: DetectCardMisuseInput): Promise<DetectCardMisuseOutput> {
  return detectCardMisuseFlow(input);
}

const misuseDetectionPrompt = ai.definePrompt({
  name: 'misuseDetectionPrompt',
  input: { schema: z.object({ card: CardWithTransactionsSchema }) },
  output: { schema: z.object({ isSuspicious: z.boolean(), reasons: z.array(z.string()) }) },
  prompt: `You are a fraud detection expert for a discount card program.
Analyze the following card and its associated transactions to determine if there is potential misuse.

- **Cardholder:** {{{card.primaryCardholderName}}}
- **Secondary Cardholder:** {{{card.cardholderName2}}}
- **Card Number:** {{{card.primaryCardNumberBarcode}}}

**Transactions:**
{{#each card.transactions}}
- **Date:** {{this.transaction_datetime}}
- **Store:** {{this.transaction_store}}
- **Amount:** {{this.transaction_amount}}
- **Payer:** {{this.payer_name}}
{{/each}}

**Business Rules for Misuse:**
1.  **Payer Mismatch:** A high percentage of transactions (e.g., >50%) made by someone other than the primary or secondary cardholder.
2.  **High Frequency:** Too many transactions in a short period (e.g., more than 3 transactions in 24 hours).
3.  **Anomalous Geographic Velocity:** Transactions in geographically distant locations in an impossible timeframe (e.g., London and New York on the same day).

Based on these rules, determine if the card activity is suspicious and list the specific rules that were violated.
`,
});

const detectCardMisuseFlow = ai.defineFlow(
  {
    name: 'detectCardMisuseFlow',
    inputSchema: DetectCardMisuseInputSchema,
    outputSchema: DetectCardMisuseOutputSchema,
  },
  async ({ cards, transactions }) => {
    const flaggedCards: z.infer<typeof DetectCardMisuseOutputSchema>['flaggedCards'] = [];

    const cardTransactionMap = new Map<string, z.infer<typeof transactionSchema>[]>();
    transactions.forEach(tx => {
        if (!tx.cardRecordId) return;
        if (!cardTransactionMap.has(tx.cardRecordId)) {
            cardTransactionMap.set(tx.cardRecordId, []);
        }
        cardTransactionMap.get(tx.cardRecordId)!.push(tx);
    });

    const analysisPromises = cards
      .map(card => {
          if (!card.id) return null;
          const cardTransactions = cardTransactionMap.get(card.id) || [];
          if (cardTransactions.length === 0) return null;

          const cardWithTransactions = {
              ...card,
              transactions: cardTransactions,
          };

          return misuseDetectionPrompt({ card: cardWithTransactions }).then(({ output }) => {
              if (output?.isSuspicious && output.reasons.length > 0) {
                  return {
                      ...card,
                      transactions: cardTransactions,
                      reasons: output.reasons,
                  };
              }
              return null;
          });
      })
      .filter(p => p !== null);

    const results = await Promise.all(analysisPromises);
    
    results.forEach(result => {
        if (result) {
            flaggedCards.push(result);
        }
    });

    return { flaggedCards };
  }
);
