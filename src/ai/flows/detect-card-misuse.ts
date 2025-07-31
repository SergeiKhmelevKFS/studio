
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

const MisuseRuleSchema = z.object({
  id: z.string(),
  field: z.enum(['payer_mismatch', 'transaction_amount', 'transaction_count', 'stores_distance']),
  operator: z.enum(['<', '<=', '>', '>=', '=']),
  value: z.string(),
});

// Schemas for individual records are imported from lib/types
const CardWithTransactionsSchema = cardSchema.extend({
    transactions: z.array(transactionSchema),
    reasons: z.array(z.string()).optional(),
});

const DetectCardMisuseInputSchema = z.object({
  cards: z.array(cardSchema),
  transactions: z.array(transactionSchema),
  rules: z.array(MisuseRuleSchema).optional(),
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

const defaultRulesText = `1.  **Payer Mismatch:** A high percentage of transactions (e.g., >50%) made by someone other than the primary or secondary cardholder.
2.  **High Frequency:** Too many transactions in a short period (e.g., more than 3 transactions in 24 hours).
3.  **Anomalous Geographic Velocity:** Transactions in geographically distant locations in an impossible timeframe (e.g., London and New York on the same day).`;

const misuseDetectionPrompt = ai.definePrompt({
  name: 'misuseDetectionPrompt',
  input: { schema: z.object({ card: CardWithTransactionsSchema, rulesText: z.string() }) },
  output: { schema: z.object({ isSuspicious: z.boolean(), reasons: z.array(z.string()) }) },
  prompt: `You are a fraud detection expert for a discount card program.
Analyze the following card and its associated transactions to determine if there is potential misuse based on the business rules provided.

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
{{{rulesText}}}

Based *only* on the rules provided, determine if the card activity is suspicious.
If it is suspicious, set isSuspicious to true and list the specific business rule descriptions that were violated in the reasons array.
If the activity is not suspicious, set isSuspicious to false.
`,
});

const detectCardMisuseFlow = ai.defineFlow(
  {
    name: 'detectCardMisuseFlow',
    inputSchema: DetectCardMisuseInputSchema,
    outputSchema: DetectCardMisuseOutputSchema,
  },
  async ({ cards, transactions, rules }) => {
    let rulesText = defaultRulesText;
    if (rules && rules.length > 0) {
      rulesText = rules.map((rule, i) => {
        let description = '';
        switch(rule.field) {
            case 'payer_mismatch':
                description = `Payer name does not match cardholder for more than ${rule.value}% of transactions.`;
                break;
            case 'transaction_amount':
                description = `A transaction amount is ${rule.operator} ${rule.value}.`;
                break;
            case 'transaction_count':
                description = `The number of transactions in a 24-hour period is ${rule.operator} ${rule.value}.`;
                break;
            case 'stores_distance':
                 description = `Transactions occurred at stores more than ${rule.value}km apart in an impossible timeframe.`;
                 break;
        }
        return `${i + 1}. **${description}**`;
      }).join('\n');
    }

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

          return misuseDetectionPrompt({ card: cardWithTransactions, rulesText }).then(({ output }) => {
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
      .filter(p => p !== null) as Promise<z.infer<typeof DetectCardMisuseOutputSchema>['flaggedCards'][number] | null>[];

    const results = await Promise.all(analysisPromises);
    
    results.forEach(result => {
        if (result) {
            flaggedCards.push(result);
        }
    });

    return { flaggedCards };
  }
);
