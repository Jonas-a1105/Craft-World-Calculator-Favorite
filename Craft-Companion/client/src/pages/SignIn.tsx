import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { useTranslation } from '../utils/i18n';
import {
  craftWorldWalletLogin,
  getCraftworldAuthPayload,
  login,
} from '../services/api';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<any>;
    };
    ronin?: {
      provider?: {
        request: (args: { method: string; params?: unknown[] }) => Promise<any>;
      };
    };
  }
}

type WalletProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<any>;
  disconnect?: () => Promise<void>;
};

const RONIN_CHAIN_ID = 2020;
const RONIN_RPC_URL = 'https://api.roninchain.com/rpc';

function getInjectedWalletProvider() {
  return window.ronin?.provider || window.ethereum;
}

async function getWalletConnectProvider() {
  const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
  if (!projectId) {
    throw new Error('WalletConnect is not configured. Add VITE_WALLETCONNECT_PROJECT_ID to your environment.');
  }

  const provider = await EthereumProvider.init({
    projectId,
    chains: [RONIN_CHAIN_ID],
    optionalChains: [RONIN_CHAIN_ID],
    rpcMap: {
      [RONIN_CHAIN_ID]: RONIN_RPC_URL,
    },
    showQrModal: true,
    metadata: {
      name: 'Craft World Companion',
      description: 'Craft World account dashboard',
      url: window.location.origin,
      icons: [`${window.location.origin}/favicon.ico`],
    },
  });

  await provider.connect();
  return provider as WalletProvider;
}

export default function SignIn() {
  const nav = useNavigate();
  const { t, language } = useTranslation();
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [e, setE] = useState('');
  const [walletStatus, setWalletStatus] = useState('');

  const completeCraftWorldWalletLogin = async (provider: WalletProvider, label: string) => {
    setE('');
    setWalletStatus(t('signin.status.connecting', { label }));

    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    const address = accounts?.[0];

    if (!address) {
      throw new Error('No wallet address was returned.');
    }

    setWalletStatus(t('signin.status.payload'));

    const craftWorldPayload = await getCraftworldAuthPayload({ address });

    setWalletStatus(t('signin.status.sign'));

    const craftWorldSignature = await provider.request({
      method: 'personal_sign',
      params: [craftWorldPayload.payload.nonce, address],
    });

    setWalletStatus(t('signin.status.auth'));

    await craftWorldWalletLogin({
      payload: craftWorldPayload.payload,
      signature: craftWorldSignature,
    });

    nav('/home');
  };

  const signInWithRoninWallet = async () => {
    setE('');
    setWalletStatus('');

    const provider = getInjectedWalletProvider();

    if (!provider) {
      setE(t('signin.noWallet'));
      return;
    }

    try {
      await completeCraftWorldWalletLogin(provider, 'Ronin Wallet');
    } catch (err: any) {
      setWalletStatus('');
      setE(err.message || 'Ronin Wallet sign in failed.');
    }
  };

  const signInWithWalletConnect = async () => {
    setE('');
    setWalletStatus('');

    try {
      const provider = await getWalletConnectProvider();
      await completeCraftWorldWalletLogin(provider, 'WalletConnect');
    } catch (err: any) {
      setWalletStatus('');
      setE(err.message || 'WalletConnect sign in failed.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative z-10 py-12">
      <div className="bg-slate-900/65 backdrop-blur-lg border border-slate-800/80 rounded-[24px] shadow-2xl p-6 md:p-8 max-w-md w-full space-y-6 transform hover:scale-[1.005] transition-transform duration-300">
        
        {/* Back Link & Header */}
        <div className="space-y-2">
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
            ← {language === 'es' ? 'Volver al Inicio' : 'Back to Home'}
          </Link>
          <h1 className="text-2xl font-black text-white mt-2">
            {t('signin.title')}
          </h1>
          <p className="text-xs text-slate-400">
            {language === 'es' 
              ? 'Conéctate mediante tu billetera Ronin o ingresa tus credenciales.'
              : 'Connect using your Ronin wallet or enter your credentials.'}
          </p>
        </div>

        {/* Web3 Connections */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={signInWithRoninWallet}
            className="w-full py-3 px-4 rounded-[12px] bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            {t('signin.connectRonin')}
          </button>

          <button
            type="button"
            onClick={signInWithWalletConnect}
            className="w-full py-3 px-4 rounded-[12px] bg-slate-800 hover:bg-slate-750 border border-slate-700 font-bold text-slate-200 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {t('signin.connectWC')}
          </button>
        </div>

        {walletStatus && (
          <div className="text-xs text-center bg-blue-950/40 border border-blue-900/60 rounded-[8px] p-2 text-blue-300 animate-pulse">
            {walletStatus}
          </div>
        )}

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800/80"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
            {language === 'es' ? 'o usar contraseña' : 'or use password'}
          </span>
          <div className="flex-grow border-t border-slate-800/80"></div>
        </div>

        {/* Password Form */}
        <form
          onSubmit={async (ev) => {
            ev.preventDefault();
            try {
              await login({ username, password });
              nav('/home');
            } catch (err: any) {
              setE(err.message);
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-bold block ml-1">
              {language === 'es' ? 'Usuario' : 'Username'}
            </label>
            <input
              className="w-full rounded-[12px] border border-slate-800 bg-slate-950/80 p-3 text-sm text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500/80 transition-colors"
              placeholder={t('signin.username')}
              value={username}
              onChange={(e) => setU(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-bold block ml-1">
              {language === 'es' ? 'Contraseña' : 'Password'}
            </label>
            <input
              type="password"
              className="w-full rounded-[12px] border border-slate-800 bg-slate-950/80 p-3 text-sm text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500/80 transition-colors"
              placeholder={t('signin.password')}
              value={password}
              onChange={(e) => setP(e.target.value)}
              required
            />
          </div>

          <button className="w-full py-3 px-4 rounded-[12px] bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-slate-600 font-bold text-white active:scale-[0.99] transition-all duration-150 cursor-pointer text-sm">
            {t('signin.submit')}
          </button>
        </form>

        {e && (
          <div className="text-xs text-center bg-red-950/40 border border-red-900/60 rounded-[8px] p-2 text-red-400">
            ⚠️ {e}
          </div>
        )}

        {/* Footer Link */}
        <p className="text-xs text-center text-slate-400">
          {language === 'es' ? '¿No tienes una cuenta?' : "Don't have an account?"}{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-350 font-bold underline transition-colors">
            {language === 'es' ? 'Regístrate aquí' : 'Register here'}
          </Link>
        </p>
      </div>
    </div>
  );
}
