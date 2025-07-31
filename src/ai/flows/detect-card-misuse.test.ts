import { describe, it, expect, beforeAll, vi } from 'vitest';
import { detectCardMisuse, type DetectCardMisuseInput } from './detect-card-misuse';
import type { CardRecord, TransactionRecord } from '@/lib/types';
import type { MisuseRule } from '@/components/edit-misuse-rules-sheet';
import dotenv from 'dotenv';
import * as LocationTool from '@/ai/tools/location';

// Load environment variables if necessary
beforeAll(() => {
    dotenv.config();
});

// Mock the location tool to return predictable distances
vi.spyOn(LocationTool, 'getDistance').mockImplementation(
    // @ts-ignore
    async (input) => {
        const { loc1, loc2 } = input;
        if ((loc1.includes('London') && loc2.includes('New York')) || (loc1.includes('New York') && loc2.includes('London'))) {
            return { distanceKm: 5567 };
        }
        if ((loc1.includes('London') && loc2.includes('Manchester')) || (loc1.includes('Manchester') && loc2.includes('London'))) {
            return { distanceKm: 330 };
        }
        return { distanceKm: 50 }; // Default short distance
    }
);


const createCard = (id: string, name: string): CardRecord => ({
    id,
    staffId: `test-${id}`,
    companyName: 'Test Inc.',
    primaryCardholderName: name,
    primaryCardNumberBarcode: `635666${id}`,
    add1: '123 Test St',
    postcode: '12345',
    validFrom: new Date('2023-01-01'),
    expires: new Date('2025-12-31'),
    primaryCardIssueDate: new Date('2023-01-01'),
    active: true,
});

const createTransaction = (card: CardRecord, id: string, amount: number, payerName: string, datetime: Date, store: string = 'B&Q Test'): TransactionRecord => ({
    id: `txn-${id}`,
    cardRecordId: card.id!,
    cardNumber: card.primaryCardNumberBarcode,
    transaction_amount: amount,
    payer_name: payerName,
    transaction_datetime: datetime,
    transaction_store: store,
    transaction_discount: amount * 0.1,
    payer_card_number: '**** **** **** 1234',
});

