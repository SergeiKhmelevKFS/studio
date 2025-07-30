import { z } from 'zod';

export const cardSchema = z.object({
  id: z.string().optional(),
  staffId: z.string().min(1, 'Staff ID is required'),
  companyName: z.string().min(1, 'Company Name is required'),
  primaryCardholderName: z.string().min(1, 'Cardholder Name is required'),
  primaryCardNumberBarcode: z.string().min(1, 'Primary Card Number is required'),
  magStripe: z.string().optional(),
  add1: z.string().min(1, 'Address Line 1 is required'),
  add2: z.string().optional(),
  add3: z.string().optional(),
  add4: z.string().optional(),
  add5: z.string().optional(),
  postcode: z.string().min(1, 'Postcode is required'),
  validFrom: z.coerce.date({ required_error: 'Please select a date' }),
  expires: z.coerce.date({ required_error: 'Please select a date' }),
  letterFlag: z.boolean().default(false),
  overseas: z.boolean().default(false),
  cardholderName2: z.string().optional(),
  cardNumber2: z.string().optional(),
  primaryCardIssueDate: z.coerce.date({
    required_error: 'Please select a date',
  }),
  primaryReplacementCardIssueDate: z.coerce.date().optional(),
  primaryPartCardNumberBarcode: z.string().optional(),
  fullCardNoInCirculation: z.string().optional(),
  primaryCardType: z.string().optional(),
  nextPrimaryCardToBeCharged: z.boolean().default(false),
  active: z.boolean().default(true),
  reason: z.string().optional(),
});

export type CardRecord = z.infer<typeof cardSchema>;

export const transactionSchema = z.object({
  id: z.string(),
  cardRecordId: z.string(),
  cardNumber: z.string(),
  transaction_datetime: z.coerce.date(),
  transaction_store: z.string(),
  transaction_amount: z.number(),
  transaction_discount: z.number(),
  payer_name: z.string(),
  payer_card_number: z.string(),
});

export type TransactionRecord = z.infer<typeof transactionSchema>;
