import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SESSION_SECRET: z.string().min(8).default('craftworld_secret_session_key_2026'),
  JWT_SECRET: z.string().optional(),
  DATA_DIR: z.string().default('./data'),
  DATABASE_URL: z.string().default('file:../data/craftcompanion.db'),
  CRAFTWORLD_BASE_URL: z.string().url().default('https://craft-world.gg'),
  CRAFTWORLD_EXTERNAL_API_BASE: z.string().url().default('https://craft-world.gg/api/2/external'),
  CRAFTWORLD_OAUTH_CLIENT_ID: z.string().default(''),
  CRAFTWORLD_OAUTH_CLIENT_SECRET: z.string().default(''),
  CRAFTWORLD_OAUTH_REDIRECT_URI: z.string().default(''),
  CRAFTWORLD_OAUTH_SCOPES: z
    .string()
    .default('craft:read exchange:read inventory:read onchain:read purchases:read')
    .transform((val) => val.split(/\s+/).filter(Boolean)),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  SESSION_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(604800),
});

function loadConfig() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables configuration:');
    console.error(parsed.error.format());
    throw new Error('Environment configuration validation failed');
  }
  return parsed.data;
}

export const env = loadConfig();
export type EnvironmentConfig = z.infer<typeof envSchema>;
