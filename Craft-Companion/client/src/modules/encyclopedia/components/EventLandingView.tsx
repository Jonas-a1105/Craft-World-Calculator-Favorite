import React, { useState } from 'react';
import { OfficialEvent, CatalogItem } from '../types';
import { OFFICIAL_EVENTS } from '../data/eventsCatalog';
import { useTranslation } from '../../../utils/i18n';
import { ResourceIcon } from '../../../components/GameIcon';

interface Props {
  event: OfficialEvent;
  onSelectEvent: (item: CatalogItem) => void;
}

type TabKey = 'overview' | 'ranks' | 'prizepool' | 'karma' | 'mechanics' | 'onboarding' | 'faq';
type MpRankKey = 'mp1' | 'mp2' | 'mp3';

interface RankRow {
  rank: string;
  rankEs: string;
  coinReward?: string;
  fishReward?: string;
  tickets?: string;
  nft?: string;
  note?: string;
  noteEs?: string;
}

const MP1_RANKS: RankRow[] = [
  { rank: 'Rank 1', rankEs: 'Puesto 1', coinReward: 'Top $COIN Share', fishReward: 'Top $FISH Share', nft: '1x Water Dyno Genesis NFT', tickets: '100 FP Tickets' },
  { rank: 'Rank 2', rankEs: 'Puesto 2', coinReward: 'Top $COIN Share', fishReward: 'Top $FISH Share', nft: '1x Founders Pass NFT', tickets: '80 FP Tickets' },
  { rank: 'Rank 3', rankEs: 'Puesto 3', coinReward: '50,000 $COIN', fishReward: '18,275 $FISH', tickets: '50 FP Raffle Tickets' },
  { rank: 'Rank 4', rankEs: 'Puesto 4', coinReward: '40,000 $COIN', fishReward: '14,620 $FISH', tickets: '40 FP Raffle Tickets' },
  { rank: 'Rank 5', rankEs: 'Puesto 5', coinReward: '35,000 $COIN', fishReward: '12,793 $FISH', tickets: '35 FP Raffle Tickets' },
  { rank: 'Rank 6 - 10', rankEs: 'Puestos 6 - 10', coinReward: '25,000 $COIN c/u', fishReward: '9,138 $FISH c/u', tickets: '25 FP Tickets c/u' },
  { rank: 'Rank 11 - 25', rankEs: 'Puestos 11 - 25', coinReward: '15,000 $COIN c/u', fishReward: '5,483 $FISH c/u', tickets: '15 FP Tickets c/u' },
  { rank: 'Rank 26 - 50', rankEs: 'Puestos 26 - 50', coinReward: '10,000 $COIN c/u', fishReward: '3,655 $FISH c/u', tickets: '10 FP Tickets c/u' },
  { rank: 'Rank 51 - 100', rankEs: 'Puestos 51 - 100', coinReward: '5,000 $COIN c/u', fishReward: '1,828 $FISH c/u', tickets: '5 FP Tickets c/u' },
  { rank: 'Rank 101 - 150', rankEs: 'Puestos 101 - 150', coinReward: '-', fishReward: '-', tickets: '5 FP Tickets c/u', note: 'Eligible for 4 Founders Pass Draws', noteEs: 'Elegible para los 4 sorteos de Founders Pass' },
];

const MP2_RANKS: RankRow[] = [
  { rank: 'Rank 1', rankEs: 'Puesto 1', coinReward: 'Top $COIN Share', fishReward: 'Top $FISH Share', nft: '1x Water Dyno Genesis NFT', tickets: '100 FP Tickets' },
  { rank: 'Rank 2', rankEs: 'Puesto 2', coinReward: 'Top $COIN Share', fishReward: 'Top $FISH Share', nft: '1x Founders Pass NFT', tickets: '80 FP Tickets' },
  { rank: 'Rank 3', rankEs: 'Puesto 3', coinReward: '50,000 $COIN', fishReward: '18,275 $FISH', tickets: '60 FP Raffle Tickets' },
  { rank: 'Rank 4', rankEs: 'Puesto 4', coinReward: '40,000 $COIN', fishReward: '14,620 $FISH', tickets: '50 FP Raffle Tickets' },
  { rank: 'Rank 5', rankEs: 'Puesto 5', coinReward: '35,000 $COIN', fishReward: '12,793 $FISH', tickets: '40 FP Raffle Tickets' },
  { rank: 'Rank 6 - 10', rankEs: 'Puestos 6 - 10', coinReward: '25,000 $COIN c/u', fishReward: '9,138 $FISH c/u', tickets: '30 FP Tickets c/u' },
  { rank: 'Rank 11 - 25', rankEs: 'Puestos 11 - 25', coinReward: '15,000 $COIN c/u', fishReward: '5,483 $FISH c/u', tickets: '20 FP Tickets c/u' },
  { rank: 'Rank 26 - 50', rankEs: 'Puestos 26 - 50', coinReward: '10,000 $COIN c/u', fishReward: '3,655 $FISH c/u', tickets: '15 FP Tickets c/u' },
  { rank: 'Rank 51 - 100', rankEs: 'Puestos 51 - 100', coinReward: '5,000 $COIN c/u', fishReward: '1,828 $FISH c/u', tickets: '10 FP Tickets c/u' },
  { rank: 'Rank 101 - 150', rankEs: 'Puestos 101 - 150', coinReward: '-', fishReward: '-', tickets: '6 FP Tickets c/u', note: 'Eligible for 4 Founders Pass Draws', noteEs: 'Elegible para los 4 sorteos de Founders Pass' },
];

