import { z } from 'zod';

export const quickLoginSchema = z.object({
  uid: z.string().min(1).default('craft_player'),
  displayName: z.string().optional(),
});

export const oauthCallbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export const authorizeQuerySchema = z.object({
  origin: z.string().optional(),
});

export type QuickLoginInput = z.infer<typeof quickLoginSchema>;
export type OAuthCallbackQuery = z.infer<typeof oauthCallbackQuerySchema>;
export type AuthorizeQuery = z.infer<typeof authorizeQuerySchema>;
