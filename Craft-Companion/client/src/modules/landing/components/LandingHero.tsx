import React from 'react';
import { Link } from 'react-router-dom';
import { StarBold } from 'solar-icon-set';
import type { LandingTranslations } from '../types';

interface LandingHeroProps {
  content: LandingTranslations;
}

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces&q=80',
];

export const LandingHero: React.FC<LandingHeroProps> = ({ content }) => {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 text-center relative z-20">
      {/* Top Pill Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c1c20] text-xs sm:text-sm font-medium text-zinc-300 mb-8 backdrop-blur-sm shadow-inner transition-transform hover:scale-105 border-0">
        <img src="/assets/resources/Coin.png" alt="Coin" className="w-4 h-4 object-contain" />
        <span>{content.hero.badge}</span>
      </div>

      {/* Main Headline with Game Font */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-game tracking-wide text-white leading-[1.14] mb-6 max-w-3xl mx-auto">
        {content.hero.headline.split('\n').map((line, idx) => (
          <React.Fragment key={idx}>
            {line}
            {idx < content.hero.headline.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </h1>

      {/* Subtitle Paragraph */}
      <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
        {content.hero.subtitle}
      </p>

      {/* Call To Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
        {/* Primary Amber Button */}
        <Link
          to="/signin"
          className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold px-6 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 text-sm sm:text-base group border-0 outline-none"
        >
          <span>{content.hero.primaryCta}</span>
          <svg
            className="w-4 h-4 text-zinc-950 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </Link>

        {/* Secondary Dark Button */}
        <Link
          to="/signin"
          className="w-full sm:w-auto bg-[#1c1c20] hover:bg-[#25252c] text-zinc-200 font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center active:scale-95 text-sm sm:text-base border-0 outline-none"
        >
          {content.hero.secondaryCta}
        </Link>
      </div>

      {/* Social Proof / Ratings */}
      <div className="inline-flex items-center justify-center gap-3">
        {/* Overlapping Avatars */}
        <div className="flex -space-x-2.5 overflow-hidden">
          {AVATARS.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Client ${idx + 1}`}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-[#141415] object-cover"
              loading="lazy"
            />
          ))}
        </div>

        {/* 5 Stars and Review Count */}
        <div className="flex flex-col items-start text-left">
          <div className="flex items-center gap-0.5 text-amber-400">
            <StarBold className="w-3.5 h-3.5 text-amber-400" />
            <StarBold className="w-3.5 h-3.5 text-amber-400" />
            <StarBold className="w-3.5 h-3.5 text-amber-400" />
            <StarBold className="w-3.5 h-3.5 text-amber-400" />
            <StarBold className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-xs text-zinc-400 font-medium mt-0.5">
            {content.hero.trustedBy}
          </span>
        </div>
      </div>
    </section>
  );
};
