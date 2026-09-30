import React from "react";

interface BatteryIconProps {
  className?: string;
  isCollected?: boolean;
}

/**
 * Reusable Battery Icon component for grid tiles across all levels (Level 1–8).
 * Enhanced attractive design: glowing energy cells, metallic cap, energy pulse, and glossy reflection.
 */
export const BatteryIcon: React.FC<BatteryIconProps> = ({
  className = "",
  isCollected = false,
}) => {
  if (isCollected) return null;

  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.65)] hover:scale-105 ${className}`}
      title="Baterai Energi"
    >
      <svg
        viewBox="0 0 28 38"
        className="w-full h-full animate-battery-pulse"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic border gradient */}
          <linearGradient id="loopyuBatCasing" x1="0" y1="0" x2="28" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          {/* Energy core glowing gradient */}
          <linearGradient id="loopyuBatEnergy" x1="4" y1="6" x2="24" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#fde047" />
            <stop offset="65%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          {/* Outer glow filter */}
          <filter id="batGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient energy aura background */}
        <circle cx="14" cy="20" r="11" fill="#f59e0b" opacity="0.25" filter="url(#batGlow)" />

        {/* Positive terminal cap (top) */}
        <rect
          x="10"
          y="1"
          width="8"
          height="4"
          rx="2"
          fill="#fef08a"
          stroke="#b45309"
          strokeWidth="1.2"
        />

        {/* Battery main outer body container */}
        <rect
          x="3"
          y="4.5"
          width="22"
          height="31.5"
          rx="5"
          fill="#090d16"
          stroke="url(#loopyuBatCasing)"
          strokeWidth="2"
        />

        {/* Internal glowing energy chamber */}
        <rect
          x="5"
          y="7"
          width="18"
          height="26.5"
          rx="3.5"
          fill="url(#loopyuBatEnergy)"
          opacity="0.95"
        />

        {/* Energy level divider horizontal lines */}
        <line x1="6.5" y1="15.5" x2="21.5" y2="15.5" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" strokeDasharray="2 1" />
        <line x1="6.5" y1="23.5" x2="21.5" y2="23.5" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" strokeDasharray="2 1" />

        {/* Central lightning bolt energy symbol */}
        <path
          d="M15.5 8.5L9.5 19H14.5L12.5 29.5L19 17.5H14L15.5 8.5Z"
          fill="#ffffff"
          stroke="#78350f"
          strokeWidth="0.75"
          strokeLinejoin="round"
          filter="url(#batGlow)"
        />

        {/* Glossy glass reflection on the left edge */}
        <rect
          x="6"
          y="8.5"
          width="2.2"
          height="23"
          rx="1.1"
          fill="#ffffff"
          opacity="0.6"
        />

        {/* Small energy sparkle dot */}
        <circle cx="20" cy="11" r="1" fill="#ffffff" opacity="0.85" />
      </svg>
    </div>
  );
};
