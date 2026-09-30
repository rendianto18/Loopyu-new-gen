import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  ChevronRight,
  Code2,
} from "lucide-react";
import * as api from "../../services/api";
import { QuizQuestion, QuizAttempt } from "../../types";

export const QuizView: React.FC = () => {
  const {
    activeQuizId,
    quizzes,
    appUser,
    currentTeam,
    learningMode,
    currentAssignment,
    setActiveTab,
    setActiveReflectionId,
    refreshData,
    addToast,
  } = useApp();

  const quizId = activeQuizId || quizzes[0]?.id || "quiz-loop-01";
  const quizMeta = quizzes.find((q) => q.id === quizId) || quizzes[0];

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    setLoading(true);
    // Fetch sanitized questions
    api.fetchQuizQuestions(quizId, false)
      .then((qs) => {
        setQuestions(qs);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load quiz questions:", e);
        setLoading(false);
      });
  }, [quizId]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (attemptResult) return; // Locked once submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = async () => {
    // Validate all answered
    const unanswered = questions.filter((q) => !selectedAnswers[q.id]);
    if (unanswered.length > 0) {
      addToast({
        title: "Kuis Belum Lengkap",
        message: `Silakan jawab semua pertanyaan (${unanswered.length} pertanyaan tersisa).`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const answersPayload: { questionId: string; answer: string }[] = Object.entries(selectedAnswers).map(([qid, ans]) => ({
        questionId: qid,
        answer: String(ans),
      }));

      const teamId = learningMode === "TEAM" ? currentTeam?.id : undefined;

      const res = await api.submitQuizAttempt(quizId, {
        userId: appUser.id,
        userName: appUser.name,
        teamId,
        assignmentId: currentAssignment?.id,
        answers: answersPayload,
      });

      setAttemptResult(res.attempt);
      await refreshData();

      addToast({
        title: "Kuis Berhasil Dikumpulkan!",
        message: `Skor Anda: ${res.attempt.score}/100`,
      });
    } catch (e: any) {
      addToast({
        title: "Gagal Mengumpulkan",
        message: e.message || "Terjadi kesalahan.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setAttemptResult(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Memuat pertanyaan kuis...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{quizMeta?.title || "Kuis Konsep Loop C"}</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                {questions.length} Soal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {quizMeta?.description || "Uji pemahaman Anda tentang sintaksis for-loop, while-loop, dan counter di bahasa C."}
            </p>
          </div>
        </div>

        {attemptResult && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleRetake}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
            <button
              onClick={() => {
                setActiveReflectionId("refl-01");
                setActiveTab("reflection");
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              <span>Lanjut Refleksi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Result Score Card (Visible upon submission) */}
      {attemptResult && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black ${
                attemptResult.score >= 70
                  ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
                  : "bg-amber-100 text-amber-700 border-2 border-amber-300"
              }`}>
                {attemptResult.score}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Evaluasi Kuis</div>
                <h2 className="text-lg font-black text-slate-900">
                  {attemptResult.score >= 70 ? "Pemahaman Sangat Baik! 🎉" : "Perlu Penguatan Konsep"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nilai Anda telah otomatis dicatat ke dalam buku nilai kelas dan progres tugas tim.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{attemptResult.score >= 70 ? "+25 Poin Tugas Diperoleh" : "+10 Poin Partisipasi"}</span>
            </div>
          </div>

          {/* Conceptual Diagnostics Feedback */}
          {attemptResult.conceptFeedback && Object.keys(attemptResult.conceptFeedback).length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Diagnostik Penguasaan Konsep C Looping:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {Object.entries(attemptResult.conceptFeedback).map(([concept, status]) => {
                  const isGood = status === "GOOD";
                  return (
                    <div
                      key={concept}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        isGood
                          ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                          : "bg-amber-50/50 border-amber-200 text-amber-900"
                      }`}
                    >
                      <span className="font-mono font-bold text-[11px]">{concept.replace("_", " ")}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isGood ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800"
                      }`}>
                        {isGood ? "Kuasai ✓" : "Review"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Questions Form */}
      <div className="space-y-4">
        {(questions || []).map((q, idx) => {
          const userAns = selectedAnswers[q.id];
          const isSubmitted = !!attemptResult;
          const isCorrect = isSubmitted && userAns === q.correctAnswer;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border p-6 transition-all ${
                isSubmitted
                  ? isCorrect
                    ? "border-emerald-200/80 bg-emerald-50/20"
                    : "border-rose-200/80 bg-rose-50/20"
                  : "border-slate-200/80 shadow-xs"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-black">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {q.concept || "LOOP_CONCEPT"}
                  </span>
                </div>

                {isSubmitted && (
                  <div className="flex items-center gap-1 text-xs font-bold">
                    {isCorrect ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Benar (+{q.points || 20})
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Belum Tepat
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Question Prompt */}
              <p className="font-bold text-sm text-slate-900 mb-3">{q.prompt || q.question}</p>

              {/* Optional Code Snippet in C */}
              {q.codeSnippet && (
                <div className="mb-4 bg-slate-900 text-slate-100 p-3.5 rounded-xl text-xs font-mono border border-slate-800 overflow-x-auto">
                  <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1 font-bold">
                    <Code2 className="w-3 h-3 text-sky-400" />
                    <span>Bahasa C Snippet:</span>
                  </div>
                  <pre className="text-emerald-300 leading-relaxed">{q.codeSnippet}</pre>
                </div>
              )}

              {/* Options */}
              <div className="space-y-2">
                {(q.options || []).map((rawOpt, optIdx) => {
                  const optId = typeof rawOpt === "string" ? rawOpt : rawOpt.id;
                  const optLabel = typeof rawOpt === "string" ? String.fromCharCode(65 + optIdx) : rawOpt.id;
                  const optText = typeof rawOpt === "string" ? rawOpt : rawOpt.text;
                  const isSelected = userAns === optId;
                  const isAnswerCorrect = isSubmitted && (optId === q.correctAnswer || optText === q.correctAnswer);

                  return (
                    <button
                      key={optId}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(q.id, optId)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                        isSubmitted
                          ? isAnswerCorrect
                            ? "bg-emerald-100/70 border-emerald-300 text-emerald-950 font-bold"
                            : isSelected
                            ? "bg-rose-100/70 border-rose-300 text-rose-950"
                            : "bg-slate-50/50 border-slate-200 text-slate-500 opacity-60"
                          : isSelected
                          ? "bg-blue-50 border-blue-400 text-blue-950 font-bold shadow-2xs"
                          : "bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                          isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-300"
                        }`}>
                          {optLabel}
                        </span>
                        <span>{optText}</span>
                      </div>

                      {isSubmitted && isAnswerCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pedagogical Explanation (Visible upon submission) */}
              {isSubmitted && q.explanation && (
                <div className="mt-3.5 p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600">
                  <span className="font-bold text-slate-900 block mb-0.5">Penjelasan Pedagogis:</span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Submit Action */}
      {!attemptResult && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {Object.keys(selectedAnswers).length} dari {questions.length} pertanyaan telah dijawab
          </div>
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
          >
            <span>{submitting ? "Memeriksa..." : "Kumpulkan Kuis"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
