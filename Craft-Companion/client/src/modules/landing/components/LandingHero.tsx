interface LandingHeroProps {
  language: string;
}

export const LandingHero = ({ language }: LandingHeroProps) => {
  return (
    <div className="space-y-2">
      <div className="mx-auto flex items-center justify-center">
        <img
          src="/assets/logo.png"
          className="h-16 sm:h-20 w-auto object-contain drop-shadow-md"
          alt="Craft World Logo"
        />
      </div>
      <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-sans mt-3">
        Craft World{' '}
        <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
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
