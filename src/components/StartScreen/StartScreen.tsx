import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { INITIAL_8_LEVELS } from "../../data/levelsData";
import { soundManager } from "../../utils/audio";
import { CompletionCertificateModal } from "../GameArena/CompletionCertificateModal";
import {
  Play,
  Sparkles,
  Zap,
  CheckCircle2,
  Code2,
  Cpu,
  Bot,
  ArrowRight,
  Flame,
  Award,
  BookOpen,
  Clock,
  Download,
  Lock,
} from "lucide-react";

export const StartScreen: React.FC<{
  onStart: () => void;
  onSelectLevel: (levelId: number) => void;
}> = ({ onStart, onSelectLevel }) => {
  const { currentLevel, appUser, addToast } = useApp();
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Load completed levels from localStorage (sanitized strictly for 8 levels)
  const completedLevels: number[] = (() => {
    try {
      const saved = localStorage.getItem("loopyu_completed_levels");
      return saved
        ? (JSON.parse(saved) as number[]).filter((n) => typeof n === "number" && n >= 1 && n <= 8)
        : [];
    } catch {
      return [];
    }
  })();

  const isLevelUnlocked = (lvlId: number) => {
    return lvlId === 1 || completedLevels.includes(lvlId - 1) || completedLevels.includes(lvlId);
  };

  // Track elapsed time from stored start time
  const elapsedSeconds: number = (() => {
    try {
      const savedFinal = localStorage.getItem("loopyu_final_elapsed_seconds");
      if (savedFinal) return Number(savedFinal);
      const start = localStorage.getItem("loopyu_start_timestamp");
      if (start) {
        return Math.max(30, Math.floor((Date.now() - Number(start)) / 1000));
      }
      return 480; // fallback approx 8m
    } catch {
      return 480;
    }
  })();

  const activeLevelId = currentLevel?.id || 1;

  const handleStartClick = () => {
    // Ensure start timestamp is marked
    if (!localStorage.getItem("loopyu_start_timestamp")) {
      localStorage.setItem("loopyu_start_timestamp", Date.now().toString());
    }
    soundManager.play("win");
    // Resume to the highest unlocked level or current active level
    const nextUnlocked = INITIAL_8_LEVELS.find((l) => !completedLevels.includes(l.id))?.id || 1;
    onSelectLevel(nextUnlocked);
    onStart();
  };

  const handleLevelClick = (lvlId: number) => {
    if (!isLevelUnlocked(lvlId)) {
      soundManager.play("lose");
      addToast({
        title: `Misi ${lvlId} Terkunci`,
        message: `Tuntaskan Misi ${lvlId - 1} terlebih dahulu untuk membuka tantangan ini!`,
        type: "warning",
      });
      return;
    }
    if (!localStorage.getItem("loopyu_start_timestamp")) {
      localStorage.setItem("loopyu_start_timestamp", Date.now().toString());
    }
    soundManager.playClick();
    onSelectLevel(lvlId);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start py-8 px-4 sm:px-6 max-w-6xl mx-auto space-y-10 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="w-full flex flex-col items-center text-center space-y-5 pt-4">
        {/* Animated Robot Mascot */}
        <div className="relative group cursor-pointer" onClick={handleStartClick}>
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 p-1.5 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center relative overflow-hidden">
              {/* Circuit background lines */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:12px_12px]" />

              {/* Robot Face */}
              <div className="flex flex-col items-center justify-center space-y-2 relative z-10">
                {/* Antennas */}
                <div className="flex items-center gap-4 -mt-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                {/* Eyes */}
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
                {/* Mouth smile */}
                <div className="w-6 h-1.5 bg-pink-400 rounded-full" />
              </div>
            </div>
          </div>

          <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-900 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-md border-2 border-white">
            8 Misi
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: "6s" }} />
            <span>Game Edukasi Logika Pemrograman Bahasa C</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
            LOOP<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600">YU</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Kuasai konsep perulangan <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">for</span> dan{" "}
            <span className="font-mono font-bold text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded">while</span> dalam bahasa C secara visual bersama robot petualang!
          </p>
        </div>

        {/* Big Start Action Button & Optional Certificate Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleStartClick}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 hover:from-blue-700 hover:via-indigo-700 hover:to-pink-700 active:scale-95 text-white font-black text-base shadow-xl hover:shadow-indigo-300 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-white" />
            </div>
            <span>MULAI PETUALANGAN</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {completedLevels.length >= 1 && (
            <button
              onClick={() => setShowCertificateModal(true)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-indigo-200 text-indigo-700 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>Sertifikat & Hasil Misi</span>
            </button>
          )}
        </div>
      </div>

      {/* Rangkaian Misi Showcase & Selection Map */}
      <div className="w-full space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Rangkaian Misi
              </h2>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full w-fit">
            {completedLevels.length} dari 8 Level Selesai
          </span>
        </div>

        {/* Structured Level / Mission Table Overview matching the spec */}
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-700 font-extrabold border-b border-slate-200">
                <th className="py-3 px-3.5 w-16 text-center">Level</th>
                <th className="py-3 px-4">Nama Misi</th>
                <th className="py-3 px-4">Fokus Misi</th>
                <th className="py-3 px-4">Tantangan</th>
                <th className="py-3 px-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {INITIAL_8_LEVELS.map((lvl) => {
                const isDone = completedLevels.includes(lvl.id);
                const isSelected = activeLevelId === lvl.id;
                const isUnlocked = isLevelUnlocked(lvl.id);

                return (
                  <tr
                    key={lvl.id}
                    onClick={() => handleLevelClick(lvl.id)}
                    className={`transition-colors cursor-pointer ${
                      !isUnlocked
                        ? "opacity-60 bg-slate-50/40 hover:bg-slate-100/50"
                        : isSelected
                        ? "bg-blue-50/80 font-semibold"
                        : "hover:bg-blue-50/60"
                    }`}
                  >
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                          isDone
                            ? "bg-emerald-500 text-white"
                            : !isUnlocked
                            ? "bg-slate-200 text-slate-400"
                            : isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : !isUnlocked ? (
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          lvl.id
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span>{lvl.name}</span>
                          {!isUnlocked && (
                            <span className="text-[10px] text-slate-600 font-normal">
                              (Terkunci)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-amber-500">
                          <span>
                            {Array.from({ length: lvl.difficultyStars || 1 }).map((_, i) => (
                              <span key={i}>⭐</span>
                            ))}
                          </span>
                          <span className="text-slate-600 font-medium text-[9px]">
                            {lvl.difficulty}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-indigo-700 font-semibold">
                      {lvl.focus}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {lvl.challengeExample || lvl.description}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLevelClick(lvl.id);
                        }}
                        className={`px-3 py-1 font-bold text-[11px] rounded-lg shadow-2xs transition-colors cursor-pointer ${
                          !isUnlocked
                            ? "bg-slate-200 text-slate-500 hover:bg-slate-300"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {!isUnlocked ? "Terkunci" : isDone ? "Ulangi" : "Main"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 8 Level Interactive Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {INITIAL_8_LEVELS.map((lvl) => {
            const isDone = completedLevels.includes(lvl.id);
            const isSelected = activeLevelId === lvl.id;
            const isUnlocked = isLevelUnlocked(lvl.id);

            return (
              <div
                key={lvl.id}
                onClick={() => handleLevelClick(lvl.id)}
                className={`relative rounded-2xl p-5 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  !isUnlocked
                    ? "bg-slate-50/80 border-slate-200 opacity-75 hover:border-slate-300"
                    : isSelected
                    ? "bg-white border-blue-600 ring-4 ring-blue-100 shadow-md"
                    : isDone
                    ? "bg-emerald-50/40 border-emerald-200 hover:border-emerald-300 hover:shadow-md"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div className="space-y-3">
                  {/* Level Header Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                          isDone
                            ? "bg-emerald-500 text-white"
                            : !isUnlocked
                            ? "bg-slate-200 text-slate-500"
                            : isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : !isUnlocked ? (
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          lvl.id
                        )}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Level {lvl.id}
                      </span>
                    </div>

                    {isDone && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Selesai ✓
                      </span>
                    )}
                  </div>

                  {/* Level Title */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="flex text-amber-400 text-xs">
                        {Array.from({ length: lvl.difficultyStars || 1 }).map((_, i) => (
                          <span key={i}>⭐</span>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {lvl.difficulty}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors mb-0.5">
                      {lvl.name}
                    </h3>
                    <div className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                      <span>Fokus:</span>
                      <span className="text-slate-700 font-semibold">{lvl.focus}</span>
                    </div>
                  </div>

                  {/* Challenge description */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                      Tantangan:
                    </div>
                    <p className="leading-relaxed">
                      {lvl.challengeExample}
                    </p>
                  </div>
                </div>

                {/* Level Footer Info */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
                    <Zap className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{lvl.targetBatteries.length} {lvl.id === 3 ? "Pos Sasaran" : "Sasaran"}</span>
                  </div>

                  <span
                    className={`font-bold flex items-center gap-1 ${
                      !isUnlocked
                        ? "text-slate-600"
                        : "text-blue-600 group-hover:underline"
                    }`}
                  >
                    {!isUnlocked ? (
                      <>
                        <Lock className="w-3 h-3 text-slate-600" />
                        <span>Terkunci</span>
                      </>
                    ) : (
                      <>
                        <span>{isDone ? "Main Lagi" : "Mulai Level"}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works (3 Steps) */}
      <div className="w-full bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="text-center space-y-1">
          <h3 className="text-base font-black text-slate-900">
            Cara Bermain & Belajar di LOOPYU
          </h3>
          <p className="text-xs text-slate-500">
            Tiga langkah sederhana untuk menguasai logika perulangan bahasa C
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 font-black text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-900">Susun Balok Logika</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tarik atau klik balok perintah (MAJU, AMBIL BATERAI, atau loop FOR/WHILE) ke area kerja.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 font-black text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-900">Jalankan Robot</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tekan tombol Jalankan untuk menyaksikan robot bergerak dan mengevaluasi putaran loop di arena.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 font-black text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-900">Pelajari Kode C Asli</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Lihat sintaks kode C sesungguhnya yang dihasilkan otomatis dari balok yang kamu susun.
            </p>
          </div>
        </div>
      </div>

      {/* Completion & Certificate Modal */}
      <CompletionCertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        completedCount={completedLevels.length}
        totalMissions={INITIAL_8_LEVELS.length}
        elapsedSeconds={elapsedSeconds}
      />
    </div>
  );
};
