import type { TradingOpportunity } from '../types';

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title: string;
  description: string;
  color: number; // Decimal color code
  fields: DiscordEmbedField[];
  footer?: { text: string };
  timestamp?: string;
}

export interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds: DiscordEmbed[];
}

/**
 * Sends a trading opportunity signal to a user's Discord webhook
 */
export async function sendOpportunityToDiscord(
  webhookUrl: string,
  opp: TradingOpportunity,
): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    return { success: false, error: 'URL de Webhook de Discord inválida.' };
  }

  const isBuyOrArb = opp.type === 'DIP_BUY' || opp.type === 'CRAFT_ARBITRAGE';
  const color = opp.type === 'WATCHLIST_HIT'
    ? 0xa855f7 // Purple
    : isBuyOrArb
      ? 0x22c55e // Green
      : 0xf59e0b; // Gold / Amber

  const typeLabels = {
    DIP_BUY: '🟢 OPORTUNIDAD DE COMPRA (DIP)',
    SPIKE_SELL: '🟡 OPORTUNIDAD DE VENTA (SPIKE)',
    CRAFT_ARBITRAGE: '⚡ ARBITRAJE DE PRODUCCIÓN (MAKE VS BUY)',
    WATCHLIST_HIT: '🎯 ALERTA DE PRECIO OBJETIVO',
  };

  const payload: DiscordWebhookPayload = {
    username: 'Craft Companion Trading Bot',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80',
    embeds: [
      {
        title: `${typeLabels[opp.type]} • ${opp.symbol}`,
        description: opp.reason,
        color,
        fields: [
          {
            name: 'Score de Oportunidad',
            value: `**${opp.score}/100 (Tier ${opp.tier})**`,
            inline: true,
          },
          {
            name: 'Margen Neto Estimado',
            value: `**+${opp.potentialMarginPercent}%**`,
            inline: true,
          },
          {
            name: 'Precio Actual',
            value: `${opp.currentPrice.toLocaleString()} COIN`,
            inline: true,
          },
          {
            name: 'Recomendación del Bot',
            value: opp.actionRecommendation,
            inline: false,
          },
        ],
        footer: {
          text: 'Craft Companion • Trading Engine v2.0',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { success: false, error: `Discord respondió con estado HTTP ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Error de conexión con Discord' };
  }
}

/**
 * Sends a test ping to verify Discord webhook configuration
 */
export async function sendTestDiscordWebhook(
  webhookUrl: string,
): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    return { success: false, error: 'URL de Webhook de Discord inválida.' };
  }

  const payload: DiscordWebhookPayload = {
    username: 'Craft Companion Trading Bot',
    content: '🚀 **¡Conexión exitosa!** El Trading Bot de Craft-Companion está sincronizado con tu canal.',
    embeds: [
      {
        title: '📡 Monitoreo de Mercado en Tiempo Real Activo',
        description: 'Recibirás alertas automáticas de dips, picos de venta y oportunidades de arbitraje industrial instantáneamente.',
        color: 0x3b82f6,
        fields: [
          { name: 'Estado', value: '🟢 Conectado y Escaneando', inline: true },
          { name: 'Plataforma', value: 'Craft-Companion Suite', inline: true },
        ],
        footer: { text: 'Test de Integración' },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { success: false, error: `Error ${res.status}: Verifica los permisos del webhook.` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Error de red' };
  }
}
