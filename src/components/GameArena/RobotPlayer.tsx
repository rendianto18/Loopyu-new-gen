import React from "react";
import { Direction } from "../../types";

interface RobotPlayerProps {
  dir: Direction;
  isSuccess?: boolean;
  isFailed?: boolean;
  className?: string;
  size?: number; // size in px, defaults to 52
}

export const RobotPlayer: React.FC<RobotPlayerProps> = ({
  dir,
  isSuccess = false,
  isFailed = false,
  className = "",
  size = 52,
}) => {
  // Base sprite is facing RIGHT (East)
  // When dir is "right", rotate 0deg -> Head points RIGHT, Thrusters point LEFT
  // When dir is "down", rotate 90deg -> Head points DOWN, Thrusters point UP
  // When dir is "left", rotate 180deg -> Head points LEFT, Thrusters point RIGHT
  // When dir is "up", rotate 270deg (or -90deg) -> Head points UP, Thrusters point DOWN
  const getRotationAngle = (direction: Direction): number => {
    switch (direction) {
      case "right":
        return 0;
      case "down":
        return 90;
      case "left":
        return 180;
      case "up":
        return 270;
    }
  };

  const rotation = getRotationAngle(dir);

  return (
    <div
      className={`relative select-none transition-transform duration-300 ease-out flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotation}deg)`,
      }}
      title={`Robot LOOPYU (Arah: ${dir})`}
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="overflow-visible drop-shadow-md"
      >
        <defs>
          {/* Flame Gradient */}
          <linearGradient id="thrusterFlame" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
          </linearGradient>

          {/* Screen Gradient */}
          <linearGradient id="robotScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Chip Body Gradient */}
          <linearGradient id="chipBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* 1. METALLIC CHIP CONNECTOR PINS (Top & Bottom) */}
        {/* Top Pins */}
        <g fill="#94a3b8" stroke="#475569" strokeWidth="0.8">
          <rect x="20" y="8" width="3" height="7" rx="0.8" />
          <rect x="26" y="8" width="3" height="7" rx="0.8" />
          <rect x="32" y="8" width="3" height="7" rx="0.8" />
          <rect x="38" y="8" width="3" height="7" rx="0.8" />
          <rect x="44" y="8" width="3" height="7" rx="0.8" />
        </g>

        {/* Bottom Pins */}
        <g fill="#94a3b8" stroke="#475569" strokeWidth="0.8">
          <rect x="20" y="49" width="3" height="7" rx="0.8" />
          <rect x="26" y="49" width="3" height="7" rx="0.8" />
          <rect x="32" y="49" width="3" height="7" rx="0.8" />
          <rect x="38" y="49" width="3" height="7" rx="0.8" />
          <rect x="44" y="49" width="3" height="7" rx="0.8" />
        </g>

        {/* 2. REAR THRUSTERS & FLAMES (Left side) */}
        <g className="animate-pulse">
          {/* Upper Thruster Flame */}
          <path
            d="M 14 24 Q 4 26.5 4 26.5 Q 4 26.5 14 29 Z"
            fill="url(#thrusterFlame)"
          />
          <path d="M 14 25.5 Q 8 26.5 8 26.5 Q 8 26.5 14 27.5 Z" fill="#ffffff" />

          {/* Lower Thruster Flame */}
          <path
            d="M 14 35 Q 4 37.5 4 37.5 Q 4 37.5 14 40 Z"
            fill="url(#thrusterFlame)"
          />
          <path d="M 14 36.5 Q 8 37.5 8 37.5 Q 8 37.5 14 38.5 Z" fill="#ffffff" />
        </g>

        {/* Thruster Nozzle Mounts */}
        <rect x="12" y="23" width="4" height="6.5" rx="1" fill="#334155" stroke="#0f172a" strokeWidth="0.8" />
        <rect x="12" y="34.5" width="4" height="6.5" rx="1" fill="#334155" stroke="#0f172a" strokeWidth="0.8" />

        {/* 3. MAIN MICROCHIP BODY */}
        <rect
          x="15"
          y="14"
          width="34"
          height="36"
          rx="6"
          fill="url(#chipBodyGrad)"
          stroke="#475569"
          strokeWidth="1.2"
        />

        {/* 4. BLUE DISPLAY SCREEN */}
        <rect
          x="20"
          y="19"
          width="23"
          height="26"
          rx="4"
          fill="url(#robotScreenGrad)"
          stroke="#0284c7"
          strokeWidth="1"
        />

        {/* Hazard warning stripes on left edge of screen */}
        <g stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round">
          <line x1="21" y1="23" x2="23" y2="25" />
          <line x1="21" y1="28" x2="23" y2="30" />
          <line x1="21" y1="33" x2="23" y2="35" />
          <line x1="21" y1="38" x2="23" y2="40" />
        </g>

        {/* 5. ROBOT EYES / VISOR LEDS */}
        {isSuccess ? (
          // Happy Eyes "^ ^"
          <g stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" fill="none">
            <path d="M 26 33 L 28 29 L 30 33" />
            <path d="M 34 33 L 36 29 L 38 33" />
          </g>
        ) : isFailed ? (
          // Error Eyes "x x"
          <g stroke="#f87171" strokeWidth="2" strokeLinecap="round">
            <line x1="26" y1="29" x2="30" y2="33" />
            <line x1="30" y1="29" x2="26" y2="33" />
            <line x1="34" y1="29" x2="38" y2="33" />
            <line x1="38" y1="29" x2="34" y2="33" />
          </g>
        ) : (
          // Bright Cyan Glowing LED Eyes
          <g>
            <circle cx="28" cy="32" r="3.2" fill="#22d3ee" filter="drop-shadow(0 0 2px #38bdf8)" />
            <circle cx="29" cy="31" r="1.1" fill="#ffffff" />
            <circle cx="36" cy="32" r="3.2" fill="#22d3ee" filter="drop-shadow(0 0 2px #38bdf8)" />
            <circle cx="37" cy="31" r="1.1" fill="#ffffff" />
          </g>
        )}

        {/* 6. FORWARD DIRECTIONAL ARROW (Orange Triangle pointing Right) */}
        <g filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))">
          {/* Orange arrow on the right */}
          <path
            d="M 45 26 L 56 32 L 45 38 L 45 34 L 43 34 L 43 30 L 45 30 Z"
            fill="#f97316"
            stroke="#fef08a"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Inner accent line */}
          <path
            d="M 46 29 L 52 32 L 46 35 Z"
            fill="#fbbf24"
          />
        </g>

        {/* Right Corner Accent Sensor Nodes */}
        <circle cx="44" cy="21" r="1.5" fill="#f59e0b" />
        <circle cx="44" cy="43" r="1.5" fill="#f59e0b" />
      </svg>
    </div>
  );
};
