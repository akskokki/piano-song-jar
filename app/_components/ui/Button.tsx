import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'icon';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  hitSlop?: number;
};

const baseClasses =
  'inline-flex items-center justify-center rounded-md text-sm transition-colors disabled:opacity-50';

const variantClasses: Record<ButtonVariant, string> = {
  solid: 'bg-foreground font-medium text-background',
  outline: 'border border-zinc-300',
  ghost: 'text-zinc-500 hover:text-zinc-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3',
  md: 'h-10 px-4',
  icon: 'h-10 w-10 p-0',
};

export function Button({
  variant = 'outline',
  size = 'md',
  icon,
  hitSlop,
  className,
  children,
  type = 'button',
  style,
  ...props
}: ButtonProps) {
  const hitSlopValue = `${hitSlop}px`;

  return (
    <button
      type={type}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        !!hitSlop ? 'relative' : undefined,
        className,
      )}
      style={style}
      {...props}
    >
      {!!hitSlop && hitSlopValue && (
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            padding: hitSlopValue,
            margin: `calc(${hitSlopValue} * -1)`,
          }}
        />
      )}
      <span
        className={clsx(
          'inline-flex items-center justify-center gap-1',
          !!hitSlop ? 'relative' : undefined,
        )}
      >
        {icon}
        {children}
      </span>
    </button>
  );
}
