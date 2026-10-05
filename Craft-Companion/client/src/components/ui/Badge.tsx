import React from 'react';

export type BadgeVariant =
  | 'basic'
  | 'crafted'
  | 'processed'
  | 'keys'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  basic: 'bg-emerald-500/15 text-emerald-400',
  crafted: 'bg-sky-500/15 text-sky-400',
  processed: 'bg-sky-500/15 text-sky-400',
  keys: 'bg-indigo-500/15 text-indigo-400',
  success: 'bg-emerald-500/20 text-emerald-400',
  warning: 'bg-amber-500/20 text-amber-400',
  danger: 'bg-red-500/20 text-red-400',
  neutral: 'bg-[#202024] text-slate-300',
  info: 'bg-sky-500/20 text-sky-400',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  className = '',
  children,
  ...props
}) => {
  const sizeCls =
    size === 'sm'
      ? 'text-[11px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider'
      : 'text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider';

  return (
    <span
      className={`inline-flex items-center gap-1 font-main leading-tight border-none ${variantStyles[variant]} ${sizeCls} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
