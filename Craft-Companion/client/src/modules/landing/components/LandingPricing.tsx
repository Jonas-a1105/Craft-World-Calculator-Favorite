import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleBold, BoltBold, UserBold, CrownBold } from 'solar-icon-set';
import { CardFireStreak } from './CardFireStreak';
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
      <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#1c1c20] text-xs font-medium text-zinc-300 mb-5 backdrop-blur-sm shadow-inner transition-transform hover:scale-105 border-0">
        <span>{pricing.badge}</span>
      </div>

      {/* Main Headline with Game Font */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-game text-white leading-[1.35] sm:leading-[1.4] mb-4 max-w-2xl mx-auto">
        {pricing.title}
      </h2>

      {/* Subtitle */}
      <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
        {pricing.subtitle}
      </p>

      {/* Billing Switcher (Annually / Monthly with floating discount badge) */}
      <div className="inline-flex items-center relative mb-16">
        {/* Floating -20% Badge */}
        <div className="absolute -top-3.5 -left-3.5 -rotate-12 bg-amber-400 text-zinc-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md border-0 z-10 pointer-events-none">
          {pricing.billing.discount}
        </div>

        <div className="bg-[#1c1c20] rounded-full p-1.5 flex items-center gap-1 shadow-inner border-0">
          <button
            type="button"
            onClick={() => setBillingCycle('annually')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 outline-none ${
              isAnnual
                ? 'bg-[#24252e] text-amber-400 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {pricing.billing.annually}
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 outline-none ${
              !isAnnual
                ? 'bg-[#24252e] text-amber-400 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {pricing.billing.monthly}
          </button>
        </div>
      </div>

      {/* 3 Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch">
        {/* CARD 1: Hobby / Explorer */}
        <div className="bg-[#1c1c20] rounded-3xl p-7 flex flex-col justify-between hover:bg-[#222227] transition-all duration-300 shadow-xl group border-0">
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
                <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                  {plans.hobby.price}
                </span>
              </div>
            </div>

            {/* Core Features List */}
            <div className="mt-8 pt-4">
              <span className="text-xs font-semibold text-zinc-300 block mb-3.5">
                {plans.hobby.featuresTitle}
              </span>
              <ul className="space-y-2.5">
                {plans.hobby.features.map((feat, idx) => (
                  <li key={idx} className="text-xs sm:text-[13px] text-zinc-300 flex items-start gap-2">
                    <CheckCircleBold className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            to="/signin"
            className="w-full mt-8 bg-[#24252e] hover:bg-[#2e303a] text-white rounded-xl py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 border-0 outline-none group"
          >
            <UserBold className="w-3.5 h-3.5 text-zinc-400 group-hover:scale-110 transition-transform" />
            <span>{plans.hobby.cta}</span>
          </Link>
        </div>

        {/* CARD 2: Industrial Pro (Most Popular) with Fire Streak Particles & Laser Beam */}
        <div className="relative flex flex-col justify-between h-full group">
          {/* Game Win-Streak Fire Particles rising from below and behind the card */}
          <CardFireStreak />

          {/* Most Popular Solid Amber Floating Badge (outside overflow:hidden so it never clips!) */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-zinc-950 font-black px-4 py-1 rounded-full text-[11px] tracking-wider uppercase shadow-xl shadow-amber-500/30 border-0 select-none z-30 flex items-center gap-1.5 whitespace-nowrap">
            <BoltBold className="w-3.5 h-3.5 text-zinc-950" />
            <span>{plans.growth.badge}</span>
          </div>

          {/* The Card Container with 360 Laser Beam */}
          <div className="popular-card-container flex flex-col justify-between h-full flex-1 relative z-10">
            {/* Animated 360-degree Border Beam Layers */}
            <div className="popular-card-beam" />
            <div className="popular-card-beam-glow" />

            {/* Inner Card Content */}
            <div className="popular-card-inner p-7 pt-8 flex flex-col justify-between relative h-full">
              <div>
                {/* Header: Title, Description & Price */}
                <div className="flex items-start justify-between gap-4 mb-4 pt-1">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {plans.growth.name}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {plans.growth.description}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                      {growthPrice}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium block mt-0.5">
                      {plans.growth.period}
                    </span>
                  </div>
                </div>

                {/* Included Features List */}
                <div className="mt-8 pt-4">
                  <span className="text-xs font-semibold text-zinc-300 block mb-3.5">
                    {plans.growth.featuresTitle}
                  </span>
                  <ul className="space-y-2.5">
                    {plans.growth.features.map((feat, idx) => (
                      <li key={idx} className="text-xs sm:text-[13px] text-zinc-300 flex items-start gap-2">
                        <CheckCircleBold className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA Button (Solid Amber Primary) */}
              <Link
                to="/signin"
                className="w-full mt-8 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-xl py-3 px-4 text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 border-0 outline-none group/btn"
              >
                <BoltBold className="w-4 h-4 text-zinc-950 group-hover/btn:scale-110 transition-transform" />
                <span>{plans.growth.cta}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* CARD 3: Scale / Guild Master */}
        <div className="bg-[#1c1c20] rounded-3xl p-7 flex flex-col justify-between hover:bg-[#222227] transition-all duration-300 shadow-xl group border-0">
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
                <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                  {scalePrice}
                </span>
                <span className="text-[11px] text-zinc-500 font-medium block mt-0.5">
                  {plans.scale.period}
                </span>
              </div>
            </div>

            {/* Included Features List */}
            <div className="mt-8 pt-4">
              <span className="text-xs font-semibold text-zinc-300 block mb-3.5">
                {plans.scale.featuresTitle}
              </span>
              <ul className="space-y-2.5">
                {plans.scale.features.map((feat, idx) => (
                  <li key={idx} className="text-xs sm:text-[13px] text-zinc-300 flex items-start gap-2">
                    <CheckCircleBold className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            to="/signin"
            className="w-full mt-8 bg-[#24252e] hover:bg-[#2e303a] text-white rounded-xl py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 border-0 outline-none group"
          >
            <CrownBold className="w-3.5 h-3.5 text-zinc-400 group-hover:scale-110 transition-transform" />
            <span>{plans.scale.cta}</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
