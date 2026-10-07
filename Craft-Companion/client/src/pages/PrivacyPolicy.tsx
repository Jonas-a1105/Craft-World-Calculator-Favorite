import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const PrivacyPolicy: React.FC = () => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  useDocumentTitle(isEs ? 'Política de Privacidad' : 'Privacy Policy');

  return (
    <div className="min-h-screen bg-[#141415] text-zinc-300 font-main py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-400/20 selection:text-amber-300">
      <div className="max-w-4xl mx-auto">
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
            {isEs ? 'Política de Privacidad' : 'Privacy Policy'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-400">
            {isEs
              ? 'Transparencia total sobre cómo Craft Companion protege tu información y gestiona tus datos de juego.'
              : 'Complete transparency regarding how Craft Companion protects your information and manages your game data.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-zinc-300 text-left">
          <section className="bg-[#1c1c20] rounded-2xl p-6 sm:p-8 border-0 shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400 font-mono text-base">01.</span>
              <span>{isEs ? 'Información que recopilamos' : 'Information We Collect'}</span>
            </h2>
            <p className="mb-3">
              {isEs
                ? 'Craft Companion está diseñado bajo el principio de minimización de datos. Solo recopilamos los datos estrictamente necesarios para el funcionamiento de las herramientas de cálculo y monitoreo:'
                : 'Craft Companion is designed with data minimization principles. We only collect data strictly necessary for calculation and monitoring features:'}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-sm">
              <li>
                <strong className="text-zinc-200">{isEs ? 'Datos de sesión OAuth:' : 'OAuth Session Data:'}</strong>{' '}
                {isEs
                  ? 'Cuando autorizas tu cuenta con CraftWorld, recibimos un token de sesión temporal y tu identificador público para sincronizar tus parcelas y niveles de fábrica.'
                  : 'When authorizing your account with CraftWorld, we receive a temporary session token and public identifier to sync your land plots and factory levels.'}
              </li>
              <li>
                <strong className="text-zinc-200">{isEs ? 'Almacenamiento Local (Local Storage):' : 'Local Storage:'}</strong>{' '}
                {isEs
                  ? 'Tus preferencias de tema (oscuro/claro), personalización de colores, boosts simulados y configuraciones personalizadas se almacenan exclusivamente en tu navegador.'
                  : 'Theme settings, color presets, simulated boosts, and custom configurations are stored locally inside your browser.'}
              </li>
              <li>
                <strong className="text-zinc-200">{isEs ? 'Modo Invitado:' : 'Guest Mode:'}</strong>{' '}
                {isEs
                  ? 'Si utilizas el modo invitado, no se almacena ningún dato personal en nuestros servidores.'
                  : 'If using guest mode, no personal data is stored on our servers.'}
              </li>
            </ul>
          </section>

          <section className="bg-[#1c1c20] rounded-2xl p-6 sm:p-8 border-0 shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400 font-mono text-base">02.</span>
              <span>{isEs ? 'Uso de Cookies y Tecnologías Similares' : 'Cookies and Storage Technologies'}</span>
            </h2>
            <p className="mb-3">
              {isEs
                ? 'Utilizamos cookies técnicas estrictamente necesarias para mantener tu sesión segura. No utilizamos cookies de rastreo invasivo ni vendemos tu información a redes publicitarias de terceros.'
                : 'We use strictly necessary technical cookies to keep your session secure. We do not use intrusive cross-site tracking cookies nor sell your data to third-party ad networks.'}
            </p>
            <p className="text-sm text-zinc-400">
              {isEs
                ? 'Puedes consultar y modificar tus preferencias de cookies en cualquier momento mediante el botón flotante en la esquina inferior izquierda de la pantalla.'
                : 'You can review and modify your cookie preferences anytime using the floating button at the bottom-left corner of the screen.'}
            </p>
          </section>

          <section className="bg-[#1c1c20] rounded-2xl p-6 sm:p-8 border-0 shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400 font-mono text-base">03.</span>
              <span>{isEs ? 'Seguridad de tus Credenciales' : 'Security of Your Credentials'}</span>
            </h2>
            <p className="text-sm text-zinc-400">
              {isEs
                ? 'Craft Companion jamás solicita ni almacena tus contraseñas privadas, llaves privadas de billeteras Web3 ni frases de recuperación. Toda autenticación se realiza de manera delegada mediante los protocolos oficiales.'
                : 'Craft Companion never requests or stores your private passwords, Web3 wallet private keys, or seed phrases. All authentication is delegated via official protocols.'}
            </p>
          </section>

          <section className="bg-[#1c1c20] rounded-2xl p-6 sm:p-8 border-0 shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400 font-mono text-base">04.</span>
              <span>{isEs ? 'Derechos del Usuario' : 'User Rights'}</span>
            </h2>
            <p className="text-sm text-zinc-400 mb-3">
              {isEs
                ? 'De acuerdo con las normativas internacionales de protección de datos (como el RGPD), tienes derecho a solicitar la eliminación de cualquier dato de sesión almacenado y revocar el acceso de tu cuenta de CraftWorld en cualquier momento.'
                : 'In accordance with international data regulations (such as GDPR), you have the right to request deletion of stored session data and revoke CraftWorld account access at any time.'}
            </p>
            <p className="text-xs text-amber-400/80 font-mono">
              {isEs
                ? 'Para solicitudes relacionadas con privacidad: support@craftcompanion.app'
                : 'For privacy requests contact: support@craftcompanion.app'}
            </p>
          </section>
        </div>

        {/* Footer Link */}
        <div className="mt-12 text-center text-xs text-zinc-500">
          Craft Companion © {new Date().getFullYear()} —{' '}
          <Link to="/terms" className="text-zinc-400 hover:text-amber-400 underline underline-offset-4 transition-colors">
            {isEs ? 'Ver Términos y Condiciones' : 'View Terms of Service'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
