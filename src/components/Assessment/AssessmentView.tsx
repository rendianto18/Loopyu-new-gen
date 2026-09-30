import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import * as api from "../../services/api";
import { AssessmentRecord, ReflectionResponse } from "../../types";
import { soundManager } from "../../utils/audio";
import confetti from "canvas-confetti";
import {
  BookOpen,
  CheckCircle2,
  Trophy,
  BarChart3,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Star,
  Award,
} from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const ASSESSMENT_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Manakah tindakan di bawah ini yang paling tepat diselesaikan menggunakan struktur perulangan (loop)?",
    options: [
      "Menyalakan robot satu kali saat tombol ditekan",
      "Mengambil 10 baterai yang tersusun rapi secara bergantian",
      "Memilih warna lampu berdasarkan tingkat baterai",
      "Menghapus seluruh program saat komputer dimatikan",
    ],
    correct: 1,
    explanation: "Perulangan digunakan untuk aksi yang terjadi berulang-ulang dengan pola teratur (seperti mengambil 10 baterai berurutan).",
  },
  {
    id: 2,
    question: "Kapan kita sebaiknya memilih 'Balok For' dibandingkan dengan 'Balok While'?",
    options: [
      "Ketika kita sama sekali tidak tahu berapa kali tindakan harus dilakukan",
      "Ketika jumlah pengulangan sudah diketahui pasti sejak awal (misal 5 kali)",
      "Ketika robot hanya perlu berjalan jika ada musuh",
      "Ketika program mengalami error terus menerus",
    ],
    correct: 1,
    explanation: "Balok For digunakan saat batas pengulangan pasti (N kali), sedangkan While digunakan saat bergantung pada kondisi dinamis.",
  },
  {
    id: 3,
    question: "Robot harus mengambil 4 baterai di lintasan lurus, tetapi pada instruksi tertulis For (6 kali). Masalah apa yang akan terjadi?",
    options: [
      "Robot akan kehabisan baterai lebih cepat",
      "Robot mengalami Off-by-one (menabrak ujung koridor/dinding karena mengulang berlebihan)",
      "Robot akan berputar balik otomatis",
      "Tidak ada masalah, robot akan diam saja",
    ],
    correct: 1,
    explanation: "Ini adalah bug kelebihan batas (Off-by-one), di mana perulangan 6 kali pada jalur 4 sel akan menyebabkan tabrakan.",
  },
  {
    id: 4,
    question: "Apa keuntungan utama menulis kode menggunakan perulangan dibandingkan menulis 20 perintah berurutan?",
    options: [
      "Ukuran file komputer menjadi lebih besar",
      "Kode lebih ringkas, mudah dibaca, dan mudah diperbaiki jika ada perubahan pola",
      "Robot bergerak dengan kecepatan cahaya",
      "Program tidak memerlukan listrik lagi",
    ],
    correct: 1,
    explanation: "Loop meningkatkan efisiensi, keterbacaan kode (clean code), dan memudahkan pemeliharaan.",
  },
  {
    id: 5,
    question: "Apa syarat utama agar sebuah perulangan 'While (Jalur Aman)' tidak berjalan tanpa henti (Infinite Loop)?",
    options: [
      "Komputer harus dimatikan setiap 5 detik",
      "Harus ada tindakan di dalam loop yang pada akhirnya mengubah kondisi 'Jalur Aman' menjadi false / menemui batas",
      "Loop harus ditaruh di dalam fungsi rahasia",
      "Tidak boleh ada belokan ke kiri",
    ],
    correct: 1,
    explanation: "Agar perulangan berhenti, kondisi harus dapat berubah menjadi salah (false) seiring pergerakan robot.",
  },
];

const OPTION_COLORS = [
  "bg-blue-500 text-white shadow-blue-200",
  "bg-amber-400 text-amber-950 font-black shadow-amber-200",
  "bg-purple-500 text-white shadow-purple-200",
  "bg-emerald-500 text-white font-black shadow-emerald-200",
];

