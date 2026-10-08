import React from 'react';
import { LightningCanvas } from './LightningCanvas';

export const AnimatedLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className || ''}`}
    >
      {/* 1. Deep Atmospheric Radial Glow Layers */}
      <div className="absolute top-[32%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-amber-500/25 rounded-full blur-[80px] pointer-events-none animate-pulse" />
      <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[500px] sm:h-[300px] bg-purple-600/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 bg-cyan-400/20 rounded-full blur-[90px] pointer-events-none" />

      {/* 2. Main Logo Container */}
      <div className="relative w-full max-w-[460px] sm:max-w-[580px] md:max-w-[660px] aspect-[2256/1576] flex items-center justify-center">
        {/* Crisp Transparent Logo Graphic */}
        <img
          src="/assets/logo.png"
          alt="Craft World - Angry Dynomites Lab"
          className="w-full h-full object-contain pointer-events-none select-none animate-logo-breathing drop-shadow-[0_16px_50px_rgba(147,51,234,0.4)]"
          draggable={false}
        />

        {/* 3. Dynamic Animated Flame Glow on the 'A' */}
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-flame-flicker"
          style={{
            left: '50%',
            top: '32.2%',
            width: '18%',
            height: '24%',
          }}
        >
          {/* Inner core flame radiance */}
          <div className="w-full h-full rounded-full bg-gradient-to-t from-red-600/40 via-amber-400/60 to-yellow-200/70 blur-md" />
        </div>

        {/* 4. Procedural Electric Lightning Canvas Overlay */}
        <LightningCanvas className="z-20" />
      </div>
    </div>
  );
};
