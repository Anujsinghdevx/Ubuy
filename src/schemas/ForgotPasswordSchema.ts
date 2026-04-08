import { z } from 'zod';

export const forgotPasswordEmailSchema = z.object({
  email: z.string().email('A valid email is required'),
});

export const forgotPasswordCodeSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});
