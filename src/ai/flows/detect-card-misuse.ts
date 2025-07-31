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

const misuseDetectionPrompt = ai.definePrompt({
  name: 'misuseDetectionPrompt',
  input: { schema: z.object({ card: CardWithTransactionsSchema, rulesText: z.string() }) },
  output: { schema: z.object({ isSuspicious: z.boolean(), reasons: z.array(z.string()) }) },
  prompt: `You are a fraud detection expert for a discount card program.
Your task is to analyze the cardholder and their transactions based on a set of business rules.

**Cardholder:**
- **Primary:** {{{card.primaryCardholderName}}}
- **Secondary:** {{{card.cardholderName2}}}
- **Card Number:** {{{card.primaryCardNumberBarcode}}}

**Business Rules for Misuse:**
{{{rulesText}}}

**Instructions:**
1.  Carefully review each transaction listed below.
2.  For each transaction, check if it violates any of the business rules.
3.  Rules related to transaction counts or payer mismatches should be evaluated against the entire set of transactions.
4.  If you find any violations, set 'isSuspicious' to true.
5.  In the 'reasons' array, list the specific business rule descriptions that were violated.
6.  If no rules are violated after checking all transactions, set 'isSuspicious' to false.
7.  Analyze based *only* on the provided transactions and rules. If no rules are provided, nothing is suspicious.

**Transactions to Analyze:**
{{#each card.transactions}}
- **Transaction Date:** {{this.transaction_datetime}}
- **Store:** {{this.transaction_store}}
- **Amount:** {{this.transaction_amount}}
- **Payer:** {{this.payer_name}}
---
{{/each}}
`,
});

const detectCardMisuseFlow = ai.defineFlow(
  {
    name: 'detectCardMisuseFlow',
    inputSchema: DetectCardMisuseInputSchema,
    outputSchema: DetectCardMisuseOutputSchema,
  },
  async ({ cards, transactions, rules }) => {
    let rulesText = 'No rules provided.';
    if (rules && rules.length > 0) {
      rulesText = rules.map((rule, i) => {
        let description = '';
        switch(rule.field) {
            case 'payer_mismatch':
                description = `Payer name does not match either cardholder for more than ${rule.value}% of transactions.`;
                break;
            case 'transaction_amount':
                description = `A transaction's amount is ${rule.operator} ${rule.value}.`;
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

    const cardTransactionMap = new Map<string, z.infer<typeof transactionSchema>[]>();
    transactions.forEach(tx => {
        if (!tx.cardRecordId) return;
        if (!cardTransactionMap.has(tx.cardRecordId)) {
            cardTransactionMap.set(tx.cardRecordId, []);
        }
        cardTransactionMap.get(tx.cardRecordId)!.push(tx);
    });

    const flaggedCards: z.infer<typeof DetectCardMisuseOutputSchema>['flaggedCards'] = [];

    for (const card of cards) {
      if (!card.id) continue;
      const cardTransactions = cardTransactionMap.get(card.id) || [];
      if (cardTransactions.length === 0) continue;

      const cardWithTransactions = {
        ...card,
        transactions: cardTransactions,
      };

      const { output } = await misuseDetectionPrompt({ card: cardWithTransactions, rulesText });

      if (output?.isSuspicious && output.reasons.length > 0) {
        flaggedCards.push({
          ...card,
          transactions: cardTransactions,
          reasons: output.reasons,
        });
      }
    }

    return { flaggedCards };
  }
);
