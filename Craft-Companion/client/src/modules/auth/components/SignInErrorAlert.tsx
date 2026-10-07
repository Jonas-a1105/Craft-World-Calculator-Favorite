import React from 'react';
import { DangerTriangleBoldDuotone } from 'solar-icon-set';

interface SignInErrorAlertProps {
  message?: string;
}

export const SignInErrorAlert: React.FC<SignInErrorAlertProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="flex items-center justify-center gap-2 text-xs text-center bg-rose-950/40 border-none rounded-xl p-2.5 text-rose-300 leading-relaxed">
      <DangerTriangleBoldDuotone className="w-4 h-4 text-rose-400 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

