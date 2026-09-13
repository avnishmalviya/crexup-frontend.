import { cn } from "@/lib/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
          size === "md" ? "h-10 px-4 text-sm" : "h-8 px-3 text-xs",
          variant === "primary" && "bg-coral text-white hover:bg-[#e94d30]",
          variant === "secondary" && "bg-ink text-white hover:bg-ink-soft",
          variant === "ghost" && "bg-transparent text-ink hover:bg-white/5 border border-line",
          variant === "danger" && "bg-red text-white hover:opacity-90",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";