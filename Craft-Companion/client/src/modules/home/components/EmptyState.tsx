import React from 'react';

export interface EmptyStateProps {
  children: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ children }) => {
  return <p className="text-sm text-slate-400 py-2 font-main">{children}</p>;
};
