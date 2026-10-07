import type { ColorPreset } from '../types';

export const COLOR_PRESETS: ColorPreset[] = [
  { label: 'Negro Puro', value: '#000000' },
  { label: 'Obsidiana', value: '#09090b' },
  { label: 'Craft Dark', value: '#141415' },
  { label: 'Carbón', value: '#18181b' },
  { label: 'Medianoche', value: '#0a0f1d' },
  { label: 'Índigo', value: '#130e26' },
];

export function isSupportedColorPreset(hex: string): boolean {
  return COLOR_PRESETS.some(
    (p) => p.value.toLowerCase() === hex.toLowerCase(),
  );
}

export function validateImportJson(raw: string): { valid: boolean; error?: string } {
  if (!raw || !raw.trim()) {
    return { valid: false, error: 'Empty JSON payload' };
  }
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return { valid: false, error: 'JSON payload must be an object' };
    }
    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Invalid JSON format',
    };
  }
}
