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
  input: { schema: z.object({ card: CardWithTransactionsSchema, rules: z.array(MisuseRuleSchema), rulesText: z.string() }) },
  output: { schema: z.object({ isSuspicious: z.boolean(), reasons: z.array(z.string()) }) },
  prompt: `You are a fraud detection expert for a discount card program. Your task is to analyze a single cardholder and their transactions based on a set of business rules.

**Cardholder Data:**
\`\`\`json
{{{json card}}}
\`\`\`

**Business Rules for Misuse:**
{{{rulesText}}}

**Instructions:**
1.  Carefully review each transaction for the cardholder based on the JSON data provided above.
2.  Evaluate the transactions against **each business rule** provided.
3.  You must check every rule. A card is suspicious if it violates **any** of the rules.
4.  **Transaction Amount Rule:** For each individual transaction, check if its 'transaction_amount' violates the rule. For example, if the rule is "Transaction Amount > 50", you must check if any single transaction has an amount greater than 50.
5.  **Payer Mismatch Rule:** Check if the 'payer_name' in transactions does not match 'primaryCardholderName' or 'cardholderName2'. If the rule is about a percentage, calculate the percentage of mismatched transactions out of the total number of transactions and check if it violates the rule.
6.  **Transaction Count Rule:** Count the number of transactions that occur within any 24-hour window. Check if this count violates the rule.
7.  **Stores Distance Rule:** Analyze 'transaction_store' and 'transaction_datetime' to check for transactions occurring at distant locations in an impossibly short timeframe. For example, a transaction in London and another in New York an hour later is impossible.
8.  If any rule is violated, set 'isSuspicious' to true and add the description of the violated rule to the 'reasons' array.
9.  If multiple rules are violated, add all corresponding reasons.
10. If no rules are violated after checking all transactions, set 'isSuspicious' to false.
11. Analyze based *only* on the provided cardholder JSON data and the business rules.
`,
});

const detectCardMisuseFlow = ai.defineFlow(
  {
    name: 'detectCardMisuseFlow',
    inputSchema: DetectCardMisuseInputSchema,
    outputSchema: DetectCardMisuseOutputSchema,
  },
  async ({ cards, transactions, rules }) => {
    
    if (!rules || rules.length === 0) {
      return { flaggedCards: [] };
    }
    
    let rulesText = rules.map((rule, i) => {
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

      const { output } = await misuseDetectionPrompt({ 
          card: cardWithTransactions, 
          rules,
          rulesText,
      });

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
