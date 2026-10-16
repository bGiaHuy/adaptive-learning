"use client";

import React from "react";
import clsx from "clsx";
import { useApp } from "@/lib/store";

export type MascotMood =
  | "idle"
  | "hello"
  | "thinking"
  | "explaining"
  | "encouraging"
  | "celebrate"
  | "listening"
  | "goodbye";

export type MascotSize =
  | "avatar"
  | "inline"
  | "summary"
  | "session-summary"
  | "hero"
  | "sm"
  | "md"
  | "lg"
  | "xl";

export interface MascotProps {
  mood?: MascotMood;
  size?: MascotSize;
  className?: string;
  speechText?: string;
  staticFallback?: boolean;
}

interface SizeConfig {
  pixelSize: number;
  containerClass: string;
  imageClass: string;
}

const SIZE_MAP: Record<MascotSize, SizeConfig> = {
  avatar: {
    pixelSize: 44,
    containerClass: "w-11 h-11 shrink-0",
    imageClass: "w-11 h-11 max-w-[44px] max-h-[44px]",
  },
  inline: {
    pixelSize: 96,
    containerClass: "w-24 h-24 shrink-0",
    imageClass: "w-24 h-24 max-w-[96px] max-h-[96px]",
  },
  summary: {
    pixelSize: 180,
    containerClass: "w-44 h-44 md:w-[190px] md:h-[190px] shrink-0",
    imageClass: "w-44 h-44 md:w-[190px] md:h-[190px] max-w-[190px] max-h-[190px]",
  },
  "session-summary": {
    pixelSize: 180,
    containerClass: "w-44 h-44 md:w-[190px] md:h-[190px] shrink-0",
    imageClass: "w-44 h-44 md:w-[190px] md:h-[190px] max-w-[190px] max-h-[190px]",
  },
  hero: {
    pixelSize: 240,
    containerClass: "w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 shrink-0",
    imageClass: "w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 max-w-[240px] max-h-[240px]",
  },
  // Backwards compatibility mappings
  sm: {
    pixelSize: 48,
    containerClass: "w-12 h-12 shrink-0",
    imageClass: "w-12 h-12 max-w-[48px] max-h-[48px]",
  },
  md: {
    pixelSize: 96,
    containerClass: "w-24 h-24 md:w-28 md:h-28 shrink-0",
    imageClass: "w-24 h-24 md:w-28 md:h-28 max-w-[112px] max-h-[112px]",
  },
  lg: {
    pixelSize: 180,
    containerClass: "w-40 h-40 md:w-48 md:h-48 shrink-0",
    imageClass: "w-40 h-40 md:w-48 md:h-48 max-w-[192px] max-h-[192px]",
  },
  xl: {
    pixelSize: 240,
    containerClass: "w-52 h-52 md:w-60 md:h-60 shrink-0",
    imageClass: "w-52 h-52 md:w-60 md:h-60 max-w-[240px] max-h-[240px]",
  },
};

export function Mascot({
  mood = "idle",
  size = "md",
  className,
  speechText,
  staticFallback = false,
}: MascotProps) {
  const { reducedMotion } = useApp();
  const config = SIZE_MAP[size] || SIZE_MAP.md;

  const svgSrc =
    reducedMotion || staticFallback
      ? "/assets/mascot/frog.svg"
      : `/motion/svg/${mood}.svg`;

  return (
    <div
      className={clsx(
        "relative flex flex-col items-center justify-center shrink-0",
        config.containerClass,
        className
      )}
      style={{
        maxWidth: "100%",
        aspectRatio: "1 / 1",
      }}
    >
      {speechText && (
        <div
          role="status"
          className="relative mb-2 max-w-xs rounded-2xl bg-white px-3.5 py-2 text-center text-xs font-bold text-ink shadow-soft border border-line select-none z-10"
        >
          {speechText}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Mascot Image with guaranteed bounding constraints */}
      <img
        src={svgSrc}
        alt={`Adaptive study mascot (${mood})`}
        width={config.pixelSize}
        height={config.pixelSize}
        className={clsx(
          "object-contain select-none transition-transform duration-panel pointer-events-none block",
          config.imageClass
        )}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: config.pixelSize,
          maxHeight: config.pixelSize,
          aspectRatio: "1 / 1",
          objectFit: "contain",
          flexShrink: 0,
        }}
        loading="lazy"
      />
    </div>
  );
}
