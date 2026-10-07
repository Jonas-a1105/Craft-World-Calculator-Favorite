import React from 'react';
import { CheckCircleBold, CloseCircleLinear } from 'solar-icon-set';

export interface SettingsStatusToastProps {
  status: string;
  onClose: () => void;
}

export const SettingsStatusToast: React.FC<SettingsStatusToastProps> = ({
  status,
  onClose,
}) => {
  if (!status) return null;

  return (
    <div className="sticky top-20 z-50 flex items-center justify-between gap-2 px-4 py-2.5 rounded-full bg-[#202026]/95 text-emerald-300 text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2">
        <CheckCircleBold className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{status}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-white transition-colors p-1 rounded-full cursor-pointer flex items-center justify-center shrink-0 border-none"
        aria-label="Close notification"
      >
        <CloseCircleLinear className="w-4 h-4 shrink-0" />
      </button>
    </div>
  );
};
