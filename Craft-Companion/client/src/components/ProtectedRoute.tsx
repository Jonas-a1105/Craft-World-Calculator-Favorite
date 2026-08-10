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
  const [authenticated, setAuthenticated] = useState<boolean | null>(() => (isCookieLogged() ? true : null));

  useEffect(() => {
    if (authenticated === true) return;
    getMe()
      .then((me) => {
        if (me && me.id) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      })
      .catch(() => setAuthenticated(false));
  }, [authenticated]);

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
