
'use server';

import {
  validateAddress,
  type ValidateAddressInput,
  type ValidateAddressOutput,
} from '@/ai/flows/validate-address';

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
