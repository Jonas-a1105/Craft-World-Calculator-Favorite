import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  hoverable = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`bg-[#1c1c20] rounded-3xl p-5 md:p-6 transition-all duration-200 relative overflow-hidden shadow-xl border-none ${
        hoverable ? 'hover:bg-[#232328] hover:shadow-2xl' : ''
      } ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="min-w-0">
            {title && (
              <h3 className="font-title text-xs md:text-sm text-white tracking-wide uppercase truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 font-main mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
