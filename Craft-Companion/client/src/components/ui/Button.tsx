import React from 'react';

export type ButtonVariant = 'primary' | 'flat' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20 active:scale-[0.98]',
  flat:
    'bg-white hover:bg-slate-100 text-slate-950 font-bold active:scale-[0.98]',
  secondary:
    'bg-[#202024] hover:bg-[#29292f] text-slate-200 active:scale-[0.98]',
  danger:
    'bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/20 active:scale-[0.98]',
  outline:
    'bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-white/10 text-slate-300 hover:text-white',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'text-xs px-3 py-1 rounded-full gap-1.5',
  sm: 'text-xs px-4 py-2 rounded-full gap-2 uppercase tracking-wide',
  md: 'text-sm px-5 py-2.5 rounded-full gap-2 uppercase tracking-wide',
  lg: 'text-base px-6 py-3.5 rounded-full gap-2.5 uppercase tracking-wide',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const base =
      'inline-flex items-center justify-center font-main transition-all duration-150 select-none cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';
    const variantCls = variantStyles[variant];
    const sizeCls = sizeStyles[size];
    const widthCls = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${base} ${variantCls} ${sizeCls} ${widthCls} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 mr-1 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
