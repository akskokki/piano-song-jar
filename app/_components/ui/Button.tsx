import { ButtonHTMLAttributes, ReactNode } from "react"
import clsx from "clsx"

type ButtonVariant = "solid" | "outline" | "ghost"
type ButtonSize = "sm" | "md" | "icon"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
}

const baseClasses =
  "inline-flex items-center justify-center rounded-md text-sm transition-colors disabled:opacity-50"

const variantClasses: Record<ButtonVariant, string> = {
  solid: "bg-foreground font-medium text-background",
  outline: "border border-zinc-300",
  ghost: "text-zinc-500 hover:text-zinc-700",
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3",
  md: "h-10 px-4",
  icon: "h-10 w-10 p-0",
}

export function Button({
  variant = "outline",
  size = "md",
  icon,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const hasText = Boolean(children)

  return (
    <button
      type={type}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        icon && hasText ? "gap-1" : undefined,
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
