import React, { useState, useEffect } from "react";
import { Sparkles, Terminal, Code2 } from "lucide-react";

interface BrandLogoProps {
  isSocketConnected?: boolean;
  soundEnabled?: boolean;
  onClick?: () => void;
}

const FUN_QUOTES = [
  "Bip boop! Siap belajar perulangan for & while C? 🚀",
  "for (int i = 0; i < n; i++) cocok saat putaran sudah pasti! 💡",
  "while (jalurAman()) cocok saat jumlah langkah bergantung kondisi! ⚡",
  "Tips: Perhatikan batas balok agar solusi efisien dan dapat bintang 3! ⭐",
  "Bip! Coding itu seru saat dipecah jadi langkah-langkah kecil! 🤖",
  "LOOPYU: Belajar logika algoritma C dengan seru & visual! 🎯",
];

export const BrandLogo: React.FC<BrandLogoProps> = ({
  isSocketConnected = true,
  soundEnabled = true,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [eyeState, setEyeState] = useState<"normal" | "happy" | "wink">("normal");

  // Play a soft cute synthesizer beep when clicked
  const playRobotBeep = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freqs = [587.33, 880, 1174.66]; // D5, A5, D6 cheerful arpeggio
      const freq = freqs[clickCount % freqs.length];

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio context might be restricted before first gesture
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playRobotBeep();
    setClickCount((c) => c + 1);
    setEyeState("wink");
    setQuoteIndex((prev) => (prev + 1) % FUN_QUOTES.length);
    setShowBubble(true);

    if (onClick) {
      onClick();
    }
  };

  // Reset wink after brief moment
  useEffect(() => {
    if (eyeState === "wink") {
      const timer = setTimeout(() => {
        setEyeState(isHovered ? "happy" : "normal");
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [eyeState, isHovered]);

  // Hide bubble after 4 seconds
  useEffect(() => {
    if (showBubble) {
      const timer = setTimeout(() => setShowBubble(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showBubble, quoteIndex]);

  // Handle hover state
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (eyeState !== "wink") setEyeState("happy");
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (eyeState !== "wink") setEyeState("normal");
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Speech Bubble / Interactive Tooltip */}
      {showBubble && (
        <div className="absolute left-0 -bottom-14 sm:-bottom-12 z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <div className="bg-slate-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-2 whitespace-nowrap">
            <span className="text-amber-400 text-xs">💬</span>
            <span className="text-slate-200">{FUN_QUOTES[quoteIndex]}</span>
            <div className="w-2 h-2 bg-slate-900 border-l border-t border-slate-700/80 rotate-45 absolute -top-1 left-6" />
          </div>
        </div>
      )}

      {/* Main Clickable Brand Container */}
      <div
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex items-center gap-2.5 cursor-pointer select-none group"
        title="Klik Loopi untuk sapaan atau tips perulangan!"
      >
        {/* Interactive Mascot Icon */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          {/* Animated Orbiting Loop Track */}
          <div
            className={`absolute inset-0 rounded-2xl transition-all duration-500 border-2 ${
              isHovered
                ? "border-indigo-400/80 rotate-180 scale-110 shadow-lg shadow-indigo-300/40"
                : "border-blue-300/40 rotate-0 scale-100"
            }`}
            style={{ borderStyle: "dashed" }}
          />

          {/* Robot Head Frame */}
          <div
            className={`w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex flex-col items-center justify-center shadow-md text-white transition-transform duration-300 ${
              isHovered ? "scale-105 -translate-y-0.5 rotate-[-2deg]" : "scale-100"
            }`}
          >
            {/* Antenna with Pulsing Beacon */}
            <div className="absolute -top-1.5 flex items-center justify-center">
              <div
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  isSocketConnected ? "bg-emerald-400" : "bg-amber-400"
                } ${isHovered ? "scale-125 ring-2 ring-emerald-300" : ""}`}
              />
            </div>

            {/* Robot Face Screen */}
            <div className="w-7 h-5 bg-slate-950/80 rounded-lg flex items-center justify-center gap-1 px-1 border border-white/20">
              {/* Left Eye */}
              {eyeState === "normal" && (
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)] animate-pulse" />
              )}
              {eyeState === "happy" && (
                <span className="text-[10px] font-black text-cyan-300 leading-none select-none">
                  ^
                </span>
              )}
              {eyeState === "wink" && (
                <span className="text-[10px] font-black text-amber-300 leading-none select-none">
                  &gt;
                </span>
              )}

              {/* Nose / Mouth / Center separator */}
              <div className="w-0.5 h-1 bg-slate-700/60 rounded-full" />

              {/* Right Eye */}
              {eyeState === "normal" && (
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)] animate-pulse" />
              )}
              {eyeState === "happy" && (
                <span className="text-[10px] font-black text-cyan-300 leading-none select-none">
                  ^
                </span>
              )}
              {eyeState === "wink" && (
                <span className="text-[10px] font-black text-cyan-300 leading-none select-none">
                  ~
                </span>
              )}
            </div>

            {/* Subtle Cute Cheeks on hover/wink */}
            {(isHovered || eyeState === "wink") && (
              <div className="absolute bottom-1.5 flex items-center justify-between w-6 px-0.5">
                <span className="w-1 h-0.5 bg-pink-400/80 rounded-full" />
                <span className="w-1 h-0.5 bg-pink-400/80 rounded-full" />
              </div>
            )}
          </div>

          {/* Sparkle badge indicator */}
          {isHovered && (
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 p-0.5 rounded-full shadow-xs animate-bounce">
              <Sparkles className="w-2.5 h-2.5" />
            </div>
          )}
        </div>

        {/* Brand Name & Dynamic C Badge */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
              LOOP<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500">YU</span>
            </span>

            {/* C-Style Loop Indicator Tag */}
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black border transition-all ${
                isHovered
                  ? "bg-indigo-600 text-white border-indigo-700 shadow-xs scale-105"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
              }`}
            >
              &#123; C &#125;
            </span>

            {/* Realtime Status Beacon */}
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                isSocketConnected
                  ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                  : "bg-amber-400"
              } ${isHovered ? "scale-125" : ""}`}
              title={isSocketConnected ? "Tersambung Real-Time (Online)" : "Menghubungkan..."}
            />
          </div>

          <span className="text-[10px] font-extrabold text-slate-600 tracking-wider uppercase group-hover:text-indigo-600 transition-colors flex items-center gap-1">
            <span>Perulangan for & while</span>
          </span>
        </div>
      </div>
    </div>
  );
};
