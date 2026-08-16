import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getMe } from '../services/api';

function isCookieLogged() {
  return document.cookie.split(';').some((c) => {
    const [key, value] = c.trim().split('=');
    return key === 'cc_logged_in' && value === 'true';
  });
}

export default function ProtectedRoute({ children }: { children: any }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      localStorage.setItem('cc_token', urlToken);
      urlParams.delete('token');
      const newQuery = urlParams.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }

    getMe()
      .then((me) => {
        if (mounted) {
          setAuthenticated(Boolean(me && me.id));
        }
      })
      .catch(() => {
        if (mounted) {
          setAuthenticated(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Verificando sesión...</span>
        </div>
      </div>
    );
  }

  return authenticated ? children : <Navigate to="/signin" replace />;
}
