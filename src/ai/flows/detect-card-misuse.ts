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
import { getDistance } from '@/ai/tools/location';

const MisuseRuleSchema = z.object({
  id: z.string(),
  field: z.enum(['payer_mismatch', 'transaction_amount', 'transaction_count', 'stores_distance']),
  operator: z.enum(['<', '<=', '>', '>=', '=']),
  value: z.string(),
});

const CardWithTransactionsSchema = cardSchema.extend({
    transactions: z.array(transactionSchema),
});

const DetectCardMisuseInputSchema = z.object({
  cards: z.array(cardSchema),
  transactions: z.array(transactionSchema),
  rules: z.array(MisuseRuleSchema),
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
  tools: [getDistance],
  input: { schema: z.object({ card: CardWithTransactionsSchema, rules: z.array(MisuseRuleSchema) }) },
  output: { schema: z.object({ isSuspicious: z.boolean(), reasons: z.array(z.string()) }) },
  prompt: `You are a fraud detection expert for a discount card program. Your task is to analyze a single cardholder and their transactions based on a set of business rules.

**Cardholder & Transaction Data:**
\`\`\`json
{{{json card}}}
\`\`\`

**Business Rules for Misuse:**
\`\`\`json
{{{json rules}}}
\`\`\`

**Instructions:**
1.  Carefully review the cardholder's data and all associated transactions.
2.  Evaluate the card against **each business rule** provided. A card is suspicious if it violates **any** of the rules.
3.  For each rule violation, add a concise reason to the 'reasons' array. Check all rules and report all violations.
4.  If after checking all rules and all transactions, no violations are found, set 'isSuspicious' to false.

**How to Evaluate Rules:**

*   **payer_mismatch**:
    1.  The primary cardholder is \`{{card.primaryCardholderName}}\`. An additional cardholder may be listed under \`{{card.cardholderName2}}\`.
    2.  Count the total number of transactions.
    3.  Count the number of transactions where the \`payer_name\` is NOT one of the cardholders.
    4.  Calculate the percentage of mismatched transactions.
    5.  Compare this percentage to the threshold provided in the rule. For a rule of { "operator": ">", "value": "50" }, you would check if the mismatch percentage is greater than 50%.

*   **transaction_amount**:
    1.  Iterate through each transaction individually.
    2.  For each transaction, compare its \`transaction_amount\` to the value in the rule using the specified operator.
    3.  If any single transaction violates the rule, the card is suspicious. For example, for { "operator": ">", "value": "100" }, flag the card if any transaction is over $100.

*   **transaction_count**:
    1.  This rule checks for an excessive number of transactions within any 24-hour rolling window.
    2.  Sort transactions by \`transaction_datetime\`.
    3.  Iterate through the transactions and count how many fall within a 24-hour period of the current transaction.
    4.  Compare this count against the rule's value and operator. For a rule of { "operator": ">", "value": "3" }, flag the card if you find 4 or more transactions in any 24-hour window.

*   **stores_distance**:
    1.  This rule checks for transactions at distant locations within an impossible timeframe.
    2.  Sort transactions by \`transaction_datetime\`.
    3.  For every pair of consecutive transactions, calculate the time difference in hours.
    4.  If the time difference is short (e.g., < 24 hours), use the \`getDistance\` tool to find the distance in kilometers between the two \`transaction_store\` locations.
    5.  Calculate the required travel speed (distance / hours). A speed greater than ~800 km/h is generally impossible.
    6.  If you find any pair of transactions that represents impossible travel, the card is suspicious.
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
      });

      if (output?.isSuspicious && output.reasons.length > 0) {
        // Use the rule descriptions for the reasons to keep them user-friendly
        const formattedReasons = output.reasons;
        flaggedCards.push({
          ...card,
          transactions: cardTransactions,
          reasons: formattedReasons,
        });
      }
    }

    return { flaggedCards };
  }
);
