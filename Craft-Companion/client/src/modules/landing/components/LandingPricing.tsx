import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { LandingPricingSection } from '../types';

interface LandingPricingProps {
  pricing: LandingPricingSection;
}

export const LandingPricing: React.FC<LandingPricingProps> = ({ pricing }) => {
  const [billingCycle, setBillingCycle] = useState<'annually' | 'monthly'>('annually');

  const { plans } = pricing;

  // Dynamically compute monthly price if monthly is chosen (regular price without 20% discount)
  const isAnnual = billingCycle === 'annually';
  const growthPrice = isAnnual ? plans.growth.price : '$49';
  const scalePrice = isAnnual ? plans.scale.price : '$99';

  return (
    <section id="pricing" className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-32 text-center relative z-20">
      {/* Top Pill Badge */}
      <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#18181b]/80 border border-white/10 text-xs font-medium text-zinc-300 mb-5 backdrop-blur-sm shadow-inner transition-transform hover:scale-105">
        <span>{pricing.badge}</span>
      </div>

      {/* Main Headline */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-3">
        {pricing.title}
      </h2>

      {/* Subtitle */}
      <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
        {pricing.subtitle}
      </p>

      {/* Billing Switcher (Annually / Monthly with floating discount badge) */}
      <div className="inline-flex items-center relative mb-16">
        {/* Floating -20% Badge */}
        <div className="absolute -top-3.5 -left-3.5 -rotate-12 bg-white text-zinc-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md border border-zinc-200 z-10 pointer-events-none">
          {pricing.billing.discount}
        </div>

        <div className="bg-[#18181b] border border-white/10 rounded-full p-1.5 flex items-center gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => setBillingCycle('annually')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isAnnual
                ? 'bg-[#27272e] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {pricing.billing.annually}
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              !isAnnual
                ? 'bg-[#27272e] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {pricing.billing.monthly}
          </button>
        </div>
      </div>

      {/* 3 Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch">
        {/* CARD 1: Hobby */}
        <div className="bg-[#141416]/95 border border-white/[0.08] rounded-3xl p-7 flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-xl group">
          <div>
            {/* Header: Title, Description & Price */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  {plans.hobby.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {plans.hobby.description}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {plans.hobby.price}
                </span>
              </div>
            </div>

            {/* Core Features List */}
            <div className="mt-8 pt-4 border-t border-white/[0.06]">
              <span className="text-xs font-semibold text-zinc-300 block mb-3.5">
                {plans.hobby.featuresTitle}
              </span>
              <ul className="space-y-2.5">
                {plans.hobby.features.map((feat, idx) => (
                  <li key={idx} className="text-xs sm:text-[13px] text-zinc-300 flex items-start gap-2">
                    <span className="text-zinc-500 font-bold select-none">•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            to="/signin"
            className="w-full mt-8 bg-[#18181b] hover:bg-[#222228] text-white border border-white/10 rounded-xl py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span>{plans.hobby.cta}</span>
          </Link>
        </div>

        {/* CARD 2: Growth (Most Popular) */}
        <div className="bg-[#141416]/95 border border-white/20 rounded-3xl p-7 flex flex-col justify-between relative hover:border-white/40 transition-all duration-300 shadow-2xl group">
          {/* Most Popular Floating Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1c1c20] border border-white/20 px-3.5 py-0.5 rounded-full text-[11px] font-semibold text-zinc-200 shadow-md">
            {plans.growth.badge}
          </div>

          <div>
            {/* Header: Title, Description & Price */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  {plans.growth.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {plans.growth.description}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {growthPrice}
                </span>
                <span className="text-[11px] text-zinc-500 font-medium block mt-0.5">
                  {plans.growth.period}
                </span>
              </div>
            </div>

            {/* Included Features List */}
            <div className="mt-8 pt-4 border-t border-white/[0.06]">
              <span className="text-xs font-semibold text-zinc-300 block mb-3.5">
                {plans.growth.featuresTitle}
              </span>
              <ul className="space-y-2.5">
                {plans.growth.features.map((feat, idx) => (
                  <li key={idx} className="text-xs sm:text-[13px] text-zinc-300 flex items-start gap-2">
                    <span className="text-zinc-500 font-bold select-none">•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA Button (White Primary) */}
          <Link
            to="/signin"
            className="w-full mt-8 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            <svg className="w-3.5 h-3.5 text-zinc-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>{plans.growth.cta}</span>
          </Link>
        </div>

        {/* CARD 3: Scale */}
        <div className="bg-[#141416]/95 border border-white/[0.08] rounded-3xl p-7 flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-xl group">
          <div>
            {/* Header: Title, Description & Price */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  {plans.scale.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {plans.scale.description}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {scalePrice}
                </span>
                <span className="text-[11px] text-zinc-500 font-medium block mt-0.5">
                  {plans.scale.period}
                </span>
              </div>
            </div>

            {/* Included Features List */}
            <div className="mt-8 pt-4 border-t border-white/[0.06]">
              <span className="text-xs font-semibold text-zinc-300 block mb-3.5">
                {plans.scale.featuresTitle}
              </span>
              <ul className="space-y-2.5">
                {plans.scale.features.map((feat, idx) => (
                  <li key={idx} className="text-xs sm:text-[13px] text-zinc-300 flex items-start gap-2">
                    <span className="text-zinc-500 font-bold select-none">•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            to="/signin"
            className="w-full mt-8 bg-[#18181b] hover:bg-[#222228] text-white border border-white/10 rounded-xl py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="2" />
              <line x1="15" y1="8" x2="17" y2="8" />
              <line x1="15" y1="12" x2="17" y2="12" />
              <line x1="7" y1="16" x2="17" y2="16" />
            </svg>
            <span>{plans.scale.cta}</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
