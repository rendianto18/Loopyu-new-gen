import React, { useState } from "react";
import { LevelConfig } from "../../types";
import {
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";

interface FeedbackPanelProps {
  level: LevelConfig;
  feedback: {
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    isEfficient?: boolean;
  } | null;
  onOpenReflection: () => void;
  onHintUsed: (level: number) => void;
  hintsUsedCount: number;
  onNextLevel?: () => void;
  hasNextLevel?: boolean;
  failCount?: number;
  onOpenAssistGuide?: () => void;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  level,
  feedback,
  onOpenReflection,
  onHintUsed,
  hintsUsedCount,
  onNextLevel,
  hasNextLevel,
  failCount = 0,
  onOpenAssistGuide,
}) => {
  const [openedHintLevel, setOpenedHintLevel] = useState<number | null>(null);

  const toggleHint = (lvl: number) => {
    if (openedHintLevel === lvl) {
      setOpenedHintLevel(null);
    } else {
      setOpenedHintLevel(lvl);
      if (lvl > hintsUsedCount) {
        onHintUsed(lvl);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-5 shadow-xl">
      {/* Simulation Feedback Alert */}
      {feedback ? (
        <div
          className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 transition-all shadow-xs ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : feedback.type === "error"
              ? "bg-rose-50 border-rose-300 text-rose-900"
              : feedback.type === "warning"
              ? "bg-amber-50 border-amber-300 text-amber-900"
              : "bg-blue-50 border-blue-300 text-blue-900"
          }`}
        >
          <div className="p-2 rounded-xl bg-white shadow-xs flex-shrink-0 mt-0.5 border border-black/5">
            {feedback.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5]" />}
            {feedback.type === "error" && <AlertTriangle className="w-5 h-5 text-rose-600 stroke-[2.5]" />}
            {feedback.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-600 stroke-[2.5]" />}
            {feedback.type === "info" && <Info className="w-5 h-5 text-blue-600 stroke-[2.5]" />}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4 className="text-sm font-black">{feedback.title}</h4>
              {feedback.isEfficient && (
                <span className="flex items-center gap-1 text-[11px] font-black text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Solusi Sangat Efisien & Ringkas! ⭐
                </span>
              )}
            </div>
            <p className="text-xs mt-1 leading-relaxed font-bold opacity-90">{feedback.message}</p>

            {/* Special Assistance Action if failed 5+ times */}
            {failCount >= 5 && (feedback.type === "error" || feedback.type === "warning") && onOpenAssistGuide && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-500 flex-shrink-0" />
                  <span>Kamu telah mencoba {failCount}x. Butuh panduan langkah demi langkah?</span>
                </div>
                <button
                  onClick={onOpenAssistGuide}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-[11px] rounded-lg shadow-sm border-b-2 border-amber-700 active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Buka Panduan Solusi</span>
                </button>
              </div>
            )}

            {feedback.type === "success" && (
              <div className="mt-3.5 flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={onOpenReflection}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md border-b-3 border-blue-800 active:border-b-0 active:translate-y-0.5 transition-all"
                >
                  <BookOpen className="w-4 h-4 stroke-[2.5]" />
                  Isi Refleksi Pengalaman 📝
                </button>
                {hasNextLevel && onNextLevel && (
                  <button
                    onClick={onNextLevel}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md border-b-3 border-emerald-800 active:border-b-0 active:translate-y-0.5 transition-all"
                  >
                    <span>Lanjut ke Level {level.id + 1}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 flex items-center gap-3 text-slate-600 text-xs font-bold">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span>
            Pilih balok perintah di atas, lalu klik <strong>Jalankan Program</strong> untuk memandu robot Loopi bergerak! 🚀
          </span>
        </div>
      )}

      {/* 3-Tier Progressive Hint Accordion */}
      <div className="border-2 border-amber-200 rounded-2xl p-4 bg-amber-50/50 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500 fill-amber-400" />
            <h4 className="text-xs font-black text-amber-950">Kotak Bantuan Bertahap (Hints) 💡</h4>
          </div>
          <span className="text-[11px] font-black text-amber-800 bg-white px-2.5 py-0.5 rounded-full border border-amber-200">
            Terbuka: <strong className="text-amber-600">{hintsUsedCount}</strong> / 3
          </span>
        </div>
        <p className="text-[11px] text-slate-600 font-bold mb-3">
          Bantuan dirancang bertahap agar kamu dapat memecahkan teka-teki dengan seru dan mandiri:
        </p>

        <div className="space-y-2">
          {/* Hint 1 */}
          <div className="rounded-xl border-2 border-slate-200 overflow-hidden bg-white shadow-xs">
            <button
              onClick={() => toggleHint(1)}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-sky-50 text-left text-xs font-black text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black">
                  1
                </span>
                <span>Tingkat 1: Pertanyaan Pemantik Penasaran</span>
              </div>
              {openedHintLevel === 1 ? <ChevronUp className="w-4 h-4 text-slate-500 stroke-[2.5]" /> : <ChevronDown className="w-4 h-4 text-slate-500 stroke-[2.5]" />}
            </button>
            {openedHintLevel === 1 && (
              <div className="p-3.5 bg-blue-50/80 border-t-2 border-blue-100 text-xs text-blue-950 font-bold leading-relaxed">
                💡 {level.hints.hint1}
              </div>
            )}
          </div>

          {/* Hint 2 */}
          <div className="rounded-xl border-2 border-slate-200 overflow-hidden bg-white shadow-xs">
            <button
              onClick={() => toggleHint(2)}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-amber-50 text-left text-xs font-black text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-black">
                  2
                </span>
                <span>Tingkat 2: Petunjuk Pola Perulangan</span>
              </div>
              {openedHintLevel === 2 ? <ChevronUp className="w-4 h-4 text-slate-500 stroke-[2.5]" /> : <ChevronDown className="w-4 h-4 text-slate-500 stroke-[2.5]" />}
            </button>
            {openedHintLevel === 2 && (
              <div className="p-3.5 bg-amber-50/80 border-t-2 border-amber-100 text-xs text-amber-950 font-bold leading-relaxed">
                🔍 {level.hints.hint2}
              </div>
            )}
          </div>

          {/* Hint 3 */}
          <div className="rounded-xl border-2 border-slate-200 overflow-hidden bg-white shadow-xs">
            <button
              onClick={() => toggleHint(3)}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-emerald-50 text-left text-xs font-black text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black">
                  3
                </span>
                <span>Tingkat 3: Contoh Bentuk Balok Loop</span>
              </div>
              {openedHintLevel === 3 ? <ChevronUp className="w-4 h-4 text-slate-500 stroke-[2.5]" /> : <ChevronDown className="w-4 h-4 text-slate-500 stroke-[2.5]" />}
            </button>
            {openedHintLevel === 3 && (
              <div className="p-3.5 bg-emerald-50/80 border-t-2 border-emerald-100 text-xs text-emerald-950 font-mono font-bold leading-relaxed">
                🧩 {level.hints.hint3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
