import { useEffect, useState, useCallback, useRef } from 'react';
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
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  const [accountInput, setAccountInput] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const handleConnectOAuth = useCallback(() => {
    showToast(
      language === 'es'
        ? 'Redirigiendo a Craft World OAuth...'
        : 'Redirecting to Craft World OAuth...'
    );
    oauthAuthorize();
  }, [language, showToast]);

  const handleQuickLogin = useCallback(async (uid?: string, displayName?: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await quickLogin(uid || 'craft_player', displayName || 'Player');
      await queryClient.invalidateQueries();
      nav('/home', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar sesión';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [nav]);

  const handleGuestLogin = useCallback(async () => {
    showToast(
      language === 'es'
        ? 'Iniciando en Modo Invitado...'
        : 'Connecting in Guest Mode...'
    );
    await handleQuickLogin('craft_guest', 'Guest Player');
  }, [handleQuickLogin, language, showToast]);

  const handleFormSubmit = useCallback(async () => {
    const val = accountInput.trim();
    if (!val) {
      inputRef.current?.focus();
      showToast(
        language === 'es'
          ? 'Por favor, ingresa tu UID o usuario'
          : 'Please enter your UID or username'
      );
      return;
    }

    showToast(
      language === 'es'
        ? `Accediendo con cuenta: ${val}...`
        : `Connecting with account: ${val}...`
    );
    await handleQuickLogin(val, val);
  }, [accountInput, handleQuickLogin, language, showToast]);

  const handleMainButtonClick = useCallback(() => {
    if (!isAccordionOpen) {
      setIsAccordionOpen(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
    } else {
      handleFormSubmit();
    }
  }, [isAccordionOpen, handleFormSubmit]);

  return {
    t,
    language,
    errorMessage,
    isLoading,
    isAccordionOpen,
    accountInput,
    setAccountInput,
    toastMessage,
    inputRef,
    handleConnectOAuth,
    handleGuestLogin,
    handleFormSubmit,
    handleMainButtonClick,
  };
}
