import { useTranslation } from '../../../utils/i18n';
import { LandingHero } from './LandingHero';
import { LandingActions } from './LandingActions';
import { LandingFooter } from './LandingFooter';

export const LandingDashboard = () => {
  const { language } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative z-10">
      <div className="bg-[#1c1c20] rounded-3xl border-none shadow-2xl p-8 md:p-10 max-w-lg w-full text-center space-y-6 transform hover:scale-[1.01] transition-transform duration-300">
        <LandingHero language={language} />

        <div className="h-px bg-white/5 my-2" />

        <LandingActions language={language} />

        <LandingFooter />
      </div>
    </div>
  );
};
