import React, { useState } from 'react';
import type { LandingFaqSection } from '../types';

interface LandingFaqProps {
  faq: LandingFaqSection;
}

export const LandingFaq: React.FC<LandingFaqProps> = ({ faq }) => {
  // Item 5 is open by default matching the screenshot
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ '5': true });

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section id="faq" className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-32 relative z-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Title, Subtitle, Contact Information */}
        <div className="lg:col-span-5 text-left">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#1c1c20] text-xs font-medium text-zinc-300 mb-6 backdrop-blur-sm shadow-inner transition-transform hover:scale-105 border-0">
            <span>{faq.badge}</span>
          </div>

          {/* Headline with Game Font */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-game text-white mb-4 leading-[1.35] sm:leading-[1.4]">
            {faq.title}
          </h2>

          {/* Description */}
          <p className="text-zinc-400 text-sm leading-relaxed mb-10 max-w-sm">
            {faq.subtitle}
          </p>

          {/* Contact Details */}
          <div className="space-y-4 pt-2">
            {/* Location */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
              <svg className="w-4 h-4 text-amber-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{faq.contact.location}</span>
            </div>

            {/* Community Channel */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
              <svg className="w-4 h-4 text-amber-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{faq.contact.phone}</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
              <svg className="w-4 h-4 text-amber-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a
                href={`mailto:${faq.contact.email}`}
                className="hover:text-amber-400 transition-colors underline-offset-4 hover:underline"
              >
                {faq.contact.email}
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: FAQ Accordion */}
        <div className="lg:col-span-7 space-y-3 text-left">
          {faq.questions.map((item) => {
            const isOpen = !!openIds[item.id];
            return (
              <div
                key={item.id}
                className="bg-[#1c1c20] hover:bg-[#222227] rounded-2xl p-4 sm:p-5 transition-colors border-0"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-center justify-between text-left transition-colors cursor-pointer group border-0 outline-none"
                  aria-expanded={isOpen}
                >
                  <span className={`text-sm sm:text-base font-semibold pr-4 transition-colors ${isOpen ? 'text-amber-400' : 'text-white group-hover:text-amber-300'}`}>
                    {item.question}
                  </span>
                  <svg
                    className={`w-4 h-4 transform transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-amber-400' : 'text-zinc-400 group-hover:text-white'
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-3 pr-4 animate-fadeIn">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
