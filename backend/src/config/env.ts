import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  COGNODB_URI: z.string().min(1, 'COGNODB_URI is required'),
  COGNODB_USER: z.string().min(1, 'COGNODB_USER is required'),
  COGNODB_PASSWORD: z.string().min(1, 'COGNODB_PASSWORD is required'),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
