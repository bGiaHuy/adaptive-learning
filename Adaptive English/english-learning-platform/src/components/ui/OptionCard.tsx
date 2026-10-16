"use client";

import React from "react";
import clsx from "clsx";
import { Check, X } from "lucide-react";

export interface OptionCardProps {
  id: string;
  label: string;
  prefix?: string;
  selected?: boolean;
  status?: "default" | "correct" | "wrong";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function OptionCard({
  label,
  prefix,
  selected = false,
  status = "default",
  disabled = false,
  onClick,
  className,
}: OptionCardProps) {
  const isCorrect = status === "correct";
  const isWrong = status === "wrong";

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className={clsx(
        "w-full flex items-center justify-between text-left p-4 md:p-5 rounded-md border-2 font-medium text-sm md:text-base select-none transition-all duration-fast cursor-pointer",
        "active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        !selected && !isCorrect && !isWrong && "bg-white border-line text-ink hover:border-primary/50 hover:bg-[#F8FAFF]",
        selected && !isCorrect && !isWrong && "bg-[#EDF4FF] border-primary text-primary-dark font-bold shadow-sm",
        isCorrect && "bg-success-soft border-success text-[#185932] font-bold",
        isWrong && "bg-error-soft border-error text-[#8B2535] font-bold",
        disabled && "cursor-not-allowed opacity-90",
        className
      )}
    >
      <div className="flex items-center gap-3.5 pr-2 pointer-events-none">
        {prefix && (
          <span
            className={clsx(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
              selected ? "bg-primary text-white" : "bg-line/60 text-ink-muted",
              isCorrect && "!bg-success text-white",
              isWrong && "!bg-error text-white"
            )}
          >
            {prefix}
          </span>
        )}
        <span className="leading-snug">{label}</span>
      </div>

      <div className="shrink-0 pl-2 pointer-events-none">
        {selected && !isCorrect && !isWrong && (
          <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
            <Check className="w-4 h-4 stroke-[3]" />
            <span className="sr-only">Đã chọn</span>
          </div>
        )}
        {isCorrect && (
          <div className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center">
            <Check className="w-4 h-4 stroke-[3]" />
            <span className="sr-only">Đáp án đúng</span>
          </div>
        )}
        {isWrong && (
          <div className="w-6 h-6 rounded-full bg-error text-white flex items-center justify-center">
            <X className="w-4 h-4 stroke-[3]" />
            <span className="sr-only">Chưa chính xác</span>
          </div>
        )}
      </div>
    </button>
  );
}
