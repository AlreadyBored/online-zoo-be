import { z } from 'zod';

// Auth Register Schema
export const registerSchema = z.object({
  login: z
    .string()
    .min(3, { message: 'Login must be at least 3 characters' })
    .regex(/^[A-Za-z][A-Za-z]*$/, { message: 'Login must start with a letter and contain only English letters' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Password must contain at least 1 special character' }),
  name: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters' })
    .regex(/^[A-Za-z\s]+$/, { message: 'Name must contain only English letters and spaces' }),
  email: z
    .string()
    .email({ message: 'Invalid email format' })
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Invalid email format' }),
});

// Auth Login Schema
export const loginSchema = z.object({
  login: z.string().min(1, { message: 'Login is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Donation Schema
export const donationSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email format' }),
  amount: z.number().positive({ message: 'Amount must be a positive number' }),
  petId: z.number().int({ message: 'Pet ID must be an integer' }),
});

// Pet Detail Path Parameters Schema
export const petDetailParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, { message: 'Invalid pet ID' }).transform(Number),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DonationInput = z.infer<typeof donationSchema>;
export type PetDetailParams = z.infer<typeof petDetailParamsSchema>;
