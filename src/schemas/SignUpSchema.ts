import { z } from 'zod';

export const usernameValidation = z
  .string()
  .min(2, 'username must be min 2 char')
  .max(20, 'username must be max 20 char')
  .regex(/^[a-zA-Z0-9_]+$/, 'username should not contain special character');

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: 'invalid email address' }),
  password: z.string().min(6, { message: 'password must be at least 6 characters' }),
});
