import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout, getCraftworldHome, getMe } from '../../services/api';
import { useTranslation } from '../../utils/i18n';
import { useDragScroll } from '../../hooks/useDragScroll';

interface NavItem {
  path: string;
  labelEn: string;
  labelEs: string;
  icon: (active: boolean) => React.ReactNode;
}

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { ref: navRef, dragEvents } = useDragScroll<HTMLDivElement>();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<{
    displayName: string;
    level?: number;
    avatarUrl?: string;
    uid?: string;
  } | null>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  const [isDarkMode] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCraftworldHome()
      .then((home) => {
        if (!mounted) return;
        if (home?.onchain?.wallets) {
          setWallets(home.onchain.wallets);
        }
        if (home?.profile) {
          setUser({
            displayName: home.profile.displayName || 'Player',
            level: home.profile.level,
            avatarUrl: home.profile.avatarUrl,
            uid: home.profile.uid,
          });
        } else {
          getMe()
            .then((me) => {
              if (!mounted || !me) return;
              setUser({
                displayName: me.craftWorldDisplayName || me.id || 'Player',
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
          .then((me) => {
            if (!mounted || !me) return;
            setUser({
              displayName: me.craftWorldDisplayName || me.id || 'Player',
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isTabActive = (path: string) => location.pathname === path;

  // Auto scroll active link into view
  useEffect(() => {
    if (!navRef.current) return;
    const timeout = setTimeout(() => {
      if (!navRef.current) return;
      const activeEl = navRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [location.pathname, navRef]);

  const handleSignOut = () => {
    logout();
    navigate('/signin');
  };

  const navItems: NavItem[] = [
    {
      path: '/home',
      labelEn: 'Home',
      labelEs: 'Inicio',
      icon: (active) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2.4 : 1.8}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      path: '/empire-dashboard',
      labelEn: 'Empire',
      labelEs: 'Imperio',
      icon: (active) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2.4 : 1.8}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      path: '/resource-planner',
      labelEn: 'Planner',
      labelEs: 'Plan',
      icon: (active) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2.4 : 1.8}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      path: '/profitability',
      labelEn: 'Profit',
      labelEs: 'Ganancia',
      icon: (active) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2.4 : 1.8}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
    {
      path: '/value-chain-map',
      labelEn: 'Chain',
      labelEs: 'Cadena',
      icon: (active) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2.4 : 1.8}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      ),
    },
    {
      path: '/calculator',
      labelEn: 'Calculate',
      labelEs: 'Calcular',
      icon: (active) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2.4 : 1.8}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      path: '/inventory-value',
      labelEn: 'Inventory',
      labelEs: 'Inventario',
      icon: (active) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2.4 : 1.8}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      path: '/upgrade-advisor',
      labelEn: 'Upgrades',
      labelEs: 'Mejoras',
      icon: (active) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2.4 : 1.8}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      path: '/compare',
      labelEn: 'Compare',
      labelEs: 'Comparar',
      icon: (active) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2.4 : 1.8}
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
          />
        </svg>
      ),
    },
    {
      path: '/timers',
      labelEn: 'Timers',
      labelEs: 'Tiempos',
      icon: (active) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2.4 : 1.8}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      path: '/matrix',
      labelEn: 'Matrix',
      labelEs: 'Matriz',
      icon: (active) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2.4 : 1.8}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      path: '/prices',
      labelEn: 'Prices',
      labelEs: 'Precios',
      icon: (active) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2.4 : 1.8}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },
    {
      path: '/settings',
      labelEn: 'Settings',
      labelEs: 'Ajustes',
      icon: (active) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2.4 : 1.8}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2.4 : 1.8}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#141415] border-none px-4 md:px-8 py-3 mb-6 transition-all">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* LEFT: Game Brand Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link to="/home" className="flex items-center gap-2 group">
            <img
              src="/assets/logo.png"
              className="h-10 md:h-11 w-auto object-contain transition-transform group-hover:scale-105"
              alt="Craft World Logo"
            />
          </Link>
        </div>

        {/* CENTER: Circular Navigation Buttons with Labels */}
        <div
          ref={navRef}
          {...dragEvents}
          className="flex items-center gap-4 sm:gap-5 overflow-x-auto no-scrollbar py-1 px-2 max-w-[850px] cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {navItems.map((item) => {
            const active = isTabActive(item.path);
            const label = language === 'es' ? item.labelEs : item.labelEn;

            return (
              <Link
                key={item.path}
                to={item.path}
                data-active={active}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer focus:outline-none"
              >
                {/* Circular Button */}
                <div
                  className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    active
                      ? 'bg-white text-[#141415] shadow-lg shadow-white/20 scale-105'
                      : 'bg-[#202024] text-slate-300 group-hover:bg-[#29292f] group-hover:text-white group-hover:scale-105'
                  }`}
                >
                  {item.icon(active)}
                </div>

                {/* Subtitle / Text Label underneath */}
                <span
                  className={`text-[11px] font-main transition-colors duration-200 tracking-wide ${
                    active
                      ? 'text-white font-bold'
                      : 'text-slate-400 font-medium group-hover:text-slate-200'
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* RIGHT: Player Profile Avatar Button */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="w-10 h-10 rounded-full overflow-hidden bg-[#202024] hover:ring-2 hover:ring-white/20 transition-all duration-150 cursor-pointer flex items-center justify-center flex-shrink-0 focus:outline-none"
            title={user?.displayName || 'Player'}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user?.displayName || 'Player'}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/assets/resources/Coin.png"
                alt="Craft World Token"
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
          </button>

          {/* User Options Dropdown Menu */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-[#161618] rounded-[28px] p-3 shadow-2xl space-y-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* Top Row: User Card + Settings Button + Sign Out Button */}
              <div className="flex items-center gap-2">
                {/* User capsule */}
                <Link
                  to="/home"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex-1 min-w-0 flex items-center justify-between bg-[#222226] hover:bg-[#28282e] p-2 pr-3 rounded-[20px] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-black/60 flex items-center justify-center flex-shrink-0">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src="/assets/resources/Coin.png"
                          alt="Avatar"
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white truncate max-w-[90px]">
                          {user?.displayName || 'Player'}
                        </span>
                        {/* Blue verified checkmark */}
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                          ✓
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {user?.level !== undefined ? `Lv. ${user.level} • @craftworld` : '@craftworld'}
                      </p>
                    </div>
                  </div>

                  {/* Green active tick badge */}
                  <div className="w-5 h-5 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] flex-shrink-0 text-xs font-bold ml-1">
                    ✓
                  </div>
                </Link>

                {/* Settings / Gear Button */}
                <Link
                  to="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-11 h-11 rounded-[18px] bg-[#222226] hover:bg-[#28282e] flex items-center justify-center text-zinc-300 hover:text-white transition-colors flex-shrink-0"
                  title={language === 'es' ? 'Configuración' : 'Settings'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>

                {/* Sign Out / Exit Door Button */}
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    handleSignOut();
                  }}
                  className="w-11 h-11 rounded-[18px] bg-[#222226] hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer p-0"
                  title={language === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
                >
                  <svg className="w-5 h-5 min-w-[20px] min-h-[20px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>

              {/* Linked Wallets / Cuentas Vinculadas Section */}
              <div className="bg-[#222226] rounded-[22px] p-3 space-y-2.5">
                {/* Header row with Lime Chevron */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold text-zinc-300">
                    {language === 'es' ? 'Wallets vinculadas' : 'Linked wallets'}
                  </span>
                  <svg className="w-3.5 h-3.5 text-[#a3e635]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                  </svg>
                </div>

                {/* Wallets list */}
                <div className="space-y-1.5">
                  {wallets && wallets.length > 0 ? (
                    wallets.map((w, index) => {
                      const isSmart = (w.type || '').toLowerCase().includes('smart');
                      const initial = isSmart ? 'S' : (w.address ? w.address.slice(2, 3).toUpperCase() : 'W');
                      const bgGradient = index === 0 ? 'bg-purple-600/30 text-purple-300' : 'bg-emerald-600/30 text-emerald-300';
                      const label = w.primary ? (language === 'es' ? 'Wallet Principal' : 'Primary Wallet') : (w.type || `Wallet ${index + 1}`);
                      const formattedAddress = w.address ? `${w.address.slice(0, 6)}...${w.address.slice(-4)}` : '';
                      const isCopied = copiedWallet === w.address;

                      return (
                        <div
                          key={w.address || index}
                          onClick={() => {
                            if (w.address) {
                              navigator.clipboard.writeText(w.address);
                              setCopiedWallet(w.address);
                              setTimeout(() => setCopiedWallet(null), 1500);
                            }
                          }}
                          className="flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                          title={language === 'es' ? 'Click para copiar dirección' : 'Click to copy address'}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 font-bold text-xs ${bgGradient}`}>
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{label}</p>
                              <p className="text-[10px] text-zinc-400 font-mono truncate">{formattedAddress}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-400 group-hover:text-emerald-400 font-mono shrink-0 pl-1">
                            {isCopied ? '✓' : ''}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-500/30 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                            S
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">Smart Account</p>
                            <p className="text-[10px] text-zinc-400 font-mono truncate">0x71C...a89f</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-500/30 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                            E
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">EOA Wallet</p>
                            <p className="text-[10px] text-zinc-400 font-mono truncate">0x93B...e421</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions: Dark Mode + Add Account */}
              <div className="bg-[#222226] rounded-[22px] p-2 space-y-1">
                {/* Dark Mode Row */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl select-none">
                  <div className="flex items-center gap-2.5">
                    {/* Moon / Eclipse Icon */}
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-zinc-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-zinc-200">Dark Mode</span>
                  </div>

                  {/* Lime Active Toggle - Blocked / Always On */}
                  <div
                    title={language === 'es' ? 'Modo Oscuro siempre activo' : 'Dark Mode permanently active'}
                    className="w-10 h-6 rounded-full p-1 bg-[#a3e635] flex items-center justify-end cursor-not-allowed opacity-90"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#161618] shadow-sm" />
                  </div>
                </div>

                {/* Add account Row */}
                <Link
                  to="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-zinc-300 group-hover:text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-zinc-200 group-hover:text-white">
                    {language === 'es' ? 'Añadir cuenta' : 'Add account'}
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
