import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { CodeBlock, Direction } from "../../types";
import { GridSimulation } from "./GridSimulation";
import { CommandBuilder } from "./CommandBuilder";
import { soundManager } from "../../utils/audio";
import { simulateLoopProgram, ExecutionStep } from "../../utils/loopEngine";
import { generateUserSolutionCode } from "../../utils/cCodeGenerator";
import { CompletionCertificateModal } from "./CompletionCertificateModal";
import { FailureAssistModal } from "./FailureAssistModal";
import confetti from "canvas-confetti";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  Lock,
  Zap,
  Check,
  Code2,
  AlertCircle,
  Lightbulb,
  Trophy,
  Undo2,
  Flame,
  ArrowRight,
  Home,
  Copy,
  Award,
  Repeat,
} from "lucide-react";

export const GameArena: React.FC<{ onBackToStart?: () => void }> = ({ onBackToStart }) => {
  const {
    currentLevel,
    setCurrentLevelId,
    levels,
    currentUser,
    addToast,
    recordLevelCompleted,
  } = useApp();

  const [showHomeScreen, setShowHomeScreen] = useState(false);
  const [robotPos, setRobotPos] = useState<{ x: number; y: number; dir: Direction }>({
    x: 1,
    y: 2,
    dir: "right",
  });
  const [collectedBatteryIds, setCollectedBatteryIds] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<CodeBlock[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activeLoopInfo, setActiveLoopInfo] = useState<{
    type: "for" | "while" | "do_while";
    iteration: number;
    total?: number;
    conditionText?: string;
  } | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [speed, setSpeed] = useState<number>(300);
  const [isFailed, setIsFailed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [showHintPanel, setShowHintPanel] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFinalReflectionModal, setShowFinalReflectionModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Time elapsed tracking
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    try {
      const savedFinal = localStorage.getItem("loopyu_final_elapsed_seconds");
      if (savedFinal) return Number(savedFinal);
      const start = localStorage.getItem("loopyu_start_timestamp");
      if (start) return Math.max(1, Math.floor((Date.now() - Number(start)) / 1000));
      return 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (!localStorage.getItem("loopyu_start_timestamp")) {
      localStorage.setItem("loopyu_start_timestamp", Date.now().toString());
    }

    const timer = setInterval(() => {
      const savedFinal = localStorage.getItem("loopyu_final_elapsed_seconds");
      if (savedFinal) {
        setElapsedSeconds(Number(savedFinal));
        return;
      }
      const start = localStorage.getItem("loopyu_start_timestamp");
      if (start) {
        setElapsedSeconds(Math.max(1, Math.floor((Date.now() - Number(start)) / 1000)));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Completed levels list (sanitized strictly for 8 levels)
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("loopyu_completed_levels");
      return saved
        ? (JSON.parse(saved) as number[]).filter((n) => typeof n === "number" && n >= 1 && n <= 8)
        : [];
    } catch {
      return [];
    }
  });

  const isLevelUnlocked = useCallback(
    (lvlId: number) => {
      return lvlId === 1 || completedLevels.includes(lvlId - 1) || completedLevels.includes(lvlId);
    },
    [completedLevels]
  );

  // Reflection responses
  const [reflectionAnswers, setReflectionAnswers] = useState({
    q1: "",
    q2: "",
  });

  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    isEfficient?: boolean;
  } | null>(null);

  // Failure tracking per level (triggers assistance system when failed > 5 times)
  const [failedAttemptsByLevel, setFailedAttemptsByLevel] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem("loopyu_failed_attempts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [showFailureAssistModal, setShowFailureAssistModal] = useState<boolean>(false);

  const currentFailCount = currentLevel ? (failedAttemptsByLevel[currentLevel.id] || 0) : 0;

  const handleSimulationFailure = useCallback(() => {
    setIsFailed(true);
    soundManager.play("lose");
    if (!currentLevel) return;

    setFailedAttemptsByLevel((prev) => {
      const newCount = (prev[currentLevel.id] || 0) + 1;
      const updated = { ...prev, [currentLevel.id]: newCount };
      try {
        localStorage.setItem("loopyu_failed_attempts", JSON.stringify(updated));
      } catch {}

      // Automatically show assistance modal if failed more than 5 times (> 5)
      if (newCount > 5) {
        setShowFailureAssistModal(true);
      }
      return updated;
    });
  }, [currentLevel]);

  const isRunningRef = useRef(false);
  isRunningRef.current = isRunning;
  const executionStepsRef = useRef<ExecutionStep[]>([]);
  const currentStepRef = useRef(0);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to ensure each block has a guaranteed ID
  const ensureBlockIds = (rawBlocks: any[]): CodeBlock[] => {
    return (rawBlocks || []).map((b, bIdx) => ({
      ...b,
      id: b.id || `blk-${Date.now()}-${bIdx}-${Math.random().toString(36).substring(2, 7)}`,
      commands: Array.isArray(b.commands)
        ? b.commands.map((c: any, cIdx: number) => ({
            ...c,
            id: c.id || `inner-${Date.now()}-${bIdx}-${cIdx}-${Math.random().toString(36).substring(2, 7)}`,
          }))
        : b.commands,
    }));
  };

  const resetSimulation = useCallback(() => {
    if (!currentLevel) return;
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    isRunningRef.current = false;
    setIsRunning(false);
    setActiveBlockId(null);
    setActiveLoopInfo(null);
    setRobotPos({ ...currentLevel.startPos });
    setCollectedBatteryIds([]);
    setStepIndex(0);
    currentStepRef.current = 0;
    setIsFailed(false);
    setIsSuccess(false);
    setFeedback(null);
  }, [currentLevel]);

  // Load level configuration
  useEffect(() => {
    if (currentLevel) {
      resetSimulation();
      setFeedback(null);
      setHintsUsedCount(0);
      setShowHintPanel(false);
      setShowSuccessModal(false);

      if (currentLevel.id === 1) {
        // Level 1: manual repetition starting with 1 pair [MAJU] + [AMBIL BATERAI]
        setBlocks(
          ensureBlockIds([
            { id: "lvl1-init-m1", type: "command", action: "move_forward" },
            { id: "lvl1-init-t1", type: "command", action: "take_battery" },
          ])
        );
      } else if (currentLevel.defaultBuggyCode && currentLevel.defaultBuggyCode.length > 0) {
        setBlocks(ensureBlockIds(currentLevel.defaultBuggyCode));
      } else {
        setBlocks([]);
      }
    }
  }, [currentLevel?.id]);

  const handleSelectLevel = (levelId: number) => {
    if (levelId < 1 || levelId > (levels.length || 8)) return;
    if (!isLevelUnlocked(levelId)) {
      soundManager.play("lose");
      addToast({
        title: `Level ${levelId} Terkunci`,
        message: `Selesaikan Level ${levelId - 1} terlebih dahulu untuk membuka level ini!`,
        type: "warning",
      });
      return;
    }
    if (isRunning) {
      resetSimulation();
    }
    setCurrentLevelId(levelId);
    setShowHomeScreen(false);
    soundManager.playClick();
  };

  // Run the full program simulation with animation
  const handleRun = () => {
    if (!currentLevel || isRunning) return;
    resetSimulation();

    if (blocks.length === 0) {
      setFeedback({
        type: "warning",
        title: "Workspace Masih Kosong",
        message: "Susun balok terlebih dahulu sebelum menekan tombol Jalankan!",
      });
      return;
    }

    const simResult = simulateLoopProgram(blocks, currentLevel);
    executionStepsRef.current = simResult.steps;
    currentStepRef.current = 0;
    setIsRunning(true);
    isRunningRef.current = true;
    setFeedback(null);

    if (simResult.steps.length === 0) {
      setIsRunning(false);
      isRunningRef.current = false;
      const emptyLoop = blocks.find(
        (b) => (b.type === "repeat" || b.type === "while" || b.type === "do_while") && (!b.commands || b.commands.length === 0)
      );
      if (emptyLoop) {
        const loopLabel = emptyLoop.type === "repeat" ? "FOR" : "WHILE";
        const hasTakeBattery = currentLevel.allowedBlocks.includes("take_battery");
        const actionAdvice = hasTakeBattery
          ? `Masukkan balok MAJU dan AMBIL BATERAI ke dalam wadah ${loopLabel}`
          : `Masukkan balok MAJU ke dalam wadah ${loopLabel}`;
        soundManager.play("lose");
        setFeedback({
          type: "warning",
          title: `Wadah Loop ${loopLabel} Masih Kosong`,
          message: `Balok ${loopLabel} belum memiliki perintah aksi di dalamnya! ${actionAdvice} sebelum menekan Jalankan.`,
        });
      } else {
        setFeedback({
          type: "warning",
          title: "Belum Ada Instruksi Aksi",
          message: "Tambahkan balok instruksi seperti MAJU sebelum menjalankan program.",
        });
      }
      return;
    }

    stepTimerRef.current = setInterval(() => {
      const idx = currentStepRef.current;
      const steps = executionStepsRef.current;

      if (idx >= steps.length || !isRunningRef.current) {
        if (stepTimerRef.current) {
          clearInterval(stepTimerRef.current);
          stepTimerRef.current = null;
        }
        setIsRunning(false);
        isRunningRef.current = false;
        setActiveBlockId(null);
        setActiveLoopInfo(null);

        // Evaluate completion
        if (simResult.crashed) {
          handleSimulationFailure();
          setFeedback({
            type: "error",
            title: "Tabrakan Terjadi! 💥",
            message: simResult.crashReason || "Robot menabrak pembatas arena atau rintangan.",
          });
        } else if (simResult.infiniteLoop) {
          handleSimulationFailure();
          setFeedback({
            type: "error",
            title: "Infinite Loop Terdeteksi! 🔄",
            message: "Loop tidak pernah berhenti! Periksa kondisi penghenti pada perulanganmu.",
          });
        } else if (!simResult.conceptValid) {
          handleSimulationFailure();
          setFeedback({
            type: "warning",
            title: "Konsep Perulangan Belum Tepat 💡",
            message: simResult.conceptFeedback || "Gunakan balok perulangan yang sesuai dengan fokus level ini.",
          });
        } else if (simResult.success) {
          setIsSuccess(true);
          soundManager.play("win");
          confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });

          // Record completed level in local and global state
          setCompletedLevels((prev) => {
            if (!prev.includes(currentLevel.id)) {
              const updated = [...prev, currentLevel.id];
              try {
                localStorage.setItem("loopyu_completed_levels", JSON.stringify(updated));
              } catch {}
              return updated;
            }
            return prev;
          });

          // Sync with context
          recordLevelCompleted(currentLevel.id);

          // If Level 8 or all 8 missions completed, freeze completion timer
          if (currentLevel.id === 8 || currentLevel.id === totalLevelsCount || completedLevels.length >= totalLevelsCount - 1) {
            const start = localStorage.getItem("loopyu_start_timestamp");
            const finalSeconds = start ? Math.max(30, Math.floor((Date.now() - Number(start)) / 1000)) : 480;
            localStorage.setItem("loopyu_final_elapsed_seconds", finalSeconds.toString());
            setElapsedSeconds(finalSeconds);
          }

          setFeedback({
            type: "success",
            title: "Level Selesai! ⭐",
            message: simResult.isEfficient
              ? `Solusi sangat optimal! Menggunakan ${simResult.totalBlocksUsed} balok.`
              : `Bagus! Semua sasaran tercapai dengan ${simResult.totalBlocksUsed} balok.`,
            isEfficient: simResult.isEfficient,
          });

          // Open Success Modal
          setShowSuccessModal(true);
        } else {
          handleSimulationFailure();
          if (!simResult.hasTakeBatteryCommand) {
            setFeedback({
              type: "warning",
              title: "Perintah AMBIL BATERAI Wajib Digunakan 🔋",
              message: "Level tetap gagal! Kamu belum memasukkan balok perintah 'AMBIL BATERAI'. Robot harus secara aktif mengambil baterai.",
            });
          } else {
            const needsTakeBattery = currentLevel.allowedBlocks.includes("take_battery");
            let hintMsg = `Robot baru mencapai ${simResult.collectedBatteryIds.length} dari ${currentLevel.targetBatteries.length} sasaran.`;
            if (needsTakeBattery && simResult.collectedBatteryIds.length === 0) {
              hintMsg += " Pastikan kamu memasukkan balok AMBIL BATERAI ke dalam wadah loop setelah balok MAJU!";
            } else if (needsTakeBattery && simResult.collectedBatteryIds.length < currentLevel.targetBatteries.length) {
              hintMsg += " Periksa kembali urutan [MAJU -> AMBIL BATERAI] dan jumlah pengulangan loop.";
            }
            setFeedback({
              type: "warning",
              title: "Sasaran Belum Tercapai 🔋",
              message: hintMsg,
            });
          }
        }

        return;
      }

      // Execute current animation step
      const step = steps[idx];
      setActiveBlockId(step.blockId);
      setRobotPos({ ...step.robotPos });
      setCollectedBatteryIds(step.collectedBatteryIds);

      if (step.loopType) {
        setActiveLoopInfo({
          type: step.loopType,
          iteration: step.iteration || 1,
          total: step.totalIterations,
          conditionText: step.conditionText,
        });
      } else {
        setActiveLoopInfo(null);
      }

      // Play audio feedback
      const prevCount = idx > 0 ? steps[idx - 1].collectedBatteryIds.length : 0;
      if (step.collectedBatteryIds.length > prevCount) {
        soundManager.playBattery();
      } else if (step.action === "move_forward") {
        soundManager.playStep();
      } else if (step.action === "turn_left" || step.action === "turn_right") {
        soundManager.playTurn();
      } else if (step.action === "take_battery") {
        soundManager.playBattery();
      }

      currentStepRef.current += 1;
      setStepIndex(currentStepRef.current);
    }, speed);
  };

  const handlePause = () => {
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    isRunningRef.current = false;
    setIsRunning(false);
  };

  // Step one instruction forward
  const handleStep = () => {
    if (!currentLevel || isRunning) return;
    if (executionStepsRef.current.length === 0 || currentStepRef.current === 0) {
      const simResult = simulateLoopProgram(blocks, currentLevel);
      executionStepsRef.current = simResult.steps;
      currentStepRef.current = 0;
    }

    const steps = executionStepsRef.current;
    if (currentStepRef.current < steps.length) {
      const step = steps[currentStepRef.current];
      setActiveBlockId(step.blockId);
      setRobotPos({ ...step.robotPos });
      setCollectedBatteryIds(step.collectedBatteryIds);
      if (step.loopType) {
        setActiveLoopInfo({
          type: step.loopType,
          iteration: step.iteration || 1,
          total: step.totalIterations,
          conditionText: step.conditionText,
        });
      }

      if (step.action === "move_forward") soundManager.playStep();
      else if (step.action === "turn_left" || step.action === "turn_right") soundManager.playTurn();
      else if (step.action === "take_battery") soundManager.playBattery();

      currentStepRef.current += 1;
      setStepIndex(currentStepRef.current);
    }
  };

  if (!currentLevel) return null;

  const totalBatteries = currentLevel.targetBatteries.length;
  const currentCollected = collectedBatteryIds.length;
  const isLevelCompleted = completedLevels.includes(currentLevel.id);
  const totalLevelsCount = levels.length || 8;
  const teamProgressPercent = Math.round((completedLevels.length / totalLevelsCount) * 100);

  // Student Home Screen Component
  if (showHomeScreen) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center text-center space-y-8 animate-fadeIn">
        {/* Brand Hero */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Game Edukasi Bahasa C</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            LOOPYU
          </h1>
          <p className="text-base text-slate-600 font-medium">
            Belajar logika perulangan C melalui puzzle simulasi robot interaktif.
          </p>
        </div>

        {/* Start / Continue Button */}
        <button
          onClick={() => setShowHomeScreen(false)}
          className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-base shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>MULAI MAIN</span>
        </button>

        {/* Level Progress Indicator: ● ● ● ○ ○ ○ */}
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Progres Belajar (8 Level)
          </div>

          <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
            {Array.from({ length: totalLevelsCount }).map((_, idx) => {
              const lvlNum = idx + 1;
              const isDone = completedLevels.includes(lvlNum);
              const isCurrent = currentLevel.id === lvlNum;
              const isUnlocked = isLevelUnlocked(lvlNum);

              return (
                <button
                  key={lvlNum}
                  onClick={() => handleSelectLevel(lvlNum)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                    isDone
                      ? "bg-emerald-500 text-white shadow-xs hover:bg-emerald-600"
                      : isCurrent
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                      : !isUnlocked
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  title={!isUnlocked ? `Level ${lvlNum} (Terkunci)` : `Level ${lvlNum}`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4" />
                  ) : !isUnlocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    lvlNum
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-sm font-semibold text-slate-700">
            Level {currentLevel.id} dari {totalLevelsCount} ({completedLevels.length} Selesai)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 space-y-3">
      {/* Top Header Bar: LOOPYU, Level X / 8, Status, Home button */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onBackToStart) onBackToStart();
              else setShowHomeScreen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="Kembali ke Beranda"
          >
            <Home className="w-3.5 h-3.5 text-indigo-600" />
            <span>Beranda</span>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          {/* Level navigation buttons */}
          <div className="flex items-center gap-1">
            <button
              disabled={currentLevel.id <= 1}
              onClick={() => handleSelectLevel(currentLevel.id - 1)}
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 cursor-pointer disabled:cursor-not-allowed"
              title="Level sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="text-sm font-extrabold text-slate-900 px-1">
              Level {currentLevel.id} / {totalLevelsCount}
            </span>

            <button
              disabled={currentLevel.id >= totalLevelsCount || !completedLevels.includes(currentLevel.id)}
              onClick={() => handleSelectLevel(currentLevel.id + 1)}
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 cursor-pointer disabled:cursor-not-allowed"
              title={
                currentLevel.id >= totalLevelsCount
                  ? "Level terakhir"
                  : !completedLevels.includes(currentLevel.id)
                  ? "Selesaikan level ini terlebih dahulu untuk membuka level berikutnya"
                  : "Level selanjutnya"
              }
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-800">
              {currentLevel.name}
            </span>
            {currentLevel.difficultyStars && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <span>{Array.from({ length: currentLevel.difficultyStars }).map((_, i) => "⭐").join("")}</span>
                <span className="text-[10px] text-slate-600">{currentLevel.difficulty}</span>
              </span>
            )}
            <span className="hidden md:inline text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Fokus: {currentLevel.focus}
            </span>
            <span className="hidden lg:inline text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              {currentLevel.stageEL}
            </span>
          </div>
        </div>

        {/* Right Header Status: Target Batteries and Certificate */}
        <div className="flex items-center gap-2">
          {/* Target Status */}
          <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>
              {currentCollected} / {totalBatteries} {!currentLevel.allowedBlocks.includes("take_battery") ? "Pos Sasaran" : "Sasaran"}
            </span>
          </div>

          {/* Certificate & Reflection trigger */}
          {(completedLevels.length >= 1 || currentLevel.id === totalLevelsCount) && (
            <button
              onClick={() => setShowCertificateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors cursor-pointer"
              title="Hasil Misi & Sertifikat Kelulusan"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Sertifikat</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 3-Column Layout: Level Selector (Left), Game Board (Center), Blockly Workspace (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Left Column: 8-Level Selector */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Pilihan Misi 1-8
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {completedLevels.length} / {totalLevelsCount} Selesai
            </span>
          </div>

          <div className="space-y-1.5">
            {levels.map((lvl) => {
              const isSelected = lvl.id === currentLevel.id;
              const isDone = completedLevels.includes(lvl.id);

              return (
                <button
                  key={lvl.id}
                  onClick={() => handleSelectLevel(lvl.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50 border-2 border-indigo-500 text-indigo-950 font-bold shadow-xs"
                      : isDone
                      ? "bg-emerald-50/50 hover:bg-emerald-100/50 text-slate-800 border border-emerald-200"
                      : "hover:bg-slate-50 text-slate-700 border border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {/* Status Indicator Icon: ✓ (done), ● (current) */}
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isDone
                          ? "bg-emerald-500 text-white"
                          : isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 font-extrabold"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : (
                        lvl.id
                      )}
                    </span>
                    <span className="truncate">{lvl.name}</span>
                  </div>

                  {isDone ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
                      Selesai ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">
                      Misi {lvl.id}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Concept Hint Banner */}
          <div className="pt-2.5 border-t border-slate-100 text-[11px] space-y-2">
            <div className="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-100 text-indigo-950 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-indigo-700">Fokus: {currentLevel.focus}</span>
                <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  {currentLevel.stageEL}
                </span>
              </div>
              {currentLevel.difficulty && (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-700 font-bold bg-white/80 px-2 py-0.5 rounded-md border border-amber-100">
                  <span>{Array.from({ length: currentLevel.difficultyStars || 1 }).map((_, i) => "⭐").join("")}</span>
                  <span className="text-slate-700">{currentLevel.difficulty}</span>
                </div>
              )}
              {currentLevel.challengeExample && (
                <p className="text-[11px] text-slate-700 font-medium">
                  <strong>Tantangan:</strong> {currentLevel.challengeExample}
                </p>
              )}
            </div>

            <div>
              <p className="font-semibold text-slate-700">Instruksi Misi:</p>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{currentLevel.instruction}</p>
            </div>

            {/* Level 1 Guided Tutorial Helper Banner */}
            {currentLevel.id === 1 && (
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>🎓 Panduan Tutorial Pemula</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  Balok awal sudah disiapkan: <strong>[MAJU ➔ AMBIL BATERAI ➔ MAJU]</strong>. Cukup klik atau tarik 1 balok <strong>AMBIL BATERAI</strong> dari palet di kanan ke urutan terakhir, lalu klik tombol hijau <strong>Jalankan Program</strong>!
                </p>
              </div>
            )}

            {/* Level 2 Guidance Banner */}
            {currentLevel.id === 2 && (
              <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl text-xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-1.5 font-bold text-purple-900 text-xs">
                  <Repeat className="w-4 h-4 text-purple-600" />
                  <span>💡 Tantangan Mudah: Loop FOR (Maks 4 Balok)</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  Tarik balok <strong>FOR (...) repeat 4 kali</strong> ke workspace, lalu masukkan balok <strong>MAJU</strong> dan <strong>AMBIL BATERAI</strong> ke dalamnya. Perhatikan: jumlah balok dibatasi maksimal 4 balok!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Game Board Canvas & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Game Canvas Container */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col items-center justify-center min-h-[340px]">
            <GridSimulation
              level={currentLevel}
              robotPos={robotPos}
              collectedBatteryIds={collectedBatteryIds}
              isFailed={isFailed}
              isSuccess={isSuccess}
              stepCount={stepIndex}
              activeLoopInfo={activeLoopInfo}
            />
          </div>

          {/* Control Bar: RESET, RUN, PAUSE, STEP, HINT, SPEED */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              {isRunning ? (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Jeda</span>
                </button>
              ) : (
                <button
                  onClick={handleRun}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Jalankan</span>
                </button>
              )}

              <button
                onClick={handleStep}
                disabled={isRunning}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold transition-colors"
                title="Jalankan satu instruksi demi satu instruksi"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Langkah</span>
              </button>

              <button
                onClick={resetSimulation}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Reset posisi robot"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Speed Controller */}
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-[11px] font-semibold text-slate-600">
                <button
                  onClick={() => setSpeed(500)}
                  className={`px-2 py-0.5 rounded ${speed === 500 ? "bg-white text-slate-900 shadow-xs" : ""}`}
                >
                  0.5x
                </button>
                <button
                  onClick={() => setSpeed(300)}
                  className={`px-2 py-0.5 rounded ${speed === 300 ? "bg-white text-slate-900 shadow-xs" : ""}`}
                >
                  1x
                </button>
                <button
                  onClick={() => setSpeed(120)}
                  className={`px-2 py-0.5 rounded ${speed === 120 ? "bg-white text-slate-900 shadow-xs" : ""}`}
                >
                  2x
                </button>
              </div>

              {/* Failure Assistance Button (> 5 fails) */}
              {currentFailCount > 5 && (
                <button
                  onClick={() => setShowFailureAssistModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-xs font-black transition-all animate-pulse shadow-xs cursor-pointer"
                  title="Buka panduan khusus (gagal > 5x)"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>Bantuan Khusus ({currentFailCount}x)</span>
                </button>
              )}

              {/* Hint button */}
              <button
                onClick={() => {
                  setShowHintPanel(!showHintPanel);
                  if (hintsUsedCount === 0) setHintsUsedCount(1);
                }}
                className={`p-2 rounded-xl border transition-colors ${
                  showHintPanel
                    ? "bg-amber-100 border-amber-300 text-amber-800"
                    : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                }`}
                title="Bantuan / Petunjuk"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Hints Accordion */}
          {showHintPanel && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Petunjuk Penyelesaian</span>
              </div>
              <div className="space-y-1.5 text-slate-700">
                <p className="p-2 bg-white/90 rounded-lg border border-amber-100">
                  <strong>Petunjuk 1:</strong> {currentLevel.hints.hint1}
                </p>
                {currentLevel.hints.hint2 && (
                  <p className="p-2 bg-white/90 rounded-lg border border-amber-100">
                    <strong>Petunjuk 2:</strong> {currentLevel.hints.hint2}
                  </p>
                )}
                {currentLevel.hints.hint3 && (
                  <p className="p-2 bg-white/90 rounded-lg border border-amber-100 font-mono text-[11px] text-indigo-900">
                    <strong>Bentuk C:</strong> {currentLevel.hints.hint3}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Feedback Result Banner */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
                feedback.type === "success"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : feedback.type === "error"
                  ? "bg-rose-50 border-rose-300 text-rose-900"
                  : "bg-amber-50 border-amber-300 text-amber-900"
              }`}
            >
              <div>
                <p className="font-bold">{feedback.title}</p>
                <p className="mt-0.5">{feedback.message}</p>
                {currentFailCount > 5 && (feedback.type === "error" || feedback.type === "warning") && (
                  <button
                    onClick={() => setShowFailureAssistModal(true)}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-[11px] font-black shadow-xs cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Buka Panduan Solusi (Gagal {currentFailCount}x)</span>
                  </button>
                )}
              </div>

              {feedback.type === "success" && currentLevel.id < totalLevelsCount && (
                <button
                  onClick={() => handleSelectLevel(currentLevel.id + 1)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors flex-shrink-0"
                >
                  <span>Level {currentLevel.id + 1}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Blockly-style Workspace */}
        <div className="lg:col-span-4 h-[650px]">
          <CommandBuilder
            level={currentLevel}
            blocks={blocks}
            setBlocks={setBlocks}
            disabled={isRunning}
            activeBlockId={activeBlockId}
            isRunning={isRunning}
          />
        </div>
      </div>

      {/* Success Modal: LEVEL SELESAI (Compact & User-Facing) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-4 space-y-3 animate-scaleUp">
            {/* Header: Title + Success Status */}
            <div className="text-center space-y-0.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Level {currentLevel.id} Selesai</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                ✓ Berhasil Diselesaikan!
              </h3>
              <p className="text-[11px] text-slate-500">
                Semua sasaran tercapai • {currentCollected} dari {totalBatteries} baterai terkumpul
              </p>
            </div>

            {/* Compact Code Output Box */}
            <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800 text-left font-mono">
              <div className="flex items-center justify-between text-slate-400 pb-1 mb-1 border-b border-slate-800/80">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Kode Utama
                </span>
                <button
                  onClick={() => {
                    const code = generateUserSolutionCode(blocks);
                    navigator.clipboard.writeText(code);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Salin kode"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-emerald-300 text-xs leading-relaxed max-h-24 overflow-y-auto whitespace-pre font-mono">
                {generateUserSolutionCode(blocks) || "// (Tidak ada perintah)"}
              </pre>
            </div>

            {/* Compact Action Buttons */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  resetSimulation();
                }}
                className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Ulangi
              </button>

              {currentLevel.id < totalLevelsCount ? (
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    handleSelectLevel(currentLevel.id + 1);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  <span>Level Berikutnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setShowCertificateModal(true);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Sertifikat Akhir</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Optional Final Reflection Modal (Only for Level 6 or Manual Trigger) */}
      {showFinalReflectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-base">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Refleksi Pembelajaran Loop</span>
              </div>
              <button
                onClick={() => setShowFinalReflectionModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Jawab 2 pertanyaan singkat ini untuk merefleksikan pengalamanmu belajar perulangan C:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  1. Apa yang kamu pelajari tentang perbedaan perulangan FOR dan WHILE?
                </label>
                <textarea
                  value={reflectionAnswers.q1}
                  onChange={(e) => setReflectionAnswers({ ...reflectionAnswers, q1: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  placeholder="Contoh: FOR digunakan saat jumlah perulangan pasti, WHILE saat bergantung kondisi..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  2. Apa bagian yang paling menantang saat menyusun kode perulangan?
                </label>
                <textarea
                  value={reflectionAnswers.q2}
                  onChange={(e) => setReflectionAnswers({ ...reflectionAnswers, q2: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  placeholder="Contoh: Menentukan kondisi henti pathClear() agar tidak terjadi infinite loop..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowFinalReflectionModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setShowFinalReflectionModal(false);
                  addToast({
                    title: "Refleksi Tersimpan!",
                    message: "Terima kasih telah merefleksikan pemahaman perulangan C!",
                    type: "success",
                  });
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
              >
                Simpan Jawaban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failure Assistance Modal (Triggers when failed > 5 times) */}
      <FailureAssistModal
        isOpen={showFailureAssistModal}
        onClose={() => setShowFailureAssistModal(false)}
        level={currentLevel}
        failCount={currentFailCount}
        onApplyRecommendedBlocks={(recommendedBlocks) => {
          setBlocks(recommendedBlocks);
          resetSimulation();
          addToast({
            type: "info",
            title: "Balok Solusi Dipasang 💡",
            message: "Balok rekomendasi telah dipasang ke workspace. Kamu dapat mempelajarinya dan menekan Jalankan!",
          });
        }}
      />

      {/* Completion & Certificate Modal */}
      <CompletionCertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        completedCount={completedLevels.length}
        totalMissions={totalLevelsCount}
        elapsedSeconds={elapsedSeconds}
      />
    </div>
  );
};
