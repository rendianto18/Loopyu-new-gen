import React, { useState } from "react";
import { LevelConfig } from "../../types";
import { useApp } from "../../context/AppContext";
import * as api from "../../services/api";
import { soundManager } from "../../utils/audio";
import { BookOpen, X, Send, Sparkles, CheckCircle2 } from "lucide-react";

interface ReflectionModalProps {
  level: LevelConfig;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  level,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { currentUser } = useApp();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formattedAnswers = level.reflectionQuestions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || "Belum diisi.",
      }));

      await api.saveReflection({
        levelId: level.id,
        userId: currentUser.id,
        userName: currentUser.name,
        answers: formattedAnswers,
      });

      soundManager.play("success");
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onSaved();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to save reflection:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-2xl max-w-xl w-full p-5 sm:p-6 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-blue-100 text-blue-700 border-2 border-blue-200">
            <BookOpen className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900">Kartu Refleksi Pengalaman Seru! 📝</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 text-[10px] font-black">
                Refleksi
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold">
              Tahap Refleksi Level {level.id}: {level.name}
            </p>
          </div>
        </div>

        {/* Informational intro */}
        <div className="bg-gradient-to-r from-sky-50 to-indigo-50 p-3.5 rounded-2xl border border-blue-200 mb-4 text-xs text-slate-700 font-bold leading-relaxed shadow-xs">
          💡 Dalam siklus <em>Experiential Learning</em>, merenungkan apa yang baru saja kamu coba membantu mengubah pengalaman bermain menjadi jurus coding yang hebat!
        </div>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mb-2 animate-bounce" />
            <h4 className="text-lg font-black text-slate-900">Refleksi Berhasil Disimpan! 🎉</h4>
            <p className="text-xs text-slate-600 font-bold mt-1">
              Jawabanmu telah tersimpan dan siap melanjutkan petualangan berikutnya!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {level.reflectionQuestions.map((q, idx) => (
                <div key={q.id} className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2">
                  <label className="block text-xs font-black text-slate-800 leading-snug">
                    <span className="text-blue-600 mr-1.5">{idx + 1}.</span>
                    {q.question}
                  </label>
                  <textarea
                    rows={2}
                    value={answers[q.id] || ""}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    placeholder="Tuliskan pengalaman atau apa yang kamu amati di sini..."
                    className="w-full bg-white border-2 border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all resize-none shadow-inner"
                    required
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Nanti Dulu
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-md border-b-3 border-blue-800 active:border-b-0 active:translate-y-0.5 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>{isSubmitting ? "Menyimpan..." : "Kirim Jawaban Refleksi"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
