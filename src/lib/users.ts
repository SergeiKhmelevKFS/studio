
import { z } from 'zod';

export const userRoles = ['Administrator', 'Fraud Analyst', 'Digital Discount Card Manager'] as const;

export const userSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(userRoles),
});

export type User = {
    username: string;
    role: string;
};

export type UserRecord = z.infer<typeof userSchema>;

export const users: Record<string, { password: string, role: string }> = {
    admin: { password: '123', role: 'Administrator' },
    fraud_analyst: { password: '123', role: 'Fraud Analyst' },
    card_manager: { password: '123', role: 'Digital Discount Card Manager' },
};
