import React from "react";
import { Direction, LevelConfig } from "../../types";
import { Zap, Flag, ShieldAlert, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { RobotPlayer } from "./RobotPlayer";
import { BatteryIcon } from "./BatteryIcon";

interface GridSimulationProps {
  level: LevelConfig;
  robotPos: { x: number; y: number; dir: Direction };
  collectedBatteryIds: string[];
  isFailed: boolean;
  isSuccess: boolean;
  stepCount: number;
  activeLoopInfo?: {
    type: "for" | "while" | "do_while";
    iteration: number;
    total?: number;
    conditionText?: string;
  } | null;
}

export const GridSimulation: React.FC<GridSimulationProps> = ({
  level,
  robotPos,
  collectedBatteryIds,
  isFailed,
  isSuccess,
  stepCount,
  activeLoopInfo,
}) => {
  const { rows, cols } = level.gridSize;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Active Loop & Live Condition Visualizer */}
      <div className="min-h-[44px] flex items-center justify-center mb-3">
        {activeLoopInfo ? (
          <div className="px-4 py-2 rounded-xl bg-slate-900 text-white shadow-md flex items-center gap-3 border border-slate-700 animate-fadeIn">
            {/* Loop Type Pill */}
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${
                activeLoopInfo.type === "for"
                  ? "bg-indigo-600 text-white"
                  : "bg-purple-600 text-white"
              }`}
            >
              {activeLoopInfo.type === "for" ? "FOR LOOP" : "WHILE LOOP"}
            </span>

            {/* Iteration Counter */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <span className="text-slate-400 font-normal">Iterasi:</span>
              <span className="font-mono text-emerald-400">
                {activeLoopInfo.iteration}
                {activeLoopInfo.total ? ` / ${activeLoopInfo.total}` : ""}
              </span>
            </div>

            {/* Live Condition Evaluation Expression */}
            {activeLoopInfo.conditionText && (
              <>
                <span className="text-slate-600">|</span>
                <div className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                  {activeLoopInfo.conditionText}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">
            {isSuccess
              ? "Semua baterai terkumpul! Tekan Level Berikutnya untuk lanjut."
              : isFailed
              ? "Robot berhenti. Periksa urutan balok lalu tekan Jalankan lagi."
              : "Siap dijalankan. Klik tombol Jalankan untuk melihat robot bergerak."}
          </div>
        )}
      </div>

      {/* Grid Canvas */}
      <div className="relative p-4 sm:p-5 bg-[#edf4fb] rounded-[26px] border border-[#d2e4f7] shadow-inner max-w-full overflow-x-auto flex justify-center">
        <div
          className="grid gap-2 sm:gap-2.5 select-none"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(52px, 68px))`,
            gridTemplateRows: `repeat(${rows}, minmax(52px, 68px))`,
          }}
        >
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const isRobotHere = robotPos.x === c && robotPos.y === r;
              const battery = level.targetBatteries.find((b) => b.x === c && b.y === r);
              const isBatteryCollected = battery && collectedBatteryIds.includes(battery.id);
              const isObstacle = level.obstacles?.some((obs) => obs.x === c && obs.y === r);
              const isStartPoint = level.startPos.x === c && level.startPos.y === r;

              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative flex items-center justify-center rounded-[18px] border-2 transition-all duration-200 aspect-square p-1 ${
                    isObstacle
                      ? "bg-slate-800 border-slate-700 text-slate-200 shadow-inner"
                      : isRobotHere
                      ? "bg-[#e0f2fe] border-[#3b82f6] shadow-sm ring-4 ring-blue-300/60"
                      : battery && !isBatteryCollected
                      ? "bg-white border-[#bde0fe] shadow-2xs"
                      : "bg-white border-[#bde0fe] shadow-2xs hover:border-blue-200"
                  }`}
                >
                  {/* Coordinate Label (c, r) in top-left like reference */}
                  <span className="absolute top-1.5 left-2 text-[10px] font-mono text-[#627d98] font-bold select-none leading-none">
                    {c},{r}
                  </span>

                  {/* Start Point Flag (if not robot and not battery) */}
                  {isStartPoint && !isRobotHere && !battery && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <Flag className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}

                  {/* Obstacle Block */}
                  {isObstacle && (
                    <div className="flex flex-col items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                      <span className="text-[9px] font-bold text-slate-300 font-mono">DINDING</span>
                    </div>
                  )}

                  {/* Target Battery (Standardized for all Levels 1-8) */}
                  {battery && !isBatteryCollected && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
                      <BatteryIcon className="w-[56%] h-[56%] max-w-[36px] max-h-[44px] min-w-[24px] min-h-[30px]" />
                    </div>
                  )}

                  {/* Robot Player */}
                  {isRobotHere && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <RobotPlayer
                        dir={robotPos.dir}
                        isSuccess={isSuccess}
                        isFailed={isFailed}
                        size={50}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
