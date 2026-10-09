import React, { useState } from 'react';
import type { LandingSuiteSection } from '../types';

interface LandingDeveloperSuiteProps {
  suite: LandingSuiteSection;
}

export const LandingDeveloperSuite: React.FC<LandingDeveloperSuiteProps> = ({ suite }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="features" className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-28 text-center relative z-20">
      {/* Top Pill Badge */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1c1c20] text-xs font-medium text-zinc-300 mb-6 backdrop-blur-sm shadow-inner transition-transform hover:scale-105 border-0">
        <svg
          className="w-3.5 h-3.5 text-amber-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        <span>{suite.badge}</span>
      </div>

      {/* Main Section Headline */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight sm:leading-snug mb-8 max-w-2xl mx-auto">
        {suite.titleLine1}
        <br className="hidden sm:inline" />{' '}
        {suite.titleLine2}
      </h2>

      {/* Tabs Navigation Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
        {suite.tabs.map((tab, idx) => {
          const isActive = activeTab === idx;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border-0 outline-none ${
                isActive
                  ? 'bg-[#24252e] text-amber-400 font-bold shadow-md scale-[1.02]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#202024]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 3-Column Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {/* CARD 1: Edge Deployments */}
        <div className="bg-[#1c1c20] rounded-3xl p-6 flex flex-col justify-between hover:bg-[#222227] transition-all duration-300 shadow-xl group border-0">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-lg bg-[#24252e] text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {suite.card1.num}
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">
                {suite.card1.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
              {suite.card1.desc}
            </p>
          </div>

          {/* Interactive Widget 1 */}
          <div className="space-y-3 pt-2">
            {/* Status Item 1 */}
            <div className="bg-[#151518] rounded-2xl p-4 flex items-center justify-between transition-colors border-0">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs flex-shrink-0">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {suite.card1.item1Title}
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">
                    {suite.card1.item1Time}
                  </span>
                </div>
              </div>
              <svg className="w-4 h-4 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>

            {/* Status Item 2 */}
            <div className="bg-[#151518] rounded-2xl p-4 flex items-center justify-between transition-colors border-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-amber-400 w-5 text-center flex-shrink-0">
                  {'>_'}
                </span>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {suite.card1.item2Title}
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">
                    {suite.card1.item2Time}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Serverless Database */}
        <div className="bg-[#1c1c20] rounded-3xl p-6 flex flex-col justify-between hover:bg-[#222227] transition-all duration-300 shadow-xl group border-0">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-lg bg-[#24252e] text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {suite.card2.num}
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">
                {suite.card2.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
              {suite.card2.desc}
            </p>
          </div>

          {/* Interactive Widget 2 */}
          <div className="space-y-3 pt-2">
            {/* Stats Box */}
            <div className="bg-[#151518] rounded-2xl p-4 space-y-2 transition-colors border-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">{suite.card2.stat1Label}</span>
                <span className="text-xs font-mono font-bold text-amber-400">{suite.card2.stat1Value}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">{suite.card2.stat2Label}</span>
                <span className="text-xs font-mono font-bold text-white">{suite.card2.stat2Value}</span>
              </div>
            </div>

            {/* Table Verified Box */}
            <div className="bg-[#151518] rounded-2xl p-4 flex items-center justify-between transition-colors border-0">
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
                <span className="text-xs font-mono font-bold text-white">
                  {suite.card2.tableName}
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-400">
                {suite.card2.verifiedBadge}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: Realtime Monitor */}
        <div className="bg-[#1c1c20] rounded-3xl p-6 flex flex-col justify-between hover:bg-[#222227] transition-all duration-300 shadow-xl group border-0">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-lg bg-[#24252e] text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {suite.card3.num}
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">
                {suite.card3.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
              {suite.card3.desc}
            </p>
          </div>

          {/* Interactive Widget 3 */}
          <div className="space-y-3 pt-2">
            {/* Filter Dropdowns Row */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#151518] text-xs text-zinc-300 py-1.5 px-3 rounded-xl flex items-center justify-between border-0">
                <span>{suite.card3.filterRegion}</span>
                <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <div className="w-20 bg-[#151518] text-xs text-zinc-300 py-1.5 px-3 rounded-xl flex items-center justify-between border-0">
                <span>{suite.card3.filterTime}</span>
                <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Realtime Wave Chart */}
            <div className="bg-[#151518] rounded-2xl p-3 relative overflow-hidden h-24 flex items-end border-0">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 300 80"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area under curve */}
                <path
                  d="M0,60 C40,58 70,55 110,50 C150,45 180,62 220,52 C260,42 280,25 300,10 L300,80 L0,80 Z"
                  fill="url(#chartGradient)"
                />
                {/* Smooth Glowing Line */}
                <path
                  d="M0,60 C40,58 70,55 110,50 C150,45 180,62 220,52 C260,42 280,25 300,10"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Export Logs Button */}
            <button
              type="button"
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer border-0 outline-none"
            >
              <svg className="w-3.5 h-3.5 text-zinc-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{suite.card3.exportButton}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