export const AssessmentView: React.FC = () => {
  const { currentUser, addToast } = useApp();

  const [activeTest, setActiveTest] = useState<"pretest" | "posttest" | "history">("pretest");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [testScore, setTestScore] = useState(0);

  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [reflections, setReflections] = useState<ReflectionResponse[]>([]);

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const loadData = async () => {
    try {
      const [assRes, refRes] = await Promise.all([
        api.fetchAssessments(currentUser.id),
        api.fetchReflections(),
      ]);
      setAssessments(assRes);
      setReflections(refRes);
    } catch {}
  };

  const handleSelectOption = (optIdx: number) => {
    soundManager.play("step");
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQIndex]: optIdx,
    });
  };

  const handleNextQuestion = () => {
    if (currentQIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    let correctCount = 0;
    ASSESSMENT_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / ASSESSMENT_QUESTIONS.length) * 100);
    setTestScore(calculatedScore);
    setIsCompleted(true);

    if (calculatedScore >= 60) {
      soundManager.play("win");
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } else {
      soundManager.play("lose");
    }

    const type = activeTest === "pretest" ? "pretest" : "posttest";
    const record = await api.submitAssessment(currentUser.id, type, calculatedScore);
    setAssessments((prev) => [record, ...prev]);

    addToast({
      id: `ass-${Date.now()}`,
      title: `${type === "pretest" ? "Pre-Test" : "Post-Test"} Selesai!`,
      message: `Skor kamu: ${calculatedScore}/100. Data berhasil disimpan ke database.`,
      type: "success",
      timestamp: new Date().toISOString(),
      read: false,
      avatar: "🏆",
    });
  };

  const resetQuiz = (type: "pretest" | "posttest") => {
    setActiveTest(type);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
    setTestScore(0);
  };

  const pretestRecord = assessments.find((a) => a.type === "pretest");
  const posttestRecord = assessments.find((a) => a.type === "posttest");

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 border-2 border-purple-200 flex items-center justify-center text-purple-700 shadow-sm">
            <BookOpen className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Kuis & Refleksi Belajar 📚
            </h2>
            <p className="text-xs text-slate-600 font-bold">
              Uji pemahaman konsep logika perulangan sebelum dan sesudah berpetualang!
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200 gap-1.5 shadow-inner">
          <button
            onClick={() => resetQuiz("pretest")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTest === "pretest"
                ? "bg-blue-600 text-white shadow-md border-b-3 border-blue-800"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pre-Test
          </button>
          <button
            onClick={() => resetQuiz("posttest")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTest === "posttest"
                ? "bg-emerald-500 text-white shadow-md border-b-3 border-emerald-700"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Post-Test
          </button>
          <button
            onClick={() => setActiveTest("history")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTest === "history"
                ? "bg-purple-600 text-white shadow-md border-b-3 border-purple-800"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Hasil & Refleksi
          </button>
        </div>
      </div>

      {/* Comparison Gain Score Banner */}
      {pretestRecord && posttestRecord && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-2 border-emerald-300 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-700 flex items-center justify-center text-3xl shadow-sm">
              🏆
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">
                Peningkatan Skor Belajarmu Hebat! (Gain Score) 🌟
              </h4>
              <p className="text-xs text-slate-700 font-bold mt-0.5">
                Skor Awal (Pre-Test): <strong className="text-blue-700">{pretestRecord.score}</strong> → Skor Akhir (Post-Test):{" "}
                <strong className="text-emerald-700">{posttestRecord.score}</strong>
                {" "}(+{Math.max(0, posttestRecord.score - pretestRecord.score)} Poin Kenaikan!)
              </p>
            </div>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border-2 border-emerald-300 text-xs font-black shadow-xs">
            Kompetensi Tercapai! 🎉
          </span>
        </div>
      )}

      {/* Content: Quiz or Reflection History */}
      {activeTest === "history" ? (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-slate-100">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black text-slate-900">Catatan Refleksi Misi Pembelajaran Siswa 📝</h3>
            </div>

            {reflections.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-bold border-2 border-dashed border-slate-200 rounded-2xl p-6">
                Belum ada catatan refleksi. Mainkan tantangan di Game Arena untuk menulis kartu refleksimu!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(reflections || []).map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-0.5 rounded-lg text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                        Level {r.levelId}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {new Date(r.submittedAt).toLocaleDateString()} {new Date(r.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="text-xs font-black text-slate-700">
                      Penulis: <span className="text-slate-900">{r.userName}</span>
                    </div>

                    <div className="space-y-2 pt-1.5 border-t border-slate-200">
                      {(r.answers || []).map((a, i) => (
                        <div key={i} className="text-xs">
                          <p className="text-slate-700 font-bold leading-relaxed italic bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                            "{a.answer}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : isCompleted ? (
        /* Quiz Completed Screen */
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 max-w-xl mx-auto text-center space-y-5 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 border-2 border-amber-300 text-amber-700 flex items-center justify-center mx-auto shadow-md text-4xl">
            🎉
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">
              {activeTest === "posttest" ? "Post-Test" : "Pre-Test"} Selesai!
            </h3>
            <p className="text-xs text-slate-600 font-bold mt-1">
              Jawaban dan skormu telah tersimpan aman ke database LOOPYU!
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 inline-block px-12 shadow-inner">
            <div className="text-xs text-slate-500 font-black uppercase tracking-wider">Skor Pemahamanmu:</div>
            <div className="text-5xl font-black font-mono text-blue-600 mt-1">
              {testScore} / 100
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setActiveTest("history")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
            >
              Lihat Riwayat & Refleksi 📜
            </button>
          </div>
        </div>
      ) : (
        /* Quiz Question Card */
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-7 max-w-2xl mx-auto space-y-6 shadow-xl">
          {/* Question Header */}
          <div className="flex items-center justify-between pb-3.5 border-b-2 border-slate-100">
            <span className="text-xs font-black text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{activeTest === "posttest" ? "Post-Test Konseptual" : "Pre-Test Pengetahuan Awal"}</span>
            </span>
            <span className="text-xs font-black bg-slate-100 px-3 py-1 rounded-xl text-slate-700 border border-slate-200">
              Soal {currentQIndex + 1} / {ASSESSMENT_QUESTIONS.length}
            </span>
          </div>

          {/* Question Text */}
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-relaxed">
              {ASSESSMENT_QUESTIONS[currentQIndex].question}
            </h3>
          </div>

          {/* Options with Playful Colors */}
          <div className="space-y-3">
            {ASSESSMENT_QUESTIONS[currentQIndex].options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQIndex] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border-2 text-left text-xs transition-all ${
                    isSelected
                      ? "bg-blue-50 border-blue-500 text-blue-950 font-black shadow-md scale-[1.01]"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-white"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-xs ${
                      OPTION_COLORS[idx % OPTION_COLORS.length]
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed flex-1 font-bold">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Question Footer */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
            <button
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(currentQIndex - 1)}
              className="px-4 py-2 text-xs font-black text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-xl transition-colors"
            >
              Sebelumnya
            </button>

            <button
              disabled={selectedAnswers[currentQIndex] === undefined}
              onClick={handleNextQuestion}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-md border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 disabled:opacity-50 transition-all"
            >
              <span>{currentQIndex === ASSESSMENT_QUESTIONS.length - 1 ? "Selesaikan Tes! 🎯" : "Selanjutnya"}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