const MP3_RANKS: RankRow[] = [
  { rank: 'Rank 1', rankEs: 'Puesto 1', fishReward: '15.0% of Dynamic $FISH Pool', nft: '1x Water Dyno Genesis NFT', tickets: '100 FP Tickets', note: 'Apex Champion', noteEs: 'Campeón Supremo' },
  { rank: 'Rank 2', rankEs: 'Puesto 2', fishReward: '10.0% of Dynamic $FISH Pool', nft: '1x Founders Pass NFT', tickets: '80 FP Tickets' },
  { rank: 'Rank 3', rankEs: 'Puesto 3', fishReward: '7.5% of Dynamic $FISH Pool', tickets: '60 FP Tickets' },
  { rank: 'Rank 4', rankEs: 'Puesto 4', fishReward: '5.0% of Dynamic $FISH Pool', tickets: '50 FP Tickets' },
  { rank: 'Rank 5', rankEs: 'Puesto 5', fishReward: '4.0% of Dynamic $FISH Pool', tickets: '40 FP Tickets' },
  { rank: 'Rank 6 - 10', rankEs: 'Puestos 6 - 10', fishReward: '3.0% of Dynamic $FISH Pool c/u', tickets: '30 FP Tickets c/u' },
  { rank: 'Rank 11 - 25', rankEs: 'Puestos 11 - 25', fishReward: '1.5% of Dynamic $FISH Pool c/u', tickets: '20 FP Tickets c/u' },
  { rank: 'Rank 26 - 50', rankEs: 'Puestos 26 - 50', fishReward: '0.96% of Dynamic $FISH Pool c/u', tickets: '15 FP Tickets c/u', note: 'Top 50 shares 99% of pool', noteEs: 'Top 50 se reparte el 99% del pozo' },
  { rank: 'Rank 51 - 100', rankEs: 'Puestos 51 - 100', tickets: '10 FP Tickets + 15 $FISH Draw Tickets', note: 'Eligible for 2x 0.5% $FISH Draws', noteEs: 'Elegible para 2 sorteos de 0.5% de $FISH' },
  { rank: 'Rank 101 - 150', rankEs: 'Puestos 101 - 150', tickets: '5 FP Tickets + 10 $FISH Draw Tickets', note: 'Eligible for both draws', noteEs: 'Elegible para ambos sorteos' },
  { rank: 'Rank 151 - 200', rankEs: 'Puestos 151 - 200', tickets: '10 $FISH Draw Tickets' },
  { rank: 'Rank 201 - 250', rankEs: 'Puestos 201 - 250', tickets: '5 $FISH Draw Tickets' },
];

