import React from 'react';
import { useLocation } from 'react-router-dom';

interface ModuleErrorBoundaryProps {
  children: React.ReactNode;
}

interface ModuleErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Wrapper de ubicación para el boundary: lee la ruta actual para incluirla en
 * el diagnóstico copiable (los class components no pueden usar hooks).
 */
const RouteAwareFallback: React.FC<{
  error: Error | null;
  onRetry: () => void;
}> = ({ error, onRetry }) => {
  const location = useLocation();
  const isEs =
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem('language') || navigator.language).startsWith('es')
      : navigator.language.startsWith('es');

  const copyDiagnostics = async () => {
    const diag = [
      'Craft Companion — module crash report',
      `Route: ${location.pathname}`,
      `Time: ${new Date().toISOString()}`,
      `Error: ${error?.message || 'unknown'}`,
      '',
      error?.stack || '(no stack)',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(diag);
    } catch {
      // clipboard API unavailable in some non-secure contexts
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 pt-10">
      <div className="w-full max-w-md bg-oled-card rounded-[28px] p-6 sm:p-8 text-center shadow-oled-card">
        <div
          className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center text-2xl"
          aria-hidden="true"
        >
          ⚠
        </div>
        <h2 className="mt-4 text-lg font-bold text-white tracking-tight">
          {isEs ? 'Este panel no pudo cargarse' : 'This panel could not load'}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {isEs
            ? 'Ocurrió un error inesperado al renderizar esta sección. El resto de la aplicación sigue funcionando con normalidad.'
            : 'An unexpected error occurred while rendering this section. The rest of the app keeps working normally.'}
        </p>
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold transition-colors cursor-pointer border-0 outline-none"
          >
            {isEs ? 'Reintentar' : 'Retry'}
          </button>
          <button
            type="button"
            onClick={copyDiagnostics}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-oled-pill hover:bg-oled-pillHover text-zinc-200 text-sm font-semibold transition-colors cursor-pointer border-0 outline-none"
          >
            {isEs ? 'Copiar diagnóstico' : 'Copy diagnostics'}
          </button>
        </div>
        {error?.message && (
          <p className="mt-4 text-[11px] font-mono text-zinc-400 break-words">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * ErrorBoundary a nivel de módulo (QW3): un fallo de render en una sección NO
 * tumba el árbol completo; cada ruta protegida se envuelve con esto.
 */
export class ModuleErrorBoundary extends React.Component<
  ModuleErrorBoundaryProps,
  ModuleErrorBoundaryState
> {
  constructor(props: ModuleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ModuleErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ModuleErrorBoundary] render crash:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <RouteAwareFallback error={this.state.error} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

export default ModuleErrorBoundary;
