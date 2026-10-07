interface LandingHeroProps {
  language: string;
}

export const LandingHero = ({ language }: LandingHeroProps) => {
  return (
    <div className="space-y-2">
      <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-[18px] flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <span className="text-white text-3xl font-black font-mono">C</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-sans mt-3">
        Craft World{' '}
        <span className="bg-gradient-to-r from-emerald-400 to-teal-450 bg-clip-text text-transparent">
          Companion
        </span>
      </h1>
      <p className="text-slate-300 text-sm md:text-base leading-relaxed">
        {language === 'es'
          ? 'Tus fábricas, tu inventario y el cálculo del valor de tus recursos en un solo lugar y en tiempo real.'
          : 'Your factories, your inventory, and real-time calculations of resource values all in one place.'}
      </p>
    </div>
  );
};
