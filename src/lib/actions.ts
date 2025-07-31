
'use server';

import {
  validateAddress,
  type ValidateAddressInput,
  type ValidateAddressOutput,
} from '@/ai/flows/validate-address';
import { 
    detectCardMisuse,
    type DetectCardMisuseInput,
    type DetectCardMisuseOutput,
} from '@/ai/flows/detect-card-misuse';

export async function validateAddressAction(
  address: ValidateAddressInput
): Promise<ValidateAddressOutput> {
  try {
    const result = await validateAddress(address);
    return result;
  } catch (error) {
    console.error('Error validating address:', error);
    return {
      isValid: false,
      validationMessage:
        'An unexpected error occurred during address validation.',
    };
  }
}

export async function detectCardMisuseAction(
    input: DetectCardMisuseInput
  ): Promise<DetectCardMisuseOutput> {
    try {
      const result = await detectCardMisuse(input);
      return result;
    } catch (error) {
      console.error('Error detecting card misuse:', error);
      // It's better to return an empty list of flagged cards than to crash
      return {
        flaggedCards: [],
      };
    }
  }
