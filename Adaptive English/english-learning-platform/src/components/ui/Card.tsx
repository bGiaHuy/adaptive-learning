import React from "react";
import clsx from "clsx";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "flat" | "elevated" | "accent";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  const variantStyles = {
    default: "bg-surface border border-line rounded-md p-5 md:p-6 shadow-sm",
    flat: "bg-surface border border-line/80 rounded-md p-5 md:p-6",
    elevated: "bg-surface border border-line rounded-md p-5 md:p-6 shadow-soft",
    accent: "bg-[#F0F5FF] border border-primary/20 rounded-md p-5 md:p-6",
  };

  return (
    <div className={clsx(variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "error" | "neutral";
}

export function Badge({ className, variant = "primary", children, ...props }: BadgeProps) {
  const variantStyles = {
    primary: "bg-[#EAF2FF] text-primary-dark border border-primary/20",
    success: "bg-success-soft text-success border border-success/20",
    warning: "bg-warning-soft text-warning border border-warning/20",
    error: "bg-error-soft text-error border border-error/20",
    neutral: "bg-line/50 text-ink-muted border border-line",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-bold uppercase tracking-wider select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
