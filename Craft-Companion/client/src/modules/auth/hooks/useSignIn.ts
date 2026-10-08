import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../utils/i18n';
import { oauthAuthorize, quickLogin } from '../../../services/api';
import { queryClient } from '../../../services/queryClient';
import { useMeQuery } from '../../../services/queries/useCraftworldQueries';
import { parseOAuthError, isUserAuthenticated } from '../services/authService';
import { notifyError, notifyInfo, notifyWarning } from '../../../utils/sileoNotifications';
import { playSplashAudio, stopSplashAudio } from '../../splash';

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
      notifyError('Error de Autenticación', errorParsed);
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
    notifyInfo(
      language === 'es' ? 'Conexión OAuth' : 'OAuth Connection',
      language === 'es'
        ? 'Redirigiendo a Craft World OAuth...'
        : 'Redirecting to Craft World OAuth...'
    );
    showToast(
      language === 'es'
        ? 'Redirigiendo a Craft World OAuth...'
        : 'Redirecting to Craft World OAuth...'
    );
    oauthAuthorize();
  }, [language, showToast]);

  const handleQuickLogin = useCallback((uid?: string, displayName?: string) => {
    // 1. Play audio synchronously within user click gesture context
    playSplashAudio();
    setIsLoading(true);
    setErrorMessage('');

    // 2. Navigate immediately to splash so user gets instant audio & animation feedback
    nav('/splash?to=/home', { replace: true });

    // 3. Complete authentication in background during splash animation
    quickLogin(uid || 'craft_player', displayName || 'Player')
      .then(async () => {
        await queryClient.invalidateQueries();
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al conectar sesión';
        setErrorMessage(msg);
        notifyError(err);
        stopSplashAudio();
        nav('/signin', { replace: true });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [nav]);


  const handleGuestLogin = useCallback(() => {
    handleQuickLogin('craft_guest', 'Guest Player');
  }, [handleQuickLogin]);

  const handleFormSubmit = useCallback(() => {
    const val = accountInput.trim();
    if (!val) {
      inputRef.current?.focus();
      notifyWarning(
        language === 'es' ? 'Campo Requerido' : 'Required Field',
        language === 'es'
          ? 'Por favor, ingresa tu UID o nombre de usuario'
          : 'Please enter your UID or username'
      );
      showToast(
        language === 'es'
          ? 'Por favor, ingresa tu UID o usuario'
          : 'Please enter your UID or username'
      );
      return;
    }

    handleQuickLogin(val, val);
  }, [accountInput, handleQuickLogin, language]);

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
