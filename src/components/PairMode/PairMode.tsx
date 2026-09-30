import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { CodeBlock, LevelConfig } from "../../types";
import { socketClient } from "../../services/socket";
import { soundManager } from "../../utils/audio";
import { GridSimulation } from "../GameArena/GridSimulation";
import { CommandBuilder } from "../GameArena/CommandBuilder";
import {
  Users2,
  Code2,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  Send,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const PairMode: React.FC = () => {
  const {
    currentUser,
    team,
    currentLevel,
    levels,
    setCurrentLevelId,
    onlineUsers,
  } = useApp();

  const [role, setRole] = useState<"driver" | "tester">("driver");
  const [partner, setPartner] = useState<string>("usr-2");
  const [blocks, setBlocks] = useState<CodeBlock[]>([]);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([
    {
      sender: "Alya (Tester)",
      text: "Halo! Saya sudah siap menguji logika perulangan di Level ini bareng kamu! 🚀",
      time: "Baru saja",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [remoteEditNotice, setRemoteEditNotice] = useState<string | null>(null);

  // Simulation state
  const [robotPos, setRobotPos] = useState({ x: 1, y: 2, dir: "right" as const });
  const [collectedBatteryIds, setCollectedBatteryIds] = useState<string[]>([]);
  const [stepCount, setStepCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [speed, setSpeed] = useState(350);

  // Sync initial blocks from level
  useEffect(() => {
    if (currentLevel) {
      setRobotPos({ ...currentLevel.startPos });
      setCollectedBatteryIds([]);
      setStepCount(0);
      setIsSuccess(false);
      setIsFailed(false);

      if (currentLevel.id === 2) {
        setBlocks([
          {
            id: "rep-pair",
            type: "repeat",
            count: 4,
            commands: [
              { id: "pair-m1", type: "command", action: "move_forward" },
              { id: "pair-b1", type: "command", action: "take_battery" },
            ],
          },
        ]);
      } else {
        setBlocks([]);
      }
    }
  }, [currentLevel?.id]);

  // Listen to remote WebSocket events for Pair Mode
  useEffect(() => {
    const unsubPairCode = socketClient.on("pair:code_synced", (payload) => {
      if (payload.blocks) {
        setBlocks(payload.blocks);
        soundManager.playModifyBlock();
        setRemoteEditNotice(`Sinkronisasi real-time diterima dari ${payload.senderName || "teman tim"}`);
        setTimeout(() => setRemoteEditNotice(null), 3000);
      }
    });

    const unsubPairSim = socketClient.on("pair:simulation_triggered", (payload) => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: payload.senderName || "Teman Tim",
          text: `🚀 Menjalankan uji simulasi bersama untuk Level ${payload.levelId}!`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    });

    return () => {
      unsubPairCode();
      unsubPairSim();
    };
  }, []);

  // Broadcast code changes to partner
  const handleBlocksChange: React.Dispatch<React.SetStateAction<CodeBlock[]>> = (val) => {
    setBlocks((prev) => {
      const updated = typeof val === "function" ? val(prev) : val;
      socketClient.send("pair:code_change", {
        senderId: currentUser.id,
        senderName: currentUser.name,
        levelId: currentLevel?.id,
        blocks: updated,
      });
      return updated;
    });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      sender: currentUser.name,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");
    soundManager.play("step");
  };

  // Run shared test simulation
  const handleRunTest = async () => {
    if (!currentLevel) return;
    setIsRunning(true);
    setIsFailed(false);
    setIsSuccess(false);

    socketClient.send("pair:run_simulation", {
      senderName: currentUser.name,
      levelId: currentLevel.id,
    });

    soundManager.play("step");

    let curPos = { ...currentLevel.startPos };
    let curCollected: string[] = [];
    let curSteps = 0;
    setRobotPos(curPos);
    setCollectedBatteryIds([]);
    setStepCount(0);

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Simple execution loop for pair mode
    for (const b of blocks) {
      if (b.type === "command") {
        if (b.action === "move_forward") {
          let nextX = curPos.x;
          let nextY = curPos.y;
          if (curPos.dir === "right") nextX++;
          else if (curPos.dir === "down") nextY++;
          else if (curPos.dir === "left") nextX--;
          else if (curPos.dir === "up") nextY--;
          curPos = { ...curPos, x: nextX, y: nextY };
          curSteps++;
          setRobotPos(curPos);
          setStepCount(curSteps);
        } else if (b.action === "take_battery") {
          const bat = currentLevel.targetBatteries.find(
            (item) => item.x === curPos.x && item.y === curPos.y
          );
          if (bat && !curCollected.includes(bat.id)) {
            curCollected.push(bat.id);
            setCollectedBatteryIds([...curCollected]);
            soundManager.play("battery");
          }
        }
        await sleep(speed);
      } else if (b.type === "repeat") {
        for (let i = 0; i < b.count; i++) {
          for (const sub of b.commands) {
            if (sub.type === "command") {
              if (sub.action === "move_forward") {
                let nextX = curPos.x;
                let nextY = curPos.y;
                if (curPos.dir === "right") nextX++;
                else if (curPos.dir === "down") nextY++;
                else if (curPos.dir === "left") nextX--;
                else if (curPos.dir === "up") nextY--;
                curPos = { ...curPos, x: nextX, y: nextY };
                curSteps++;
                setRobotPos(curPos);
                setStepCount(curSteps);
              } else if (sub.action === "take_battery") {
                const bat = currentLevel.targetBatteries.find(
                  (item) => item.x === curPos.x && item.y === curPos.y
                );
                if (bat && !curCollected.includes(bat.id)) {
                  curCollected.push(bat.id);
                  setCollectedBatteryIds([...curCollected]);
                  soundManager.play("battery");
                }
              }
              await sleep(speed);
            }
          }
        }
      }
    }

    setIsRunning(false);

    if (curCollected.length === currentLevel.targetBatteries.length) {
      setIsSuccess(true);
      soundManager.play("win");
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "Sistem Bot",
          text: "✅ Uji Verifikasi Lolos! Semua baterai berhasil dikumpulkan dengan kolaborasi tim yang kompak!",
          time: "Baru saja",
        },
      ]);
    } else {
      setIsFailed(true);
      soundManager.play("lose");
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "Sistem Bot",
          text: `⚠️ Uji belum lolos: baru ${curCollected.length} dari ${currentLevel.targetBatteries.length} baterai terkumpul. Coba cek lagi jumlah perulangannya ya!`,
          time: "Baru saja",
        },
      ]);
    }
  };

  if (!currentLevel) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Role Bar */}
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-indigo-700">
              <Users2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Mode Pasangan Coding (Pair Programming) 🤝
            </h2>
            <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-600 font-bold">
            Satu siswa bertindak sebagai <strong>Penyusun Solusi (Driver)</strong> dan satu siswa sebagai <strong>Penguji (Tester / QA)</strong>.
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200 shadow-inner">
          <button
            onClick={() => setRole("driver")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              role === "driver"
                ? "bg-blue-600 text-white shadow-md border-b-3 border-blue-800"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Code2 className="w-4 h-4 stroke-[2.5]" />
            <span>Driver (Penyusun)</span>
          </button>
          <button
            onClick={() => setRole("tester")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              role === "tester"
                ? "bg-emerald-500 text-white shadow-md border-b-3 border-emerald-700"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>Tester (Penguji)</span>
          </button>
        </div>
      </div>

      {/* Remote Edit Notification Banner */}
      {remoteEditNotice && (
        <div className="bg-blue-100 border-2 border-blue-300 p-3 rounded-2xl text-xs text-blue-900 font-black flex items-center gap-2 shadow-sm animate-in fade-in">
          <Sparkles className="w-5 h-5 text-blue-600 animate-spin" />
          <span>{remoteEditNotice}</span>
        </div>
      )}

      {/* Main Grid: Workspace & Real-time Collab Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Simulation and Code Blocks */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <GridSimulation
            level={currentLevel}
            robotPos={robotPos}
            collectedBatteryIds={collectedBatteryIds}
            isFailed={isFailed}
            isSuccess={isSuccess}
            stepCount={stepCount}
          />

          <CommandBuilder
            level={currentLevel}
            blocks={blocks}
            setBlocks={handleBlocksChange}
            disabled={role === "tester" || isRunning}
            onRun={handleRunTest}
            onStep={handleRunTest}
            onReset={() => {
              setRobotPos({ ...currentLevel.startPos });
              setCollectedBatteryIds([]);
              setStepCount(0);
              setIsSuccess(false);
              setIsFailed(false);
            }}
            activeBlockId={activeBlockId}
            isRunning={isRunning}
            speed={speed}
            setSpeed={setSpeed}
          />
        </div>

        {/* Right: Live Team Chat & Test Verification Notes */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Active Partner Card */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-xl">
            <h4 className="text-xs font-black text-slate-700 mb-3 flex items-center justify-between">
              <span>Partner Kolaborasi Aktif</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </h4>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border-2 border-slate-200">
              <span className="text-3xl">👩‍🔬</span>
              <div>
                <div className="text-xs font-black text-slate-900">Alya (Tester / QA)</div>
                <div className="text-[10px] text-emerald-700 font-black">Online & meninjau Level {currentLevel.id}</div>
              </div>
            </div>
          </div>

          {/* Real-time Team Chat Feed */}
          <div className="flex-1 min-h-[380px] bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-slate-100 mb-3 text-xs font-black text-slate-800">
              <MessageSquare className="w-4 h-4 text-blue-600 stroke-[2.5]" />
              <span>Diskusi & Catatan Uji Coba Tim 💬</span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[320px] pr-1 mb-3">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl text-xs font-bold ${
                    msg.sender === currentUser.name
                      ? "bg-blue-100 border border-blue-200 ml-4 text-blue-950"
                      : "bg-slate-100 border border-slate-200 mr-4 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-black text-[11px] text-slate-900">{msg.sender}</span>
                    <span className="text-[9px] text-slate-400">{msg.time}</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                placeholder="Tulis pesan atau saran perulangan..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all shadow-inner"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black border-b-2 border-blue-800 active:border-b-0 active:translate-y-0.5 transition-all shadow-md"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
