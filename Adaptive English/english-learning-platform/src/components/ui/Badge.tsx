import React from "react";
import clsx from "clsx";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "info" | "success" | "warning" | "error" | "neutral";
}

export function Badge({ className, variant = "primary", children, ...props }: BadgeProps) {
  const variantStyles: Record<string, string> = {
    primary: "bg-[#EAF2FF] text-primary-dark border border-primary/20",
    info: "bg-[#EAF2FF] text-primary-dark border border-primary/20",
    success: "bg-success-soft text-success border border-success/20",
    warning: "bg-warning-soft text-warning border border-warning/20",
    error: "bg-error-soft text-error border border-error/20",
    neutral: "bg-line/50 text-ink-muted border border-line",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-bold uppercase tracking-wider select-none",
        variantStyles[variant] || variantStyles.primary,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
