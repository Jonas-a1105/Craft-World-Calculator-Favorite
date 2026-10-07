import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout, getCraftworldHome, getMe, oauthAuthorize } from '../../../../services/api';
import { useTranslation } from '../../../../utils/i18n';
import type { UserProfile, WalletItem } from '../types';
import { resolveUserDisplayName } from '../services/navbarService';

export function useNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('craftworld.theme') !== 'light';
  });

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
    let mounted = true;
    getCraftworldHome()
      .then((home: any) => {
        if (!mounted) return;
        if (home?.onchain?.wallets) {
          setWallets(home.onchain.wallets);
        }
        if (home?.profile) {
          setUser({
            displayName: resolveUserDisplayName(home.profile.displayName),
            level: home.profile.level,
            avatarUrl: home.profile.avatarUrl,
            uid: home.profile.uid,
          });
        } else {
          getMe()
            .then((me: any) => {
              if (!mounted || !me) return;
              setUser({
                displayName: resolveUserDisplayName(me.craftWorldDisplayName, me.id),
                level: me.craftWorldLevel,
                avatarUrl: me.craftWorldAvatarUrl,
                uid: me.craftWorldUid,
              });
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        getMe()
          .then((me: any) => {
            if (!mounted || !me) return;
            setUser({
              displayName: resolveUserDisplayName(me.craftWorldDisplayName, me.id),
              level: me.craftWorldLevel,
              avatarUrl: me.craftWorldAvatarUrl,
              uid: me.craftWorldUid,
            });
          })
          .catch(() => {});
      });

    return () => {
      mounted = false;
    };
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
