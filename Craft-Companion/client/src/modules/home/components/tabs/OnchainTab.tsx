import React from 'react';
import type { OnchainData } from '../../types';
import Card from '../../../../components/Card';
import { useTranslation } from '../../../../utils/i18n';
import { formatNumber } from '../../../../utils/formatters';
import { ResourceIcon } from '../../../../components/GameIcon';
import { EmptyState } from '../EmptyState';
import { ScopeUnauthorizedCard } from '../ScopeUnauthorizedCard';
import {
  WalletMoneyBoldDuotone,
  GlobalBoldDuotone,
  CopyBold,
  CheckCircleBoldDuotone,
} from 'solar-icon-set';

export interface OnchainTabProps {
  onchain?: OnchainData;
  copiedAddress: string | null;
  onCopyAddress: (address: string) => void;
  onReauthorize: () => void;
}

export const OnchainTab: React.FC<OnchainTabProps> = ({
  onchain,
  copiedAddress,
  onCopyAddress,
  onReauthorize,
}) => {
  const { language } = useTranslation();

  if (!onchain) {
    return <ScopeUnauthorizedCard scope="onchain:read" onReauthorize={onReauthorize} />;
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="grid gap-4 md:grid-cols-2 items-start">
        {/* Card 1: Wallets Vinculadas */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <WalletMoneyBoldDuotone className="w-5 h-5 text-amber-400" />
              <span>{language === 'es' ? 'Wallets Vinculadas' : 'Linked Wallets'}</span>
            </span>
          }
          className="rounded-[32px] bg-[#18181b]"
        >
          {onchain.wallets?.length ? (
            <div className="space-y-2.5">
              {onchain.wallets.map((w, i) => (
                <div
                  key={w.address || i}
                  className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-4 flex items-center justify-between transition-all select-none shadow-md text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-200 truncate">
                        {w.address.slice(0, 6)}...{w.address.slice(-4)}
                      </span>
                      {w.primary && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border-none shrink-0">
                          PRINCIPAL
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                      {w.type} {w.provider ? `(${w.provider})` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCopyAddress(w.address)}
                    title={language === 'es' ? 'Copiar dirección' : 'Copy address'}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                  >
                    {copiedAddress === w.address ? (
                      <CheckCircleBoldDuotone className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <CopyBold className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>
              {language === 'es' ? 'No hay wallets vinculadas' : 'No linked wallets'}
            </EmptyState>
          )}
        </Card>

        {/* Card 2: Recursos On-Chain */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <GlobalBoldDuotone className="w-5 h-5 text-cyan-400" />
              <span>{language === 'es' ? 'Recursos On-Chain' : 'On-Chain Resources'}</span>
            </span>
          }
          action={
            onchain.resourcesOnChain?.length ? (
              <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2.5 py-0.5 rounded-full">
                {onchain.resourcesOnChain.length} {language === 'es' ? 'tipos' : 'types'}
              </span>
            ) : undefined
          }
          className="rounded-[32px] bg-[#18181b]"
        >
          {onchain.resourcesOnChain?.length ? (
            <div className="max-h-[250px] sm:max-h-[270px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {onchain.resourcesOnChain.map((r, i) => {
                  const hasStock = Number(r.amount) > 0;
                  return (
                    <div
                      key={r.symbol || i}
                      className="group bg-[#202024] hover:bg-[#28282e] rounded-full p-2 sm:p-2.5 pr-3 sm:pr-3.5 flex items-center justify-between transition-all duration-200 select-none shadow-md hover:scale-[1.015]"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#151518] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                          <ResourceIcon symbol={r.symbol} size={22} />
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate">
                            {r.symbol}
                          </h4>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-tight mt-0.5 truncate">
                            {hasStock
                              ? language === 'es'
                                ? `${formatNumber(Number(r.amount))} en wallet`
                                : `${formatNumber(Number(r.amount))} in wallet`
                              : language === 'es'
                                ? 'Sin saldo (0)'
                                : 'No balance (0)'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                          <svg
                            className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7 17L17 7M17 7H9M17 7V15"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState>
              {language === 'es' ? 'No hay recursos on-chain' : 'No on-chain resources'}
            </EmptyState>
          )}
        </Card>
      </div>
    </div>
  );
};
