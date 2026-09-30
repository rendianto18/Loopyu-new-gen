import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  GraduationCap,
  Timer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  ArrowRight,
  Code2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import * as api from "../../services/api";
import { TestQuestion, TestAttempt, FormalTest } from "../../types";

export const TestView: React.FC = () => {
  const {
    activeTestId,
    tests,
    appUser,
    currentTeam,
    learningMode,
    currentAssignment,
    setActiveTab,
    refreshData,
    addToast,
  } = useApp();

  const testId = activeTestId || tests[0]?.id || "test-mid-loop";
  const testMeta: FormalTest | undefined = tests.find((t) => t.id === testId) || tests[0];

  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>((testMeta?.timeLimitMinutes || 20) * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<TestAttempt | null>(null);
  const [attemptHistory, setAttemptHistory] = useState<TestAttempt[]>([]);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.fetchTestQuestions(testId, false),
      api.fetchTestAttempts(testId, appUser.id),
    ])
      .then(([qs, atts]) => {
        // Shuffle questions
        const shuffled = [...qs].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        setAttemptHistory(atts);
        if (atts.length > 0) {
          setTestResult(atts[atts.length - 1]);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error("Error loading test:", e);
        setLoading(false);
      });
  }, [testId, appUser.id]);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0 && !testResult) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, testResult]);

  const handleStartTest = () => {
    setHasStarted(true);
    setIsTimerRunning(true);
    setTimeLeft((testMeta?.timeLimitMinutes || 20) * 60);
    setSelectedAnswers({});
    setTestResult(null);
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (testResult) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleAutoSubmit = () => {
    addToast({
      title: "Waktu Ujian Habis!",
      message: "Jawaban Anda sedang dikumpulkan secara otomatis.",
    });
    performSubmit();
  };

  const performSubmit = async () => {
    setSubmitting(true);
    setIsTimerRunning(false);

    try {
      const answersPayload: { questionId: string; answer: string }[] = Object.entries(selectedAnswers).map(([qid, ans]) => ({
        questionId: qid,
        answer: String(ans),
      }));

      const teamId = learningMode === "TEAM" ? currentTeam?.id : undefined;

      const res = await api.submitTestAttempt(testId, {
        userId: appUser.id,
        userName: appUser.name,
        teamId,
        assignmentId: currentAssignment?.id,
        answers: answersPayload,
      });

      const isPassed = typeof res.attempt.passed === "boolean"
        ? res.attempt.passed
        : res.attempt.score >= (testMeta?.passingScore || 75);

      setTestResult({ ...res.attempt, passed: isPassed });
      setAttemptHistory((prev) => [...prev, { ...res.attempt, passed: isPassed }]);
      await refreshData();

      addToast({
        title: "Ujian Selesai! 🎓",
        message: `Nilai Ujian Akhir: ${res.attempt.score} (Status: ${isPassed ? "LULUS" : "BELUM LULUS"})`,
      });
    } catch (e: any) {
      addToast({
        title: "Gagal Mengumpulkan Ujian",
        message: e.message || "Terjadi kesalahan.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const maxAttempts = testMeta?.maxAttempts || 2;
  const attemptsUsed = attemptHistory.length;
  const canAttempt = attemptsUsed < maxAttempts;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Menyiapkan lembar ujian formal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{testMeta?.title || "Ujian Formal Pemrograman C"}</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                KKM: {testMeta?.passingScore || 75}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {testMeta?.description || "Penilaian sumatif pemahaman perulangan (Looping) bahasa C."}
            </p>
          </div>
        </div>

        {/* Timer Badge (Active Test) */}
        {isTimerRunning && (
          <div className="flex items-center gap-2 bg-slate-900 text-amber-400 px-4 py-2 rounded-xl font-mono text-base font-black border border-slate-700 shadow-xs">
            <Timer className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Pre-start Instructions or Summary Card */}
      {!hasStarted && !testResult && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900">Petunjuk Pengerjaan Ujian</h2>
            <div className="text-xs text-slate-600 space-y-2 text-left bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
              <p>• Waktu pengerjaan adalah <strong>{testMeta?.timeLimitMinutes || 20} menit</strong>.</p>
              <p>• Ujian terdiri dari <strong>{questions.length} soal pilihan ganda</strong> mengenai sintaksis dan analisa perulangan C.</p>
              <p>• Urutan soal dan pilihan jawaban diacak secara acak oleh sistem.</p>
              <p>• Kesempatan pengerjaan maksimal: <strong>{maxAttempts} kali percobaan</strong> (Sudah dipakai: {attemptsUsed}x).</p>
              <p>• Nilai kelulusan minimal (KKM) adalah <strong>{testMeta?.passingScore || 75}</strong>.</p>
            </div>
          </div>

          {canAttempt ? (
            <button
              onClick={handleStartTest}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Mulai Ujian Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              Batas percobaan ujian ({maxAttempts}x) telah habis. Nilai terbaik Anda telah disimpan.
            </div>
          )}
        </div>
      )}

      {/* Result Card (When submitted) */}
      {testResult && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black ${
                testResult.passed
                  ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
                  : "bg-rose-100 text-rose-700 border-2 border-rose-300"
              }`}>
                {testResult.score}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Ujian Formal</div>
                <h2 className="text-lg font-black text-slate-900">
                  {testResult.passed ? "Selamat! Anda Dinyatakan LULUS 🎉" : "Belum Memenuhi Nilai Kelulusan"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  KKM: {testMeta?.passingScore || 75} • Percobaan Ke: {testResult.attemptNumber || 1} dari {maxAttempts}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canAttempt && !testResult.passed && (
                <button
                  onClick={handleStartTest}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi Ujian (Sisa {maxAttempts - attemptsUsed}x)</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab("assignments")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
              >
                <span>Kembali ke Tugas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Questions Container */}
      {(hasStarted || testResult) && (
        <div className="space-y-4">
          {(questions || []).map((q, idx) => {
            const userAns = selectedAnswers[q.id];
            const isFinished = !!testResult;
            const isCorrect = isFinished && userAns === q.correctAnswer;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-6 transition-all ${
                  isFinished
                    ? isCorrect
                      ? "border-emerald-200/80 bg-emerald-50/20"
                      : "border-rose-200/80 bg-rose-50/20"
                    : "border-slate-200/80 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Bobot: {q.points || 20} Poin</span>
                  </div>
                  {isFinished && (
                    <span className={`text-xs font-bold flex items-center gap-1 ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                      {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {isCorrect ? "Benar" : "Salah"}
                    </span>
                  )}
                </div>

                <p className="font-bold text-sm text-slate-900 mb-3">{q.prompt || q.question}</p>

                {q.codeSnippet && (
                  <div className="mb-4 bg-slate-950 text-slate-100 p-4 rounded-xl text-xs font-mono border border-slate-800 overflow-x-auto">
                    <pre className="text-emerald-400 leading-relaxed">{q.codeSnippet}</pre>
                  </div>
                )}

                <div className="space-y-2">
                  {(q.options || []).map((rawOpt, optIdx) => {
                    const optId = typeof rawOpt === "string" ? rawOpt : rawOpt.id;
                    const optLabel = typeof rawOpt === "string" ? String.fromCharCode(65 + optIdx) : rawOpt.id;
                    const optText = typeof rawOpt === "string" ? rawOpt : rawOpt.text;
                    const isSelected = userAns === optId;
                    const isCorrectOpt = isFinished && (optId === q.correctAnswer || optText === q.correctAnswer);

                    return (
                      <button
                        key={optId}
                        disabled={isFinished}
                        onClick={() => handleSelectOption(q.id, optId)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                          isFinished
                            ? isCorrectOpt
                              ? "bg-emerald-100/70 border-emerald-400 text-emerald-950 font-bold"
                              : isSelected
                              ? "bg-rose-100/70 border-rose-300 text-rose-950"
                              : "bg-slate-50/50 border-slate-200 text-slate-500 opacity-60"
                            : isSelected
                            ? "bg-purple-50 border-purple-400 text-purple-950 font-bold shadow-2xs"
                            : "bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                            isSelected ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-600 border-slate-300"
                          }`}>
                            {optLabel}
                          </span>
                          <span>{optText}</span>
                        </div>

                        {isFinished && isCorrectOpt && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isFinished && q.explanation && (
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600">
                    <span className="font-bold text-slate-900 block mb-0.5">Penjelasan Soal:</span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Button during active test */}
      {hasStarted && !testResult && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {Object.keys(selectedAnswers).length} dari {questions.length} soal dijawab
          </div>
          <button
            onClick={performSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
          >
            <span>{submitting ? "Mengumpulkan..." : "Kumpulkan Lembar Ujian"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
