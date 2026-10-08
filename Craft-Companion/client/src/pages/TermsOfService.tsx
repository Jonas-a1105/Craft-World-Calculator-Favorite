import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const TermsOfService: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  useDocumentTitle(isEs ? 'Términos y Condiciones' : 'Terms of Service');

  return (
    <div className="min-h-screen bg-[#141415] text-zinc-300 font-main py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-400/20 selection:text-amber-300">
      <div className="max-w-4xl mx-auto route-view">
        {/* Top Navigation */}
        <div className="bg-[#1c1c20] rounded-2xl px-5 py-3.5 flex items-center justify-between mb-8 shadow-md border-0">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>{isEs ? 'Volver al Inicio' : 'Back to Home'}</span>
          </Link>
          <span className="text-xs font-mono text-zinc-400">
            {isEs ? 'Última actualización: Octubre 2026' : 'Last updated: October 2026'}
          </span>
        </div>

        {/* Header */}
        <div className="mb-10 text-left">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#1c1c20] text-amber-400 text-xs font-mono font-semibold uppercase mb-4 border-0">
            {isEs ? 'Legal & Cumplimiento' : 'Legal & Compliance'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isEs ? 'Términos y Condiciones de Uso' : 'Terms of Service'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-400">
            {isEs
              ? 'Por favor, lee estos términos antes de utilizar las herramientas y servicios de Craft Companion.'
              : 'Please read these terms before using the tools and services provided by Craft Companion.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-zinc-300 text-left">
          <section className="bg-[#1c1c20] rounded-2xl p-6 sm:p-8 border-0 shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400 font-mono text-base">01.</span>
              <span>{isEs ? 'Naturaleza del Servicio y Aviso de Descargo' : 'Nature of Service and Disclaimer'}</span>
            </h2>
            <p className="mb-3">
              {isEs
                ? 'Craft Companion es una herramienta comunitaria independiente y no oficial desarrollada por y para jugadores de CraftWorld. No está afiliada, respaldada ni patrocinada oficialmente por los creadores o desarrolladores del juego CraftWorld.'
                : 'Craft Companion is an independent, unofficial community tool created by and for players of CraftWorld. It is not affiliated with, endorsed by, or sponsored by the developers of CraftWorld.'}
            </p>
            <p className="text-sm text-zinc-400">
              {isEs
                ? 'Todas las marcas comerciales, nombres de objetos, imágenes de fábricas e iconos del juego son propiedad intelectual exclusiva de sus respectivos creadores.'
                : 'All trademarks, game item names, factory art, and icons are the exclusive intellectual property of their respective owners.'}
            </p>
          </section>

          <section className="bg-[#1c1c20] rounded-2xl p-6 sm:p-8 border-0 shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400 font-mono text-base">02.</span>
              <span>{isEs ? 'Estimaciones Económicas y Exención Financiera' : 'Economic Estimates & No Financial Advice'}</span>
            </h2>
            <p className="mb-3 text-sm text-zinc-400">
              {isEs
                ? 'Los cálculos de rentabilidad, retornos de inversión (ROI), valoraciones de inventario y estimaciones de mercado proporcionados por Craft Companion son simulaciones informativas basadas en datos de precios dinámicos del juego. NO constituyen asesoramiento financiero, de inversión ni garantía de rendimientos económicos reales.'
                : 'Profitability calculations, ROI estimates, inventory valuations, and market data provided by Craft Companion are purely informative simulations based on game metrics. They do NOT constitute financial or investment advice.'}
            </p>
            <p className="text-sm text-zinc-400">
              {isEs
                ? 'El usuario asume la total responsabilidad de las decisiones de producción, compra o venta que ejecute dentro del juego.'
                : 'Users assume full responsibility for in-game production, buying, and selling decisions made.'}
            </p>
          </section>

          <section className="bg-[#1c1c20] rounded-2xl p-6 sm:p-8 border-0 shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400 font-mono text-base">03.</span>
              <span>{isEs ? 'Uso Aceptable del Servicio' : 'Acceptable Use'}</span>
            </h2>
            <p className="mb-3 text-sm text-zinc-400">
              {isEs
                ? 'Al utilizar la plataforma, aceptas no intentar vulnerar la seguridad del servicio, no realizar ataques de denegación de servicio (DDoS), ni someter las APIs a cargas maliciosas que perjudiquen la experiencia de otros jugadores.'
                : 'By using this service, you agree not to exploit security vulnerabilities, perform denial-of-service attacks, or abuse backend APIs to the detriment of other users.'}
            </p>
          </section>

          <section className="bg-[#1c1c20] rounded-2xl p-6 sm:p-8 border-0 shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400 font-mono text-base">04.</span>
              <span>{isEs ? 'Modificaciones y Contacto' : 'Modifications & Contact'}</span>
            </h2>
            <p className="text-sm text-zinc-400 mb-3">
              {isEs
                ? 'Nos reservamos el derecho de actualizar o mejorar las herramientas, fórmulas y estos términos para adaptarnos a las actualizaciones y parches de balance del juego.'
                : 'We reserve the right to update tools, formulas, and these terms to reflect game balance updates and balance patches.'}
            </p>
            <p className="text-xs text-amber-400/80 font-mono">
              {isEs
                ? 'Soporte y contacto: support@craftcompanion.app'
                : 'Support and contact: support@craftcompanion.app'}
            </p>
          </section>
        </div>

        {/* Footer Link */}
        <div className="mt-12 text-center text-xs text-zinc-500">
          Craft Companion © {new Date().getFullYear()} —{' '}
          <Link to="/privacy" className="text-zinc-400 hover:text-amber-400 underline underline-offset-4 transition-colors">
            {isEs ? 'Ver Política de Privacidad' : 'View Privacy Policy'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
