import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../utils/i18n';
import { oauthAuthorize, quickLogin } from '../../../services/api';
import { queryClient } from '../../../services/queryClient';
import { useMeQuery } from '../../../services/queries/useCraftworldQueries';
import { parseOAuthError, isUserAuthenticated } from '../services/authService';

export function useSignIn() {
  const nav = useNavigate();
  const { t, language } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: me } = useMeQuery();

  useEffect(() => {
    if (isUserAuthenticated(me)) {
      nav('/home', { replace: true });
    }
  }, [me, nav]);

  useEffect(() => {
    const errorParsed = parseOAuthError(window.location.search, t('signin.error.denied'));
    if (errorParsed) {
      setErrorMessage(errorParsed);
    }
  }, [t]);

  const handleConnectOAuth = useCallback(() => {
    oauthAuthorize();
  }, []);

  const handleQuickLogin = useCallback(async (uid?: string, displayName?: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await quickLogin(uid || 'craft_player', displayName || 'Player');
      await queryClient.invalidateQueries();
      nav('/home', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar sesión rápida';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [nav]);

  return {
    t,
    language,
    errorMessage,
    isLoading,
    handleConnectOAuth,
    handleQuickLogin,
  };
}
