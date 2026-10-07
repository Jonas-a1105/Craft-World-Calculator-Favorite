import React, { useState, useEffect, createElement } from 'react';
import {
  CheckCircleBold,
  DangerCircleBold,
  DangerTriangleBold,
  InfoCircleBold,
  BoltBold,
  RefreshLinear,
} from 'solar-icon-set';
import { sileo } from 'sileo';
import type { SileoOptions, SileoPosition } from 'sileo';

export type { SileoPosition, SileoOptions };

export type SileoTheme = 'dark' | 'light' | 'system';

export interface SileoUserConfig {
  position: SileoPosition;
  theme: SileoTheme;
  fill: string;
  roundness: number;
  autopilot: boolean;
}

export const DEFAULT_SILEO_CONFIG: SileoUserConfig = {
  position: 'top-center',
  theme: 'light',
  fill: '#ffffff',
  roundness: 16,
  autopilot: true,
};

const STORAGE_KEY = 'craftworld.sileo.settings';

export function getSileoConfig(): SileoUserConfig {
  if (typeof window === 'undefined') return DEFAULT_SILEO_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SILEO_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SILEO_CONFIG,
      ...parsed,
    };
  } catch {
    return DEFAULT_SILEO_CONFIG;
  }
}

const listeners = new Set<(config: SileoUserConfig) => void>();

export function applySileoStyleClasses(config: SileoUserConfig) {
  if (typeof document === 'undefined') return;
  const isLight =
    config.fill.toLowerCase() === '#ffffff' ||
    config.fill.toLowerCase() === '#fff' ||
    config.fill.toLowerCase() === 'white';
  if (isLight) {
    document.body.classList.add('sileo-fill-light');
  } else {
    document.body.classList.remove('sileo-fill-light');
  }
}

export function saveSileoConfig(config: Partial<SileoUserConfig>): SileoUserConfig {
  const current = getSileoConfig();
  const updated: SileoUserConfig = { ...current, ...config };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    applySileoStyleClasses(updated);
  }
  listeners.forEach((fn) => fn(updated));
  return updated;
}

export function useSileoConfig() {
  const [config, setConfig] = useState<SileoUserConfig>(getSileoConfig);

  useEffect(() => {
    applySileoStyleClasses(config);
    const update = (next: SileoUserConfig) => {
      applySileoStyleClasses(next);
      setConfig(next);
    };
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, [config.fill]);

  return {
    config,
    updateConfig: saveSileoConfig,
  };
}

/**
 * Format error object or message into a clean, human-readable string.
 */
export function formatErrorMessage(err: unknown): { title: string; description?: string } {
  if (!err) {
    return { title: 'Error desconocido', description: 'Ocurrió un problema inesperado' };
  }

  if (typeof err === 'string') {
    return { title: 'Error en la operación', description: err };
  }

  if (err instanceof Error) {
    // Clean up network and standard errors
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      return {
        title: 'Fallo de Conexión',
        description: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      };
    }
    return {
      title: 'Error en la solicitud',
      description: err.message,
    };
  }

  if (typeof err === 'object' && err !== null) {
    const record = err as Record<string, unknown>;
    const title = (record.title as string) || (record.error as string) || 'Error en el sistema';
    const description = (record.description as string) || (record.message as string);
    return { title, description };
  }

  return { title: 'Error', description: String(err) };
}

// Global High-Level Sileo Helpers

export const notifySuccess = (
  title: string,
  description?: string,
  options?: Partial<SileoOptions>
) => {
  return sileo.success({
    title,
    description,
    icon: options?.icon !== undefined ? options.icon : createElement(CheckCircleBold, { className: 'w-4 h-4' }),
    ...options,
  });
};

export const notifyError = (
  errorOrTitle: unknown,
  description?: string,
  options?: Partial<SileoOptions>
) => {
  const defaultIcon = createElement(DangerCircleBold, { className: 'w-4 h-4' });
  if (typeof errorOrTitle === 'string' && description) {
    return sileo.error({
      title: errorOrTitle,
      description,
      icon: options?.icon !== undefined ? options.icon : defaultIcon,
      ...options,
    });
  }

  const formatted = formatErrorMessage(errorOrTitle);
  return sileo.error({
    title: formatted.title,
    description: description || formatted.description,
    icon: options?.icon !== undefined ? options.icon : defaultIcon,
    ...options,
  });
};

