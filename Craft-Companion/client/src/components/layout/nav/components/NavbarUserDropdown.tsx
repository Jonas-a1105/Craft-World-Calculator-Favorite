import type { RefObject } from 'react';
import { Link } from 'react-router-dom';
import type { UserProfile, WalletItem } from '../types';
import {
  formatWalletAddress,
  getWalletInitial,
  getWalletLabel,
} from '../services/navbarService';

interface NavbarUserDropdownProps {
  language: string;
  user: UserProfile | null;
  wallets: WalletItem[];
  userDropdownOpen: boolean;
  setUserDropdownOpen: (open: boolean) => void;
  dropdownRef: RefObject<HTMLDivElement>;
  copiedWallet: string | null;
  handleCopyWallet: (address?: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  handleSignOut: () => void;
  handleRelink: () => void;
  closeDropdown: () => void;
}

export const NavbarUserDropdown = ({
  language,
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
}: NavbarUserDropdownProps) => {
  return (
    <div className="flex items-center gap-2.5 flex-shrink-0">
      {/* Relink Button */}
      <button
        type="button"
        onClick={handleRelink}
        title={language === 'es' ? 'Revincular Cuenta' : 'Re-link Account'}
        className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 dark:bg-black/60 dark:hover:bg-black/80 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white flex items-center justify-center transition-all border border-black/5 dark:border-white/10 cursor-pointer shadow-md"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* User Avatar Button & Dropdown Container */}
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
                onClick={closeDropdown}
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
                      {user?.level !== undefined
                        ? `Lv. ${user.level} • @craftworld`
                        : '@craftworld'}
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
                onClick={closeDropdown}
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>

              {/* Sign Out / Exit Door Button */}
              <button
                type="button"
                onClick={handleSignOut}
                className="w-11 h-11 rounded-[18px] bg-[#222226] hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer p-0"
                title={language === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
              >
                <svg
                  className="w-5 h-5 min-w-[20px] min-h-[20px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>

            {/* Linked Wallets / Cuentas Vinculadas Section */}
            <div className="bg-[#222226] rounded-[22px] p-3 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold text-zinc-300">
                  {language === 'es' ? 'Wallets vinculadas' : 'Linked wallets'}
                </span>
                <svg
                  className="w-3.5 h-3.5 text-[#a3e635]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </div>

              {/* Wallets list */}
              <div className="space-y-1.5">
                {wallets && wallets.length > 0 ? (
                  wallets.map((w: WalletItem, index: number) => {
                    const initial = getWalletInitial(w.type, w.address);
                    const bgGradient =
                      index === 0
                        ? 'bg-purple-600/30 text-purple-300'
                        : 'bg-emerald-600/30 text-emerald-300';
                    const label = getWalletLabel(w, index, language);
                    const formattedAddress = formatWalletAddress(w.address);
                    const isCopied = copiedWallet === w.address;

                    return (
                      <div
                        key={w.address || index}
                        onClick={() => handleCopyWallet(w.address)}
                        className="flex items-center justify-between p-1.5 px-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                        title={
                          language === 'es'
                            ? 'Click para copiar dirección'
                            : 'Click to copy address'
                        }
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 font-bold text-xs ${bgGradient}`}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{label}</p>
                            <p className="text-[10px] text-zinc-400 font-mono truncate">
                              {formattedAddress}
                            </p>
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
                  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-zinc-300">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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

                {/* Interactive Lime Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  title={
                    isDarkMode
                      ? language === 'es'
                        ? 'Cambiar a Modo Claro'
                        : 'Switch to Light Mode'
                      : language === 'es'
                        ? 'Cambiar a Modo Oscuro'
                        : 'Switch to Dark Mode'
                  }
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer flex items-center ${
                    isDarkMode ? 'bg-[#a3e635] justify-end' : 'bg-zinc-600 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-[#161618] shadow-md transform transition-transform" />
                </button>
              </div>

              {/* Add account Row */}
              <Link
                to="/settings"
                onClick={closeDropdown}
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
  );
};
