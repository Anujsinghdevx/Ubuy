import { z } from 'zod';

// Define the environment variable schema
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

// Parse and validate environment variables
const parsed = serverSchema.safeParse(process.env);

// Check if the parsed environment variables are valid
if (!parsed.success) {
  // Log each missing or invalid environment variable
  Object.keys(serverSchema.shape).forEach((key) => {
    if (!process.env[key]) {
      console.error(`Environment variable ${key} is missing or invalid.`);
    }
  });

  // Log detailed error message
  console.error('Invalid server environment variables', parsed.error.format());
  
  // Fail the application if variables are invalid
  throw new Error('Invalid server environment variables');
}

// Export validated environment variables
export const serverEnv = parsed.data;
