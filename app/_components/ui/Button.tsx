import { ButtonHTMLAttributes, ReactNode } from "react"
import clsx from "clsx"
import { cva, type VariantProps } from "class-variance-authority"

const buttonStyles = cva(
  "inline-flex items-center justify-center rounded-md text-sm transition-colors disabled:opacity-50",
  {
    variants: {
      variant: {
        solid: "bg-foreground font-medium text-background",
        outline: "border border-zinc-300",
        ghost: "text-zinc-300 hover:text-zinc-400",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & {
    icon?: ReactNode
    hitSlop?: number
  }

export function Button({
  variant,
  size,
  icon,
  hitSlop,
  className,
  children,
  type = "button",
  style,
  ...props
}: ButtonProps) {
  const hitSlopValue = `${hitSlop}px`

  return (
    <button
      type={type}
      className={buttonStyles({
        variant,
        size,
        className: clsx(!!hitSlop && "relative", className),
      })}
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
          "inline-flex items-center justify-center gap-1",
          !!hitSlop ? "relative" : undefined,
        )}
      >
        {icon}
        {children}
      </span>
    </button>
  )
}
