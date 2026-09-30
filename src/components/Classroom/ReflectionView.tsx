import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  BookOpen,
  CheckCircle2,
  Send,
  Sparkles,
  MessageSquare,
  Users2,
  ChevronRight,
  GraduationCap,
  Star,
} from "lucide-react";
import * as api from "../../services/api";
import { ReflectionTemplate, ReflectionSubmission } from "../../types";

export const ReflectionView: React.FC = () => {
  const {
    activeReflectionId,
    reflections,
    appUser,
    currentTeam,
    learningMode,
    currentAssignment,
    setActiveTab,
    setActiveTestId,
    refreshData,
    addToast,
  } = useApp();

  const reflId = activeReflectionId || reflections[0]?.id || "refl-01";
  const template = reflections.find((r) => r.id === reflId) || reflections[0];

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pastSubmissions, setPastSubmissions] = useState<ReflectionSubmission[]>([]);

  useEffect(() => {
    // Check if previously submitted
    api.fetchReflectionSubmissions(reflId)
      .then((subs) => {
        setPastSubmissions(subs);
        const mySub = subs.find((s) => s.userId === appUser.id);
        if (mySub) {
          setIsSubmitted(true);
          const map: Record<string, string> = {};
          mySub.answers.forEach((a) => {
            map[a.questionId] = a.answer;
          });
          setAnswers(map);
        }
      })
      .catch((e) => console.error("Error loading reflection submissions:", e));
  }, [reflId, appUser.id]);

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check all questions answered
    const unanswered = template?.questions.filter((q) => !answers[q.id]?.trim());
    if (unanswered && unanswered.length > 0) {
      addToast({
        title: "Refleksi Belum Lengkap",
        message: "Mohon isi semua pertanyaan refleksi sebelum mengirim.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const answersPayload: { questionId: string; answer: string }[] = Object.entries(answers).map(([qid, ans]) => ({
        questionId: qid,
        answer: String(ans),
      }));

      const teamId = learningMode === "TEAM" ? currentTeam?.id : undefined;

      await api.submitReflection(reflId, {
        userId: appUser.id,
        userName: appUser.name,
        teamId,
        assignmentId: currentAssignment?.id,
        answers: answersPayload,
      });

      setIsSubmitted(true);
      await refreshData();

      addToast({
        title: "Refleksi Terkirim! ✨",
        message: "Refleksi Anda telah berhasil dicatat untuk penilaian tugas.",
      });
    } catch (err: any) {
      addToast({
        title: "Gagal Mengirim",
        message: err.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{template?.title || "Refleksi Pemrograman"}</h1>
              {isSubmitted && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Sudah Terisi ✓
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {template?.description || "Evaluasi pemahaman konsep perulangan dan proses kolaborasi tim Anda."}
            </p>
          </div>
        </div>

        {isSubmitted && (
          <button
            onClick={() => {
              setActiveTestId("test-mid-loop");
              setActiveTab("test");
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            <span>Lanjut ke Ujian Akhir</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Reflection Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {(template?.questions || []).map((q, idx) => {
            return (
              <div key={q.id} className="space-y-2 pb-4 border-b border-slate-100 last:border-b-0 last:pb-0">
                <label className="block text-xs font-bold text-slate-800">
                  <span className="text-emerald-600 font-black mr-1">{idx + 1}.</span>
                  {q.question}
                </label>

                <textarea
                  required
                  rows={3}
                  disabled={isSubmitted}
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Tuliskan jawaban Anda secara jujur dan reflektif di sini..."
                  className={`w-full p-3.5 rounded-xl border text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                    isSubmitted
                      ? "bg-slate-50 border-slate-200 text-slate-700"
                      : "border-slate-300 bg-white"
                  }`}
                />
              </div>
            );
          })}

          {!isSubmitted ? (
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Refleksi bernilai 20 poin dalam total penilaian tugas.
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? "Menyimpan..." : "Kirim Jawaban Refleksi"}</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Refleksi Anda telah tersimpan dan dinilai oleh sistem.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-emerald-700 underline font-bold hover:text-emerald-900"
              >
                Edit Jawaban
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