describe('detectCardMisuse Flow', () => {

    it('should not flag a card that does not violate any rules', async () => {
        const card = createCard('clean-1', 'Clean User');
        const transactions = [
            createTransaction(card, '1', 25, 'Clean User', new Date()),
        ];
        const rules: MisuseRule[] = [
            { id: '1', field: 'transaction_amount', operator: '>', value: '50' },
        ];

        const input: DetectCardMisuseInput = { cards: [card], transactions, rules };
        const result = await detectCardMisuse(input);

        expect(result.flaggedCards).toHaveLength(0);
    });

    it('should flag a card for transaction amount violation', async () => {
        const card = createCard('amount-1', 'Amount User');
        const transactions = [
            createTransaction(card, '1', 75, 'Amount User', new Date()),
            createTransaction(card, '2', 25, 'Amount User', new Date()),
        ];
        const rules: MisuseRule[] = [
            { id: '1', field: 'transaction_amount', operator: '>', value: '50' },
        ];

        const input: DetectCardMisuseInput = { cards: [card], transactions, rules };
        const result = await detectCardMisuse(input);
        
        expect(result.flaggedCards).toHaveLength(1);
        expect(result.flaggedCards[0].id).toBe('amount-1');
        expect(result.flaggedCards[0].reasons[0]).toContain("violates transaction amount rule");
    }, 15000);

    it('should flag a card for transaction count violation within 24 hours', async () => {
        const card = createCard('count-1', 'Count User');
        const now = new Date();
        const transactions = [
            createTransaction(card, '1', 10, 'Count User', new Date(now.getTime() - 1 * 60 * 60 * 1000)),
            createTransaction(card, '2', 10, 'Count User', new Date(now.getTime() - 2 * 60 * 60 * 1000)),
            createTransaction(card, '3', 10, 'Count User', new Date(now.getTime() - 3 * 60 * 60 * 1000)),
            createTransaction(card, '4', 10, 'Count User', new Date(now.getTime() - 4 * 60 * 60 * 1000)),
            createTransaction(card, '5', 10, 'Count User', new Date(now.getTime() - 48 * 60 * 60 * 1000)), // outside 24h window
        ];
        const rules: MisuseRule[] = [
            { id: '1', field: 'transaction_count', operator: '>', value: '3' },
        ];

        const input: DetectCardMisuseInput = { cards: [card], transactions, rules };
        const result = await detectCardMisuse(input);

        expect(result.flaggedCards).toHaveLength(1);
        expect(result.flaggedCards[0].id).toBe('count-1');
        expect(result.flaggedCards[0].reasons[0]).toContain("violates transaction count rule");
    }, 15000);

    it('should flag a card for payer mismatch violation', async () => {
        const card = createCard('payer-1', 'Payer User');
        const transactions = [
            createTransaction(card, '1', 10, 'Fraudulent Frank', new Date()),
            createTransaction(card, '2', 10, 'Malicious Mallory', new Date()),
            createTransaction(card, '3', 10, 'Payer User', new Date()),
        ];
        const rules: MisuseRule[] = [
            { id: '1', field: 'payer_mismatch', operator: '>', value: '50' }, // 2/3 = 66.7% > 50%
        ];

        const input: DetectCardMisuseInput = { cards: [card], transactions, rules };
        const result = await detectCardMisuse(input);

        expect(result.flaggedCards).toHaveLength(1);
        expect(result.flaggedCards[0].id).toBe('payer-1');
        expect(result.flaggedCards[0].reasons[0]).toContain("violates payer mismatch rule");
    }, 15000);

    it('should flag a card for impossible stores distance violation', async () => {
        const card = createCard('geo-1', 'Geo User');
        const now = new Date();
        const transactions = [
            createTransaction(card, '1', 20, 'Geo User', now, 'B&Q London'),
            createTransaction(card, '2', 20, 'Geo User', new Date(now.getTime() + 1 * 60 * 60 * 1000), 'B&Q New York'),
        ];
        const rules: MisuseRule[] = [
            { id: '1', field: 'stores_distance', operator: '>', value: '100' },
        ];

        const input: DetectCardMisuseInput = { cards: [card], transactions, rules };
        const result = await detectCardMisuse(input);

        expect(result.flaggedCards).toHaveLength(1);
        expect(result.flaggedCards[0].id).toBe('geo-1');
        expect(result.flaggedCards[0].reasons[0]).toContain("violates store distance rule");
    }, 15000);
    
    it('should flag a single card with multiple violations and list all reasons', async () => {
        const card = createCard('multi-1', 'Multi User');
        const transactions = [
            createTransaction(card, '1', 99, 'Multi User', new Date()),
            createTransaction(card, '2', 10, 'Suspicious Sam', new Date()),
        ];
         const rules: MisuseRule[] = [
            { id: '1', field: 'transaction_amount', operator: '>', value: '50' },
            { id: '2', field: 'payer_mismatch', operator: '>', value: '40' }, // 1/2 = 50% > 40%
        ];

        const input: DetectCardMisuseInput = { cards: [card], transactions, rules };
        const result = await detectCardMisuse(input);
        
        expect(result.flaggedCards).toHaveLength(1);
        expect(result.flaggedCards[0].id).toBe('multi-1');
        expect(result.flaggedCards[0].reasons).toHaveLength(2);
        expect(result.flaggedCards[0].reasons).toEqual(
            expect.arrayContaining([
                expect.stringMatching(/transaction amount/i),
                expect.stringMatching(/payer mismatch/i)
            ])
        );
    }, 20000);

    it('should return an empty array if no rules are provided', async () => {
        const card = createCard('no-rules-1', 'NoRules User');
        const transactions = [
            createTransaction(card, '1', 999, 'NoRules User', new Date()),
        ];
        const rules: MisuseRule[] = [];

        const input: DetectCardMisuseInput = { cards: [card], transactions, rules };
        const result = await detectCardMisuse(input);

        expect(result.flaggedCards).toHaveLength(0);
    });
});