export const EventLandingView: React.FC<Props> = ({ event, onSelectEvent }) => {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [activeMpRank, setActiveMpRank] = useState<MpRankKey>('mp1');
  const [selectedImageModal, setSelectedImageModal] = useState<{ url: string; title: string } | null>(null);

  const formatIsoDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(isEs ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const tabs: Array<{ key: TabKey; label: string; labelEs: string; count?: number | string }> = [
    { key: 'overview', label: 'Overview & Lore', labelEs: 'Visión y Lore' },
    { key: 'ranks', label: 'Rank Rewards (Sub-Pages)', labelEs: 'Premios por Rangos (Sub-Páginas)', count: 'MP 1-3' },
    { key: 'prizepool', label: 'Prize Pool & Collectibles', labelEs: 'Pozo y Coleccionables', count: 'NFTs' },
    { key: 'karma', label: 'Karma Model & Workers', labelEs: 'Modelo Karma y Workers', count: '12' },
    { key: 'mechanics', label: 'Battery & Production', labelEs: 'Batería y Producción', count: '15k' },
    { key: 'onboarding', label: 'Timeline & Guide', labelEs: 'Cronograma y Guía', count: '5' },
    { key: 'faq', label: 'Rules & FAQ', labelEs: 'Reglas y Preguntas', count: event.faqs?.length },
  ];

  return (
    <div className="w-full min-w-0 select-none pb-20 space-y-8 animate-fadeIn">
      {/* 1. Chronology Archive Event Switcher (Pill Nav) */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 pt-1 scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase px-1 shrink-0 font-bold">
            {isEs ? 'HISTÓRICO ON-CHAIN' : 'ON-CHAIN ARCHIVE'}
          </span>
          {OFFICIAL_EVENTS.map((ev) => {
            const isSelected = ev.id === event.id;
            return (
              <button
                key={ev.id}
                onClick={() => {
                  onSelectEvent({
                    id: ev.catalogId,
                    name: ev.title,
                    nameEs: ev.titleEs,
                    category: 'events',
                    badge: `EVENT #${ev.number}`,
                    badgeEs: `EVENTO #${ev.number}`,
                    iconSymbol: ev.prizeSymbol.replace('$', ''),
                  });
                  setActiveTab('overview');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border-none transition-all duration-200 shrink-0 ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/20'
                    : 'bg-[#18181b] text-slate-400 hover:text-white hover:bg-[#222228]'
                }`}
              >
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isSelected ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-black/40 text-amber-400'}`}>
                  #{ev.number}
                </span>
                <span>{isEs ? ev.titleEs.split(' x ')[0] : ev.title.split(' x ')[0]}</span>
                <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-900 font-extrabold' : 'text-purple-400 font-bold'}`}>
                  {ev.poolFactor}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-500 font-mono shrink-0">
          <span>RONIN NETWORK VERIFIED</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* 2. Official Hero Banner Image */}
      {event.mediaImages?.bannerImage && (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl group border-none">
          <img
            src={event.mediaImages.bannerImage}
            alt={event.title}
            className="w-full h-auto max-h-[360px] object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141415] via-transparent to-black/20 pointer-events-none" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setSelectedImageModal({ url: event.mediaImages!.bannerImage!, title: event.title })}
              className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-black/60 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/80 transition-all border-none flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <span>{isEs ? 'Ver Gráfico HD' : 'Inspect HD Banner'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Open Hero Section & Badges */}
      <div className="relative pt-1 space-y-4">
        <div className="absolute -top-12 -left-12 w-80 h-80 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border-none font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            MASTERPIECE #{event.number}
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#1a1a20] text-slate-300">
            {event.partner}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300">
            1 $FISH = 270 WORMS
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-800/80 text-zinc-400">
            {isEs ? 'EDICIÓN CONCLUIDA' : 'CONCLUDED EVENT'}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight font-display leading-tight">
            {isEs ? event.titleEs : event.title}
          </h1>
          <p className="text-base sm:text-xl text-amber-300/90 font-medium max-w-3xl leading-snug">
            {isEs ? event.taglineEs : event.tagline}
          </p>
        </div>

        {event.lore && (
          <div className="pt-2 pb-1 space-y-3 max-w-4xl">
            <blockquote className="text-sm sm:text-base text-slate-200 italic border-l-2 border-amber-400/60 pl-4 py-1 leading-relaxed">
              "{isEs ? event.lore.hookEs : event.lore.hook}"
            </blockquote>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {isEs ? event.lore.bodyEs : event.lore.body}
            </p>
          </div>
        )}

        {/* Quick Launch & In-App Portal Strip */}
        {event.officialLinks && event.officialLinks.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            {event.officialLinks.map((link, idx) => {
              const isGame = link.category === 'game';
              const isPortal = link.category === 'portal';
              return (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border-none transition-all duration-150 ${
                    isPortal
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20 hover:opacity-95'
                      : isGame
                      ? 'bg-[#1e1e24] text-amber-300 hover:bg-[#282832] hover:text-amber-200'
                      : 'bg-[#18181c] text-slate-400 hover:bg-[#222228] hover:text-white'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span>{isEs ? link.labelEs : link.label}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Open Canvas KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-white/[0.05]">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            {isEs ? 'TOKEN DE RECOMPENSA' : 'PRIZE REWARD TOKEN'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {event.prizeSymbol}
            </span>
            <span className="text-xs font-mono text-purple-400 font-semibold">Ronin</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {isEs ? '1 $FISH = 270 WORMS (off-chain)' : '1 $FISH = 270 WORMS (off-chain)'}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            {isEs ? 'FACTOR DE RETORNO' : 'DYNAMIC POOL FACTOR'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-amber-400 font-display">
              {event.poolFactor}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {isEs ? '70% Pozo • 20% Tax • 10% Quema' : '70% Pool • 20% Tax • 10% Burn'}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            {isEs ? 'REQUISITO DE ACCESO' : 'ACCESS REQUIREMENT'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
              Lv. 10 / 11
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {isEs ? 'TH Lv.10 (MP1-2) • TH Lv.11 (MP3)' : 'TH Lv.10 (MP1-2) • TH Lv.11 (MP3)'}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            {isEs ? 'FECHA DE LANZAMIENTO' : 'LAUNCH SCHEDULE'}
          </span>
          <div className="text-base sm:text-lg font-black text-white font-mono pt-1">
            {formatIsoDate(event.startDate)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {isEs ? 'Miércoles 2:00 PM UTC' : 'Wednesday 2:00 PM UTC'}
          </div>
        </div>
      </div>

      {/* 5. In-Landing Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none border-b border-white/[0.04]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border-none transition-all duration-150 shrink-0 select-none ${
                isActive
                  ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/25'
                  : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <span>{isEs ? tab.labelEs : tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-zinc-800 text-slate-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 6. Dynamic Content Views */}
      <div className="pt-2">
        {/* SUB-PAGE 1: OVERVIEW & LORE */}
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Event Flow Diagram Graphic */}
            {event.mediaImages?.flowImage && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-purple-400 uppercase">
                      {isEs ? 'DIAGRAMA OFICIAL DE FLUJO' : 'OFFICIAL EVENT FLOW ARCHITECTURE'}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {isEs ? 'Fase 1 vs Fase 2 y Desbloqueos de Masterpiece' : 'Phase 1 vs Phase 2 & Masterpiece Unlocks'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedImageModal({ url: event.mediaImages!.flowImage!, title: isEs ? 'Diagrama de Flujo del Evento' : 'Event Flow Diagram' })}
                    className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 border-none bg-transparent"
                  >
                    <span>{isEs ? 'Ampliar' : 'Zoom HD'}</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6" />
                      <path d="M9 21H3v-6" />
                      <path d="M21 3l-7 7" />
                      <path d="M3 21l7-7" />
                    </svg>
                  </button>
                </div>
                <div
                  onClick={() => setSelectedImageModal({ url: event.mediaImages!.flowImage!, title: isEs ? 'Diagrama de Flujo del Evento' : 'Event Flow Diagram' })}
                  className="rounded-2xl overflow-hidden cursor-zoom-in bg-[#16161a] p-2 hover:opacity-95 transition-opacity"
                >
                  <img
                    src={event.mediaImages.flowImage}
                    alt="Event Flow Diagram"
                    className="w-full h-auto max-h-[440px] object-contain rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Timeline Visual Graphic */}
            {event.mediaImages?.timelineImage && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase">
                      {isEs ? 'LÍNEA TEMPORAL VISUAL' : 'EVENT TIMELINE VISUALIZATION'}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {isEs ? 'Cronología Oficial de Aperturas y Descansos' : 'Official Schedule & Strategic Breaks'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedImageModal({ url: event.mediaImages!.timelineImage!, title: isEs ? 'Cronograma Visual del Evento' : 'Event Timeline' })}
                    className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 border-none bg-transparent"
                  >
                    <span>{isEs ? 'Ampliar' : 'Zoom HD'}</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6" />
                      <path d="M9 21H3v-6" />
                      <path d="M21 3l-7 7" />
                      <path d="M3 21l7-7" />
                    </svg>
                  </button>
                </div>
                <div
                  onClick={() => setSelectedImageModal({ url: event.mediaImages!.timelineImage!, title: isEs ? 'Cronograma Visual del Evento' : 'Event Timeline' })}
                  className="rounded-2xl overflow-hidden cursor-zoom-in bg-[#16161a] p-2 hover:opacity-95 transition-opacity"
                >
                  <img
                    src={event.mediaImages.timelineImage}
                    alt="Timeline Visualization"
                    className="w-full h-auto max-h-[360px] object-contain rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Pillars Overview Grid */}
            <div className="space-y-4 pt-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-amber-400 uppercase">
                {isEs ? 'PILARES MECÁNICOS DEL EVENTO' : 'CORE EVENT PILLARS'}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {event.mechanics.map((mech, idx) => (
                  <div key={idx} className="space-y-1.5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-400/10 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        0{idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-white">
                        {isEs ? mech.titleEs : mech.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-8">
                      {isEs ? mech.descriptionEs : mech.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-PAGE 2: COMPLETE RANK REWARDS SUB-PAGES (MP1, MP2, MP3) */}
        {activeTab === 'ranks' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono font-bold tracking-wider text-amber-400 uppercase">
                  {isEs ? 'SUB-PÁGINAS OFICIALES DE RANGOS' : 'OFFICIAL SUB-PAGES: RANK REWARDS'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                  {isEs ? 'Desglose Puesto por Puesto en Masterpieces 1, 2 y 3' : 'Rank-by-Rank Reward Breakdown: MP1, MP2 & MP3'}
                </h2>
              </div>

              {/* Sub-page Selector */}
              <div className="flex items-center gap-1.5 bg-[#17171c] p-1 rounded-full shrink-0">
                {(['mp1', 'mp2', 'mp3'] as MpRankKey[]).map((mpKey) => {
                  const isCur = activeMpRank === mpKey;
                  const label = mpKey === 'mp1' ? 'MP 1 (Aquarium)' : mpKey === 'mp2' ? 'MP 2 (Plushie)' : 'MP 3 (Monolith)';
                  return (
                    <button
                      key={mpKey}
                      onClick={() => setActiveMpRank(mpKey)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all border-none ${
                        isCur
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                          : 'text-slate-400 hover:text-white bg-transparent'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Official Infographic Graphic for current MP */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase">
                  {activeMpRank === 'mp1'
                    ? (isEs ? 'Infografía Oficial de MP1 (Grand Aquarium)' : 'Official MP1 Rank Chart')
                    : activeMpRank === 'mp2'
                    ? (isEs ? 'Infografía Oficial de MP2 (Frog Plushie)' : 'Official MP2 Rank Chart')
                    : (isEs ? 'Infografía Oficial de MP3 (Mega Monolith)' : 'Official MP3 Rank Chart')}
                </span>
                <button
                  onClick={() => {
                    const imgUrl =
                      activeMpRank === 'mp1'
                        ? event.mediaImages?.mp1PrizeImage || '/assets/events/FFPrizePoolMp1.png'
                        : activeMpRank === 'mp2'
                        ? event.mediaImages?.mp2PrizeImage || '/assets/events/FFPrizePoolMp2.png'
                        : event.mediaImages?.mp3PrizeImage || '/assets/events/FFPrizePoolMp3.png';
                    setSelectedImageModal({ url: imgUrl, title: `Rank Breakdown - ${activeMpRank.toUpperCase()}` });
                  }}
                  className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 border-none bg-transparent"
                >
                  <span>{isEs ? 'Ver Afiche HD' : 'Inspect HD Chart'}</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6" />
                    <path d="M9 21H3v-6" />
                    <path d="M21 3l-7 7" />
                    <path d="M3 21l7-7" />
                  </svg>
                </button>
              </div>

              <div
                onClick={() => {
                  const imgUrl =
                    activeMpRank === 'mp1'
                      ? event.mediaImages?.mp1PrizeImage || '/assets/events/FFPrizePoolMp1.png'
                      : activeMpRank === 'mp2'
                      ? event.mediaImages?.mp2PrizeImage || '/assets/events/FFPrizePoolMp2.png'
                      : event.mediaImages?.mp3PrizeImage || '/assets/events/FFPrizePoolMp3.png';
                  setSelectedImageModal({ url: imgUrl, title: `Rank Breakdown - ${activeMpRank.toUpperCase()}` });
                }}
                className="rounded-2xl overflow-hidden cursor-zoom-in bg-[#16161a] p-2 hover:opacity-95 transition-opacity"
              >
                <img
                  src={
                    activeMpRank === 'mp1'
                      ? event.mediaImages?.mp1PrizeImage || '/assets/events/FFPrizePoolMp1.png'
                      : activeMpRank === 'mp2'
                      ? event.mediaImages?.mp2PrizeImage || '/assets/events/FFPrizePoolMp2.png'
                      : event.mediaImages?.mp3PrizeImage || '/assets/events/FFPrizePoolMp3.png'
                  }
                  alt={`Rank Breakdown ${activeMpRank}`}
                  className="w-full h-auto max-h-[460px] object-contain rounded-xl"
                />
              </div>
            </div>

            {/* Interactive Data Table for the active MP ranks */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                  {isEs ? 'TABLA DE ASIGNACIONES POR PUESTO' : 'ALLOCATION TABLE BY RANK BRACKET'}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  {activeMpRank === 'mp3' ? 'Town Hall 11' : 'Town Hall 10'}
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl bg-[#16161a] p-1 border-none">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-slate-400 font-mono text-[11px]">
                      <th className="py-3 px-4">{isEs ? 'Puesto / Rango' : 'Rank Bracket'}</th>
                      <th className="py-3 px-4 text-amber-300">{isEs ? 'Recompensa Principal' : 'Primary Reward'}</th>
                      <th className="py-3 px-4 text-cyan-300">{isEs ? 'Tokens de Evento' : 'Event Tokens'}</th>
                      <th className="py-3 px-4 text-purple-300">{isEs ? 'Boletos de Sorteo' : 'Raffle Tickets'}</th>
                      <th className="py-3 px-4 text-slate-400">{isEs ? 'Notas / Elegibilidad' : 'Notes & Eligibility'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {(activeMpRank === 'mp1' ? MP1_RANKS : activeMpRank === 'mp2' ? MP2_RANKS : MP3_RANKS).map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                          {isEs ? row.rankEs : row.rank}
                        </td>
                        <td className="py-3 px-4 font-semibold text-amber-300">
                          {row.nft ? (
                            <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 font-mono text-[11px]">
                              {row.nft}
                            </span>
                          ) : (
                            row.coinReward || '-'
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                          {row.fishReward || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-purple-300">
                          {row.tickets || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {isEs ? row.noteEs || 'Dispersión directa' : row.note || 'Direct drop'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-PAGE 3: PRIZE POOL & DIGITAL COLLECTIBLES */}
        {activeTab === 'prizepool' && (
          <div className="space-y-10 animate-fadeIn">
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-amber-400 uppercase">
                {isEs ? 'AFICHE GENERAL Y COLECCIONABLES' : 'OFFICIAL POSTER & DIGITAL COLLECTIBLES'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                {isEs ? 'Todos los Premios, NFTs y Objetos Cosméticos' : 'Full Prize Pool, NFTs & Cosmetic Decor'}
              </h2>
            </div>

            {/* FFPrizePool HD Graphic */}
            {event.mediaImages?.overviewPrizeImage && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-amber-400 uppercase">
                    {isEs ? 'AFICHE GENERAL DE PREMIOS (HD)' : 'OFFICIAL PRIZE POOL POSTER (HD)'}
                  </span>
                  <button
                    onClick={() => setSelectedImageModal({ url: event.mediaImages!.overviewPrizeImage!, title: isEs ? 'Afiche Completo de Premios' : 'Full Prize Pool Poster' })}
                    className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 border-none bg-transparent"
                  >
                    <span>{isEs ? 'Ampliar Afiche' : 'Inspect HD Poster'}</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6" />
                      <path d="M9 21H3v-6" />
                      <path d="M21 3l-7 7" />
                      <path d="M3 21l7-7" />
                    </svg>
                  </button>
                </div>
                <div
                  onClick={() => setSelectedImageModal({ url: event.mediaImages!.overviewPrizeImage!, title: isEs ? 'Afiche Completo de Premios' : 'Full Prize Pool Poster' })}
                  className="rounded-2xl overflow-hidden cursor-zoom-in bg-[#16161a] p-2 hover:opacity-95 transition-opacity"
                >
                  <img
                    src={event.mediaImages.overviewPrizeImage}
                    alt="Full Prize Pool"
                    className="w-full h-auto max-h-[480px] object-contain rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Collectibles Spotlight: Statue Tier 1 & Avatars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Fishing Statue Tier 1 Card */}
              <div className="p-5 rounded-2xl bg-[#16161a] border-none flex flex-col sm:flex-row items-center gap-5">
                {event.mediaImages?.statueImage && (
                  <div
                    onClick={() => setSelectedImageModal({ url: event.mediaImages!.statueImage!, title: 'Fishing Statue Tier 1' })}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-black/40 p-2 flex items-center justify-center shrink-0 cursor-zoom-in hover:opacity-90 transition-opacity"
                  >
                    <img src={event.mediaImages.statueImage} alt="Fishing Statue Tier 1" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                    {isEs ? 'DECORACIÓN EXCLUSIVA DE EDIFICIO' : 'EXCLUSIVE BUILDING DECORATION'}
                  </span>
                  <h3 className="text-base font-bold text-white">Fishing Statue (Tier 1)</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isEs
                      ? 'Una de las 12 decoraciones marinas exclusivas otorgadas a los jugadores al alcanzar hitos de nivel en el evento. Adorna permanentemente la isla.'
                      : 'One of the 12 exclusive coastal building decorations awarded to players reaching milestone tiers during the event.'}
                  </p>
                </div>
              </div>

              {/* 19 Avatars & RAWRpass Info */}
              <div className="p-5 rounded-2xl bg-[#16161a] border-none space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-400">
                  {isEs ? 'AVATARES Y RAWR PASS' : 'AVATARS & RAWR PASS'}
                </span>
                <h3 className="text-base font-bold text-white">
                  {isEs ? '19 Avatares Cosméticos & Boletos de Rifa' : '19 Exclusive Avatars & Raffle Tickets'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isEs
                    ? '19 avatares de perfil con temática de pescadores y Dynos desbloqueables mediante progreso. Los boletos para la rifa de Water Dynos se distribuyeron de forma exclusiva a través de los RAWRpasses.'
                    : '19 unique fisherman & Dyno profile avatars unlockable through milestone progression. Water Dyno raffle tickets were exclusively distributed through RAWRpasses.'}
                </p>
              </div>
            </div>

            {/* Tiers List */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-amber-400 uppercase">
                {isEs ? 'CATEGORÍAS DE PREMIOS OFICIALES' : 'OFFICIAL REWARD TIERS'}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.rewardsTiers.map((tier, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#16161a] border-none space-y-1.5">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {isEs ? tier.tierEs : tier.tier}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {isEs ? tier.descriptionEs : tier.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-PAGE 4: KARMA MODEL & WORKERS */}
        {activeTab === 'karma' && (
          <div className="space-y-10 animate-fadeIn">
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-purple-400 uppercase">
                {isEs ? 'SUB-PÁGINA: MODELO DE KARMA Y TRABAJADORES' : 'SUB-PAGE: KARMA MODEL & WORKERS'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                {isEs ? 'Arquitectura del Modelo de Karma & Los 12 Workers' : 'Karma Score Model & 12 Event Workers'}
              </h2>
            </div>

            {/* Karma Score Model Visual Graphic */}
            {event.mediaImages?.karmaModelImage && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                    {isEs ? 'DIAGRAMA DEL MODELO DE KARMA' : 'KARMA SCORE MODEL DIAGRAM'}
                  </span>
                  <button
                    onClick={() => setSelectedImageModal({ url: event.mediaImages!.karmaModelImage!, title: isEs ? 'Modelo de Puntaje de Karma' : 'Karma Score Model' })}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 border-none bg-transparent"
                  >
                    <span>{isEs ? 'Ampliar' : 'Zoom HD'}</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6" />
                      <path d="M9 21H3v-6" />
                      <path d="M21 3l-7 7" />
                      <path d="M3 21l7-7" />
                    </svg>
                  </button>
                </div>
                <div
                  onClick={() => setSelectedImageModal({ url: event.mediaImages!.karmaModelImage!, title: isEs ? 'Modelo de Puntaje de Karma' : 'Karma Score Model' })}
                  className="rounded-2xl overflow-hidden cursor-zoom-in bg-[#16161a] p-2 hover:opacity-95 transition-opacity"
                >
                  <img
                    src={event.mediaImages.karmaModelImage}
                    alt="Karma Score Model"
                    className="w-full h-auto max-h-[420px] object-contain rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* FFWorkers Visual Graphic */}
            {event.mediaImages?.workersImage && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">
                    {isEs ? 'AFICHE OFICIAL DE WORKERS (FISHING FRENZY)' : 'OFFICIAL WORKERS INFOGRAPHIC'}
                  </span>
                  <button
                    onClick={() => setSelectedImageModal({ url: event.mediaImages!.workersImage!, title: isEs ? 'Infografía Oficial de Workers' : 'Event Workers Infographic' })}
                    className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 border-none bg-transparent"
                  >
                    <span>{isEs ? 'Ampliar' : 'Zoom HD'}</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6" />
                      <path d="M9 21H3v-6" />
                      <path d="M21 3l-7 7" />
                      <path d="M3 21l7-7" />
                    </svg>
                  </button>
                </div>
                <div
                  onClick={() => setSelectedImageModal({ url: event.mediaImages!.workersImage!, title: isEs ? 'Infografía Oficial de Workers' : 'Event Workers Infographic' })}
                  className="rounded-2xl overflow-hidden cursor-zoom-in bg-[#16161a] p-2 hover:opacity-95 transition-opacity"
                >
                  <img
                    src={event.mediaImages.workersImage}
                    alt="Fishing Frenzy Workers"
                    className="w-full h-auto max-h-[440px] object-contain rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Karma Workers Table */}
            {event.karmaWorkers && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                  {isEs ? 'TABLA DE UMBRALES DE KARMA' : 'KARMA THRESHOLD REQUIREMENTS'}
                </span>
                <div className="overflow-x-auto rounded-2xl bg-[#16161a] p-1 border-none">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-slate-400 font-mono text-[11px]">
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">{isEs ? 'Categoría' : 'Category'}</th>
                        <th className="py-3 px-4">{isEs ? 'Karma Requerido' : 'Required Karma'}</th>
                        <th className="py-3 px-4">{isEs ? 'Trabajador' : 'Worker'}</th>
                        <th className="py-3 px-4 text-emerald-400">{isEs ? 'Beneficio' : 'Bonus'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {event.karmaWorkers.map((k) => (
                        <tr key={k.workerNumber} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-400">
                            {k.workerNumber.toString().padStart(2, '0')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${k.category === 'Legendary' ? 'bg-amber-500/20 text-amber-300 font-bold' : k.category === 'Rare' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-zinc-800 text-slate-300'}`}>
                              {isEs ? k.categoryEs : k.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                            {k.karmaFormatted} pts
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-200">
                            Worker #{k.workerNumber}
                          </td>
                          <td className="py-3 px-4 text-emerald-300 font-medium">
                            {isEs ? k.bonusEs : k.bonus}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB-PAGE 5: BATTERY & PRODUCTION (CSV) */}
        {activeTab === 'mechanics' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Battery Overhaul */}
            <div className="space-y-4">
              <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                {isEs ? 'SISTEMA DE BATERÍA BOOSTED' : 'BOOSTED BATTERY ENERGY SYSTEM'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                {isEs ? 'Ajustes Oficiales de Energía por 7.5x' : '7.5x Overall Daily Energy Scaling'}
              </h2>

              {event.batteryOverhaul && (
                <div className="overflow-x-auto rounded-2xl bg-[#16161a] p-1 border-none">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-slate-400 font-mono text-[11px]">
                        <th className="py-3 px-4">{isEs ? 'Parámetro' : 'Parameter'}</th>
                        <th className="py-3 px-4">{isEs ? 'Juego Habitual' : 'Regular Game'}</th>
                        <th className="py-3 px-4 text-emerald-400">{isEs ? 'Durante el Evento' : 'Event Buff'}</th>
                        <th className="py-3 px-4 text-amber-300">{isEs ? 'Multiplicador' : 'Scaling'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {event.batteryOverhaul.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-semibold text-white">
                            {isEs ? row.metricEs : row.metric}
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-mono">{row.regular}</td>
                          <td className="py-3 px-4 text-emerald-300 font-mono font-bold text-sm">{row.event}</td>
                          <td className="py-3 px-4 text-amber-400 font-mono font-bold">{row.change}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recipes Grid */}
            <div className="space-y-4 pt-4 border-t border-white/[0.04]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
                    {isEs ? 'FÁBRICAS Y RECETAS (CSV OFICIAL)' : 'OFFICIAL CSV PRODUCTION MATRIX'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {isEs ? '9 Líneas Gastronómicas Marinas' : '9 Maritime Processing Lines'}
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-white/[0.03] px-3 py-1 rounded-full">
                  {event.recipes.length} {isEs ? 'Recetas' : 'Recipes'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.recipes.map((rec) => (
                  <div
                    key={rec.symbol}
                    className="p-4 rounded-2xl bg-[#17171b] border-none space-y-3 hover:bg-[#1d1d23] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ResourceIcon symbol={rec.symbol} size={32} />
                        <div className="min-w-0">
                          <div className="font-extrabold text-white text-sm truncate">
                            {isEs ? rec.nameEs : rec.name}
                          </div>
                          <div className="text-[10px] text-purple-400 font-mono font-bold">{rec.symbol}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold bg-black/40 text-amber-300 px-2 py-0.5 rounded-md shrink-0">
                        {rec.duration}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/[0.04] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">{isEs ? 'Producción:' : 'Output:'}</span>
                        <span className="font-mono font-bold text-emerald-400">
                          +{rec.outputAmount} {rec.outputToken}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-slate-400 text-[11px] shrink-0">{isEs ? 'Insumos:' : 'Inputs:'}</span>
                        <div className="text-right font-mono font-medium text-amber-300/90 text-[11px]">
                          {rec.inputs.map((inp, idx) => (
                            <div key={idx}>
                              {inp.amount} {inp.token}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-PAGE 6: TIMELINE & ONBOARDING GUIDE */}
        {activeTab === 'onboarding' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Frenzy Onboarding Visual Flowchart */}
            {event.mediaImages?.onboardingImage && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                    {isEs ? 'DIAGRAMA OFICIAL DE ONBOARDING' : 'OFFICIAL ONBOARDING FLOWCHART'}
                  </span>
                  <button
                    onClick={() => setSelectedImageModal({ url: event.mediaImages!.onboardingImage!, title: isEs ? 'Diagrama de Onboarding de Jugadores' : 'Player Onboarding Flowchart' })}
                    className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 border-none bg-transparent"
                  >
                    <span>{isEs ? 'Ampliar' : 'Zoom HD'}</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6" />
                      <path d="M9 21H3v-6" />
                      <path d="M21 3l-7 7" />
                      <path d="M3 21l7-7" />
                    </svg>
                  </button>
                </div>
                <div
                  onClick={() => setSelectedImageModal({ url: event.mediaImages!.onboardingImage!, title: isEs ? 'Diagrama de Onboarding de Jugadores' : 'Player Onboarding Flowchart' })}
                  className="rounded-2xl overflow-hidden cursor-zoom-in bg-[#16161a] p-2 hover:opacity-95 transition-opacity"
                >
                  <img
                    src={event.mediaImages.onboardingImage}
                    alt="Frenzy Onboarding"
                    className="w-full h-auto max-h-[460px] object-contain rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* 5-Step Pipeline */}
            <div className="space-y-6 pt-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                {isEs ? 'RUTA DE 5 PASOS PARA JUGAR' : '5-STEP PLAYER JOURNEY'}
              </span>

              {(event.guideSteps || []).map((step) => (
                <div key={step.step} className="flex gap-4 sm:gap-6 items-start">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black font-mono text-sm sm:text-base flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/30">
                    {step.step}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-grow pb-4 border-b border-white/[0.04]">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {isEs ? step.titleEs : step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {isEs ? step.descriptionEs : step.description}
                    </p>
                    {step.tip && (
                      <div className="flex items-center gap-2 pt-1 text-xs text-amber-300/90 font-mono">
                        <span className="text-[10px] uppercase font-bold bg-amber-400/10 px-2 py-0.5 rounded text-amber-300">
                          PRO TIP
                        </span>
                        <span>{isEs ? step.tipEs : step.tip}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-PAGE 7: RULES & FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-purple-400 uppercase">
                {isEs ? 'BASE DE CONOCIMIENTO Y REGLAS OFICIALES' : 'OFFICIAL KNOWLEDGEBASE & RULES'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                {isEs ? 'Preguntas Frecuentes de la Guía Oficial' : 'Official Notion FAQ & Guidelines'}
              </h2>
            </div>

            <div className="space-y-3 pt-2">
              {(event.faqs || []).map((faq, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-[#16161a] border-none space-y-2 hover:bg-[#1b1b22] transition-colors"
                >
                  <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs flex items-center justify-center shrink-0">
                      Q
                    </span>
                    <span>{isEs ? faq.questionEs : faq.question}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7">
                    {isEs ? faq.answerEs : faq.answer}
                  </p>
                </div>
              ))}
            </div>

            {/* VOYA ID Info Banner */}
            <div className="p-5 rounded-2xl bg-[#18181e] border-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">
                  {isEs ? 'RECLAMACIÓN ON-CHAIN' : 'ON-CHAIN CLAIMS'}
                </span>
                <h4 className="text-sm font-bold text-white">
                  {isEs ? 'Todos los premios se reclaman en el portal VOYA ID' : 'All tokens and NFTs deposited via VOYA ID'}
                </h4>
                <p className="text-xs text-slate-400">
                  https://craft-world.gg/voya-id/index.html
                </p>
              </div>
              <a
                href="https://craft-world.gg/voya-id/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition-colors shrink-0 text-center"
              >
                {isEs ? 'Ir a VOYA ID' : 'Open VOYA ID'}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 7. Full-Screen Image Lightbox Modal */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedImageModal(null)}
        >
          <div className="max-w-5xl w-full flex items-center justify-between pb-3 text-white">
            <span className="font-bold text-sm sm:text-base font-display">
              {selectedImageModal.title}
            </span>
            <button
              onClick={() => setSelectedImageModal(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border-none"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div
            className="max-w-5xl w-full max-h-[85vh] flex items-center justify-center overflow-auto rounded-2xl bg-[#141415] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImageModal.url}
              alt={selectedImageModal.title}
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
          <div className="pt-2 text-xs text-slate-400 font-mono">
            {isEs ? 'Haz clic en cualquier parte fuera de la imagen para cerrar' : 'Click anywhere outside to close'}
          </div>
        </div>
      )}
    </div>
  );
};
