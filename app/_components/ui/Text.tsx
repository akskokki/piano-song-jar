import { HTMLAttributes } from "react"
import clsx from "clsx"
import { cva, type VariantProps } from "class-variance-authority"

const textStyles = cva("text-zinc-100 wrap-break-word", {
  variants: {
    variant: {
      display: "text-4xl font-semibold tracking-tight",
      h1: "text-3xl font-semibold tracking-tight",
      h2: "text-2xl font-semibold tracking-tight",
      h3: "text-xl font-semibold",
      body: "text-base",
      bodySm: "text-sm",
      label: "text-sm font-medium",
      caption: "text-xs",
    },
    tone: {
      default: "text-zinc-100",
      muted: "text-zinc-500",
      subtle: "text-zinc-600",
      danger: "text-red-400",
      success: "text-green-400",
    },
  },
  defaultVariants: {
    variant: "body",
    tone: "default",
  },
})

type TextTag = "p" | "span" | "strong" | "em" | "small" | "h1" | "h2" | "h3"

type TextProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof textStyles> & {
    as?: TextTag
  }

export function Text({
  as = "p",
  variant,
  tone,
  className,
  ...props
}: TextProps) {
  const Component = as

  return (
    <Component
      className={textStyles({ variant, tone, className: clsx(className) })}
      {...props}
    />
  )
}
