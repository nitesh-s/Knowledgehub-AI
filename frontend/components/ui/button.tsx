import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = { default: "bg-primary text-primary-foreground hover:opacity-90", destructive: "bg-destructive text-white hover:opacity-90", outline: "border border-border hover:bg-accent", ghost: "hover:bg-accent", link: "underline-offset-4 hover:underline" } as const;
const sizes = { default: "h-10 px-4 py-2", sm: "h-9 px-3", lg: "h-11 px-8", icon: "h-10 w-10" } as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: keyof typeof variants; size?: keyof typeof sizes; }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button ref={ref} className={cn("inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer", variants[variant], sizes[size], className)} {...props} />
  )
);
Button.displayName = "Button";