export const notifyWarning = (
  title: string,
  description?: string,
  options?: Partial<SileoOptions>
) => {
  return sileo.warning({
    title,
    description,
    icon: options?.icon !== undefined ? options.icon : createElement(DangerTriangleBold, { className: 'w-4 h-4' }),
    ...options,
  });
};

export const notifyInfo = (
  title: string,
  description?: string,
  options?: Partial<SileoOptions>
) => {
  return sileo.info({
    title,
    description,
    icon: options?.icon !== undefined ? options.icon : createElement(InfoCircleBold, { className: 'w-4 h-4' }),
    ...options,
  });
};

export const notifyAction = (
  title: string,
  description: string,
  button: { title: string; onClick: () => void },
  options?: Partial<SileoOptions>
) => {
  return sileo.action({
    title,
    description,
    button,
    icon: options?.icon !== undefined ? options.icon : createElement(BoltBold, { className: 'w-4 h-4' }),
    ...options,
  });
};

export const notifyPromise = <T,>(
  promise: Promise<T> | (() => Promise<T>),
  options: {
    loading: SileoOptions;
    success: SileoOptions | ((data: T) => SileoOptions);
    error: SileoOptions | ((err: unknown) => SileoOptions);
    action?: SileoOptions | ((data: T) => SileoOptions);
    position?: SileoPosition;
  }
) => {
  const loadingIcon = createElement(RefreshLinear, { className: 'w-4 h-4 animate-spin' });
  const successIcon = createElement(CheckCircleBold, { className: 'w-4 h-4' });
  const errorIcon = createElement(DangerCircleBold, { className: 'w-4 h-4' });

  const loadingOpts: SileoOptions = {
    icon: options.loading.icon !== undefined ? options.loading.icon : loadingIcon,
    ...options.loading,
  };

  const wrapHandler = (
    handler: SileoOptions | ((val: any) => SileoOptions),
    defaultIcon: React.ReactNode
  ) => {
    if (typeof handler === 'function') {
      return (val: any) => {
        const res = handler(val);
        return {
          icon: res.icon !== undefined ? res.icon : defaultIcon,
          ...res,
        };
      };
    }
    return {
      icon: handler.icon !== undefined ? handler.icon : defaultIcon,
      ...handler,
    };
  };

  return sileo.promise(promise, {
    loading: loadingOpts,
    success: wrapHandler(options.success, successIcon),
    error: wrapHandler(options.error, errorIcon),
    ...(options.action ? { action: wrapHandler(options.action, createElement(BoltBold, { className: 'w-4 h-4' })) } : {}),
    ...(options.position ? { position: options.position } : {}),
  });
};

export const dismissToast = (id: string) => {
  sileo.dismiss(id);
};

export const clearToasts = (position?: SileoPosition) => {
  sileo.clear(position);
};

/**
 * Initializes global runtime error listeners (unhandledrejection and window.onerror)
 * to intercept and surface any unexpected frontend errors via Sileo.
 */
let errorListenersInitialized = false;

export function initGlobalErrorHandlers() {
  if (typeof window === 'undefined' || errorListenersInitialized) return;
  errorListenersInitialized = true;
  applySileoStyleClasses(getSileoConfig());

  window.addEventListener('unhandledrejection', (event) => {
    // Avoid spamming for intentional aborted requests or OAuth popups
    if (event.reason?.name === 'AbortError') return;
    notifyError(event.reason, 'Ocurrió un error no controlado en la aplicación.');
  });

  window.addEventListener('error', (event) => {
    // Filter out harmless extension scripts or resize observer noise
    if (event.message?.includes('ResizeObserver')) return;
    if (event.message?.includes('Script error.')) return;
    notifyError(event.message || 'Error en la interfaz', 'Ocurrió una excepción visual en la página.');
  });
}
