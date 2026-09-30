import React from "react";
import { useApp } from "../../context/AppContext";
import {
  ClipboardList,
  Gamepad2,
  HelpCircle,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Users2,
  Award,
  AlertCircle,
  Play,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export const AssignmentDashboard: React.FC = () => {
  const {
    assignments,
    currentAssignment,
    setCurrentAssignment,
    assignmentProgress,
    learningMode,
    currentTeam,
    appUser,
    setActiveTab,
    setCurrentLevelId,
    setActiveQuizId,
    setActiveTestId,
    setActiveReflectionId,
    addToast,
  } = useApp();

  const handleStartGameLevel = (levelId: number) => {
    setCurrentLevelId(levelId);
    setActiveTab("arena");
    addToast({
      title: "Membuka Level Game",
      message: `Memulai tantangan Level ${levelId} sesuai tugas!`,
    });
  };

  const handleOpenQuiz = (quizId: string) => {
    setActiveQuizId(quizId);
    setActiveTab("quiz");
  };

  const handleOpenReflection = (reflectionId: string) => {
    setActiveReflectionId(reflectionId);
    setActiveTab("reflection");
  };

  const handleOpenTest = (testId: string) => {
    setActiveTestId(testId);
    setActiveTab("test");
  };

  const activeAsg = currentAssignment || (assignments && assignments.length > 0 ? assignments[0] : null);
  const targetLevels: number[] = activeAsg ? (activeAsg.targetLevels || activeAsg.levelIds || [1, 2, 3]) : [];
  const completedLevels: number[] = assignmentProgress ? (assignmentProgress.completedLevels || assignmentProgress.completedLevelIds || []) : [];

  // Pipeline step status calculation
  const isModeSelected = true;
  const isAssignmentSelected = !!activeAsg;
  const isGameCompleted =
    targetLevels.length > 0 &&
    targetLevels.every((lvl) => completedLevels.includes(lvl));
  const isQuizCompleted = !!assignmentProgress?.quizCompleted;
  const isReflectionCompleted = !!assignmentProgress?.reflectionCompleted;
  const isTestCompleted = !!assignmentProgress?.testCompleted;

  const steps = [
    { id: 1, label: "Pilih Mode", status: "completed", desc: learningMode === "TEAM" ? "Mode Tim" : "Mode Mandiri" },
    { id: 2, label: "Tugas & Misi", status: isAssignmentSelected ? "completed" : "current", desc: activeAsg ? activeAsg.title : "Pilih tugas" },
    { id: 3, label: "Game Arena", status: isGameCompleted ? "completed" : "current", desc: `${completedLevels.length}/${targetLevels.length || 5} Level Selesai` },
    { id: 4, label: "Kuis Loop", status: isQuizCompleted ? "completed" : isGameCompleted ? "current" : "pending", desc: isQuizCompleted ? `Nilai: ${assignmentProgress?.quizScore}` : "Tes Pemahaman" },
    { id: 5, label: "Refleksi", status: isReflectionCompleted ? "completed" : isQuizCompleted ? "current" : "pending", desc: isReflectionCompleted ? "Selesai" : "Refleksi Diri/Tim" },
    { id: 6, label: "Ujian Akhir", status: isTestCompleted ? "completed" : isReflectionCompleted ? "current" : "pending", desc: isTestCompleted ? `Nilai: ${assignmentProgress?.testScore}` : "Tes Formal" },
    { id: 7, label: "Hasil Akhir", status: isTestCompleted ? "completed" : "pending", desc: assignmentProgress ? `Total: ${assignmentProgress.score} Poin` : "Penilaian" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">Alur Belajar & Penugasan</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                learningMode === "TEAM" ? "bg-indigo-100 text-indigo-800" : "bg-emerald-100 text-emerald-800"
              }`}>
                {learningMode === "TEAM" ? `Tim: ${currentTeam?.teamName || "Belum ada tim"}` : "Belajar Mandiri"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ikuti tahapan pembelajaran terstruktur: Game Arena → Kuis → Refleksi → Ujian Formal
            </p>
          </div>
        </div>

        {/* Quick Target Level Button */}
        {activeAsg && (
          <button
            onClick={() => handleStartGameLevel(targetLevels[0] || 1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Lanjutkan Misi Game</span>
          </button>
        )}
      </div>

      {/* 7-Step Learning Pipeline Visualizer */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tahapan Pembelajaran LOOPYU (Pedagogical Pipeline)
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {learningMode === "TEAM" ? "Progres Bersama Tim" : "Progres Individu"}
          </span>
        </div>

        {/* Pipeline Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {steps.map((s, idx) => {
            const isDone = s.status === "completed";
            const isCurr = s.status === "current";

            return (
              <div
                key={s.id}
                className={`p-3 rounded-xl border transition-all relative ${
                  isDone
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : isCurr
                    ? "bg-blue-50/80 border-blue-300 text-blue-950 ring-2 ring-blue-500/20"
                    : "bg-slate-50/60 border-slate-200/60 text-slate-400 opacity-80"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                    isDone ? "bg-emerald-200 text-emerald-800" : isCurr ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    Tahap {s.id}
                  </span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className="font-bold text-xs truncate">{s.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Active Assignment & Module Cards */}
      {activeAsg ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Assignment Details (Cols 1 & 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                    <span>Tugas Aktif</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      Tenggat: {new Date(activeAsg.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">{activeAsg.title}</h2>
                  <p className="text-xs text-slate-600 mt-1">{activeAsg.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Nilai</span>
                  <span className="text-2xl font-black text-blue-600">
                    {assignmentProgress ? assignmentProgress.score : 0}
                  </span>
                  <span className="text-xs text-slate-400 block">/ 100 Poin</span>
                </div>
              </div>

              {/* Module Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6">
                {/* 1. Game Arena Card */}
                <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Gamepad2 className="w-4 h-4" />
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isGameCompleted ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {completedLevels.length}/{targetLevels.length} Level
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">1. Tantangan Game Arena</div>
                    <p className="text-xs text-slate-500 mt-0.5 mb-3">
                      Selesaikan Level {targetLevels.join(", ")} menggunakan logika perulangan Blockly C.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-200/60">
                    {targetLevels.map((lvl) => {
                      const done = completedLevels.includes(lvl);
                      return (
                        <button
                          key={lvl}
                          onClick={() => handleStartGameLevel(lvl)}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                            done
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-white text-slate-700 border border-slate-300 hover:border-blue-500 hover:text-blue-600"
                          }`}
                        >
                          Lvl {lvl} {done ? "✓" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Kuis Loop Card */}
                <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isQuizCompleted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {isQuizCompleted ? `Skor: ${assignmentProgress?.quizScore}` : "Wajib"}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">2. Kuis Konsep Perulangan</div>
                    <p className="text-xs text-slate-500 mt-0.5 mb-3">
                      Tes pemahaman for-loop, while-loop, update counter, dan pencegahan infinite loop.
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenQuiz(activeAsg.quizId || "quiz-loop-01")}
                    className={`w-full py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                      isQuizCompleted
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-amber-500 hover:bg-amber-600 text-white"
                    }`}
                  >
                    <span>{isQuizCompleted ? "Ulangi / Lihat Kuis" : "Mulai Kuis"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 3. Refleksi Card */}
                <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isReflectionCompleted ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}>
                        {isReflectionCompleted ? "Selesai" : "Belum Diisi"}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">3. Refleksi Pembelajaran</div>
                    <p className="text-xs text-slate-500 mt-0.5 mb-3">
                      Tuliskan pemahaman konsep perulangan C dan pengalaman kolaborasi bersama tim.
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenReflection(activeAsg.reflectionTemplateId || "refl-01")}
                    className={`w-full py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                      isReflectionCompleted
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    <span>{isReflectionCompleted ? "Lihat Jawaban Refleksi" : "Tulis Refleksi"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 4. Formal Test Card */}
                <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isTestCompleted ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800"
                      }`}>
                        {isTestCompleted ? `Skor: ${assignmentProgress?.testScore}` : "Ujian Formal"}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">4. Ujian Pemrograman C</div>
                    <p className="text-xs text-slate-500 mt-0.5 mb-3">
                      Ujian formal terwaktu untuk menguji analisa output loop dan sintaksis bahasa C.
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenTest(activeAsg.testId || "test-mid-loop")}
                    className={`w-full py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                      isTestCompleted
                        ? "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    <span>{isTestCompleted ? "Hasil Ujian Tersimpan" : "Mulai Ujian Formal"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: All Assignments List */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Daftar Penugasan Kelas
              </h3>

              <div className="space-y-2.5">
                {(assignments || []).map((asg) => {
                  const isCurrent = activeAsg && asg.id === activeAsg.id;
                  const asgLevels = asg.targetLevels || asg.levelIds || [];
                  return (
                    <button
                      key={asg.id}
                      onClick={() => setCurrentAssignment(asg)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-500/20 shadow-2xs"
                          : "bg-slate-50/50 border-slate-200/70 hover:bg-slate-100/60"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-blue-600 uppercase">{asg.mode}</span>
                        <span>Level: {asgLevels.join(", ")}</span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 line-clamp-1">{asg.title}</div>
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{asg.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Educational Info Note */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/60 to-orange-50/40 border border-amber-200/80 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Tips Belajar Efektif</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Di Blockly C, setiap kali Anda menyusun perulangan <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">for</code>, perhatikan nilai awal, batas kondisi, dan langkah penambahan (i++). Hindari loop tak berhingga agar baterai robot tidak habis!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">Belum Ada Tugas Aktif</h3>
          <p className="text-xs text-slate-400 mt-1">
            Guru belum menerbitkan tugas baru untuk kelas ini.
          </p>
        </div>
      )}
    </div>
  );
};
