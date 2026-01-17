import { z } from 'zod';

const serverSchema = z.object({
  MONGODB_URI: z.string().url(),
  PUSHER_APP_ID: z.string(),
  PUSHER_SECRET: z.string(),
  PUSHER_KEY: z.string(),
  PUSHER_CLUSTER: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  TURNSTILE_SECRET_KEY: z.string(),
  CASHFREE_CLIENT_ID: z.string(),
  CASHFREE_CLIENT_SECRET: z.string(),
  SMTP_EMAIL: z.string().email(),
  SMTP_PASSWORD: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url().optional(),
});

const parsed = serverSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast with a readable error set.
  console.error('Invalid server environment variables', parsed.error.format());
  throw new Error('Invalid server environment variables');
}

export const serverEnv = parsed.data;
