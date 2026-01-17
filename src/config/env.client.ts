import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_PUSHER_KEY: z.string(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string(),
  NEXT_PUBLIC_UPLOAD_API: z.string().optional(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
});

const parsed = clientSchema.safeParse({
  NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
  NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  NEXT_PUBLIC_UPLOAD_API: process.env.NEXT_PUBLIC_UPLOAD_API,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

if (!parsed.success) {
  console.error('Invalid client environment variables', parsed.error.format());
  throw new Error('Invalid client environment variables');
}

export const clientEnv = parsed.data;
