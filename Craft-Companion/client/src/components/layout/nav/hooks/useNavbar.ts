import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout, oauthAuthorize } from '../../../../services/api';
import { useTranslation } from '../../../../utils/i18n';
import { useCraftworldHomeQuery, useMeQuery } from '../../../../services/queries/useCraftworldQueries';
import type { UserProfile, WalletItem } from '../types';
import { resolveUserDisplayName } from '../services/navbarService';

export function useNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('craftworld.theme') !== 'light';
  });

  const { data: home } = useCraftworldHomeQuery();
  const { data: me } = useMeQuery();

  const wallets = useMemo<WalletItem[]>(() => {
    return home?.onchain?.wallets || [];
  }, [home]);

  const user = useMemo<UserProfile | null>(() => {
    if (home?.profile) {
      return {
        displayName: resolveUserDisplayName(home.profile.displayName),
        level: home.profile.level,
        avatarUrl: home.profile.avatarUrl,
        uid: home.profile.uid,
      };
    }
    if (me) {
      return {
        displayName: resolveUserDisplayName(me.craftWorldDisplayName, me.id),
        level: me.craftWorldLevel,
        avatarUrl: me.craftWorldAvatarUrl,
        uid: me.craftWorldUid,
      };
    }
    return null;
  }, [home, me]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev: boolean) => {
      const nextDark = !prev;
      if (nextDark) {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('craftworld.theme', 'dark');
        const isSolid = localStorage.getItem('craftworld.solidBackground') === 'true';
        if (isSolid) {
          document.body.classList.add('solid-bg');
        }
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('craftworld.theme', 'light');
      }
      return nextDark;
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyWallet = useCallback((address?: string) => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopiedWallet(address);
    setTimeout(() => setCopiedWallet(null), 1500);
  }, []);

  const handleSignOut = useCallback(() => {
    setUserDropdownOpen(false);
    logout();
    navigate('/signin');
  }, [navigate]);

  const handleRelink = useCallback(() => {
    oauthAuthorize();
  }, []);

  const closeDropdown = useCallback(() => {
    setUserDropdownOpen(false);
  }, []);

  return {
    language,
    currentPath: location.pathname,
    user,
    wallets,
    userDropdownOpen,
    setUserDropdownOpen,
    dropdownRef,
    copiedWallet,
    handleCopyWallet,
    isDarkMode,
    toggleTheme,
    handleSignOut,
    handleRelink,
    closeDropdown,
  };
}
