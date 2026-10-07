import React from 'react';

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
    <div className="sticky top-20 z-50 flex items-center justify-between gap-2 px-4 py-3 rounded-full bg-[#202026]/95 text-emerald-300 text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2">
        <span className="text-emerald-400 font-bold">✓</span>
        <span>{status}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-white text-xs font-bold px-1 cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
};
