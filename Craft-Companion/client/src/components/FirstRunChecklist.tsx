import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleBold, CloseCircleLinear } from 'solar-icon-set';
import { useTranslation } from '../utils/i18n';
import { useNotificationPrefs, setNotificationPref } from '../services/notificationPrefs';
import { hasVisitedModule } from '../services/visitTracker';

const DISMISS_KEY = 'craftworld.onboarding.dismissed';

interface ChecklistStep {
  id: string;
  done: boolean;
  titleEs: string;
  titleEn: string;
  descEs: string;
  descEn: string;
  action?: { to?: string; onPress?: () => void; labelEs: string; labelEn: string };
}

/**
 * Checklist de primera sesión (LP2): guía no bloqueante de 3 pasos para llegar
 * rápido al primer valor real. Se descarta con un click y nunca vuelve a
 * aparecer; suele tardar menos de 3 segundos en leerse.
 */
export const FirstRunChecklist: React.FC = () => {
  const { language } = useTranslation();
  const prefs = useNotificationPrefs();
  const isEs = language === 'es';

  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const steps: ChecklistStep[] = useMemo(
    () => [
      {
        id: 'profitability',
        done: hasVisitedModule('/profitability'),
        titleEs: 'Explora Rentabilidad',
        titleEn: 'Explore Profitability',
        descEs: 'Tu primer simulador: ajusta nivel, maestría y boost de una fábrica.',
        descEn: 'Your first simulator: tune a factory level, mastery and boost.',
        action: { to: '/profitability', labelEs: 'Abrir', labelEn: 'Open' },
      },
      {
        id: 'notifications',
        done: prefs.master,
        titleEs: 'Activa los avisos de ciclo',
        titleEn: 'Enable cycle alerts',
        descEs: 'Te avisamos cuando una producción termina — sin mirar el reloj.',
        descEn: 'We tell you when production finishes — no clock watching.',
        action: {
          onPress: () => setNotificationPref('master', true),
          labelEs: 'Activar',
          labelEn: 'Enable',
        },
      },
      {
        id: 'base-cost',
        done: hasVisitedModule('/base-cost'),
        titleEs: 'Descompón un coste',
        titleEn: 'Break down a cost',
        descEs: 'Mira de qué está hecho cada recurso hasta las 5 materias elementales.',
        descEn: 'See what every resource is made of down to the 5 elemental materials.',
        action: { to: '/base-cost', labelEs: 'Abrir', labelEn: 'Open' },
      },
    ],
    [prefs.master, isEs],
  );

  // Solo reaparece antes de la primera sesión real útil o si el usuario cerró.
  if (dismissed) return null;
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {}
    setDismissed(true);
  };

  return (
    <div className="w-full rounded-[28px] bg-oled-card p-5 sm:p-6 shadow-oled-card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-white tracking-tight">
            {isEs ? 'Primeros pasos' : 'Getting started'}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {isEs
              ? `${doneCount} de ${steps.length} — te lleva menos de 2 minutos.`
              : `${doneCount} of ${steps.length} — takes under 2 minutes.`}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={isEs ? 'Ocultar guía de inicio' : 'Dismiss getting started'}
          className="w-8 h-8 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors border-0 outline-none cursor-pointer shrink-0"
        >
          <CloseCircleLinear size={18} className="w-5 h-5" />
        </button>
      </div>

      {/* Progress */}
      <div className="h-1.5 rounded-full bg-oled-pill overflow-hidden" role="progressbar" aria-valuenow={doneCount} aria-valuemax={steps.length} aria-label={isEs ? 'Progreso de inicio' : 'Getting started progress'}>
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl transition-colors ${
              step.done ? 'bg-emerald-500/8' : 'bg-oled-cardInner'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  step.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-oled-pill text-zinc-400'
                }`}
                aria-hidden="true"
              >
                {step.done ? <CheckCircleBold size={14} /> : <span className="text-[11px] font-mono font-bold">•</span>}
              </span>
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${step.done ? 'text-emerald-300 line-through' : 'text-white'}`}>
                  {isEs ? step.titleEs : step.titleEn}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  {isEs ? step.descEs : step.descEn}
                </p>
              </div>
            </div>

            {!step.done && step.action && (
              step.action.to ? (
                <Link
                  to={step.action.to}
                  className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[11px] font-extrabold transition-colors shrink-0"
                >
                  {isEs ? step.action.labelEs : step.action.labelEn}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={step.action.onPress}
                  className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[11px] font-extrabold transition-colors border-0 outline-none cursor-pointer shrink-0"
                >
                  {isEs ? step.action.labelEs : step.action.labelEn}
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FirstRunChecklist;
