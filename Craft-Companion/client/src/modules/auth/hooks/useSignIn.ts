import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../utils/i18n';
import { oauthAuthorize, getMe } from '../../../services/api';
import { parseOAuthError, isUserAuthenticated } from '../services/authService';

export function useSignIn() {
  const nav = useNavigate();
  const { t, language } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    getMe()
      .then((me: any) => {
        if (isUserAuthenticated(me)) {
          nav('/home', { replace: true });
        }
      })
      .catch(() => {});
  }, [nav]);

  useEffect(() => {
    const errorParsed = parseOAuthError(window.location.search, t('signin.error.denied'));
    if (errorParsed) {
      setErrorMessage(errorParsed);
    }
  }, [t]);

  const handleConnectOAuth = useCallback(() => {
    oauthAuthorize();
  }, []);

  return {
    t,
    language,
    errorMessage,
    handleConnectOAuth,
  };
}
