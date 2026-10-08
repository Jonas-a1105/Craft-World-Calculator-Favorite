import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getMe } from '../services/api';

function isCookieLogged() {
  return document.cookie.split(';').some((c) => {
    const [key, value] = c.trim().split('=');
    return key === 'cc_logged_in' && value === 'true';
  });
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Pre-seed authentication status from cookie/token to eliminate jarring flashes on reload or redirect
  const [authenticated, setAuthenticated] = useState<boolean | null>(() => {
    if (isCookieLogged() || Boolean(localStorage.getItem('cc_token'))) {
      return true;
    }
    return null;
  });

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

  // Seamless fallback without blue flash or spinners
  if (authenticated === null) {
    return <div className="min-h-screen bg-[var(--canvas-bg,#141415)]" />;
  }

  return authenticated ? children : <Navigate to="/signin" replace />;
}
