"use client";

import React from "react";
import clsx from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "pill" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

    const variantStyles = {
      primary:
        "btn-tactile bg-primary text-white shadow-tactile hover:bg-[#2F6DE0] active:translate-y-[3px]",
      secondary:
        "btn-tactile-secondary bg-[#EAF2FF] text-primary-dark shadow-tactile-secondary hover:bg-[#DCE8FC] active:translate-y-[3px]",
      ghost:
        "bg-transparent text-primary-dark hover:bg-primary-light active:bg-[#DCE8FC] shadow-none",
      danger:
        "bg-error text-white shadow-[0_4px_0_#8B2535] hover:bg-[#A32E3E] active:translate-y-[3px]",
      pill:
        "rounded-pill bg-[#EFF6FF] text-primary border border-primary/20 hover:bg-primary-light active:scale-95 shadow-none transition-all",
      outline:
        "bg-white border-2 border-line text-ink hover:border-primary hover:text-primary active:scale-95 shadow-none transition-all",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 rounded-pill",
      md: "text-sm md:text-base px-5 py-2.5 rounded-pill",
      lg: "text-base md:text-lg px-7 py-3.5 rounded-pill",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
