import React, { useState, useEffect, useRef } from "react";
import { CodeBlock, CommandAction, LevelConfig, RepeatBlock, WhileBlock } from "../../types";
import { soundManager } from "../../utils/audio";
import { generateFullCProgram } from "../../utils/cCodeGenerator";
import {
  ArrowRight,
  ArrowDown,
  RotateCcw,
  RotateCw,
  Zap,
  Repeat,
  Compass,
  Trash2,
  Plus,
  Code2,
  Blocks,
  Copy,
  Check,
  Undo2,
  GripVertical,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

interface CommandBuilderProps {
  level: LevelConfig;
  blocks: CodeBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<CodeBlock[]>>;
  disabled: boolean;
  activeBlockId: string | null;
  isRunning: boolean;
  onUndo?: () => void;
  canUndo?: boolean;
}

export const CommandBuilder: React.FC<CommandBuilderProps> = ({
  level,
  blocks,
  setBlocks,
  disabled,
  activeBlockId,
  isRunning,
}) => {
  const [viewMode, setViewMode] = useState<"blocks" | "code">("blocks");
  const [copied, setCopied] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ type: string; id?: string; source: "palette" | "workspace" } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverLoopId, setDragOverLoopId] = useState<string | null>(null);
  const [selectedLoopId, setSelectedLoopId] = useState<string | null>(null);

  // Undo history stack
  const [history, setHistory] = useState<CodeBlock[][]>([]);

  const pushHistory = (newBlocks: CodeBlock[]) => {
    setHistory((prev) => [...prev.slice(-15), JSON.parse(JSON.stringify(blocks))]);
    setBlocks(newBlocks);
  };

  const handleUndo = () => {
    if (disabled || history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setBlocks(last);
    soundManager.playClick();
  };

  // Helper to count total blocks recursively
  const countBlocks = (list: CodeBlock[]): number => {
    let count = 0;
    for (const b of list) {
      count++;
      if (b.type === "repeat" || b.type === "while" || b.type === "do_while" || b.type === "if") {
        count += countBlocks(b.commands);
      }
    }
    return count;
  };

  const totalUsedBlocks = countBlocks(blocks);
  const maxLimit = level.maxBlocksLimit ?? 8;
  const isLimitReached = totalUsedBlocks >= maxLimit;
  const isOptimal = totalUsedBlocks <= level.maxBlocksForEfficiency;

  // Add child to loop
  const addChildToLoop = (loopId: string, action: CommandAction) => {
    if (disabled || isLimitReached) return;
    const childBlock: CodeBlock = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: "command",
      action,
    };
    const addRecursive = (list: CodeBlock[]): CodeBlock[] => {
      return list.map((b) => {
        if (b.id === loopId && (b.type === "repeat" || b.type === "while")) {
          return { ...b, commands: [...b.commands, childBlock] };
        }
        if (b.type === "repeat" || b.type === "while") {
          return { ...b, commands: addRecursive(b.commands) };
        }
        return b;
      });
    };
    pushHistory(addRecursive(blocks));
    setSelectedLoopId(loopId);
    soundManager.playAddBlock();
  };

  // Move block from workspace/loop into a target loop
  const moveBlockToLoop = (blockId: string, targetLoopId: string) => {
    if (disabled || blockId === targetLoopId) return;

    let movedBlock: CodeBlock | null = null;
    const removeRecursive = (list: CodeBlock[]): CodeBlock[] => {
      const res: CodeBlock[] = [];
      for (const b of list) {
        if (b.id === blockId) {
          movedBlock = b;
          continue;
        }
        if (b.type === "repeat" || b.type === "while") {
          res.push({ ...b, commands: removeRecursive(b.commands) });
        } else {
          res.push(b);
        }
      }
      return res;
    };

    const newBlocks = removeRecursive(blocks);
    if (!movedBlock) return;

    const addRecursive = (list: CodeBlock[]): CodeBlock[] => {
      return list.map((b) => {
        if (b.id === targetLoopId && (b.type === "repeat" || b.type === "while")) {
          return { ...b, commands: [...b.commands, movedBlock!] };
        }
        if (b.type === "repeat" || b.type === "while") {
          return { ...b, commands: addRecursive(b.commands) };
        }
        return b;
      });
    };

    pushHistory(addRecursive(newBlocks));
    setSelectedLoopId(targetLoopId);
    soundManager.playAddBlock();
  };

  // Move block out of a loop to root workspace
  const moveBlockToRoot = (blockId: string, targetIndex?: number) => {
    if (disabled) return;

    let movedBlock: CodeBlock | null = null;
    const removeRecursive = (list: CodeBlock[]): CodeBlock[] => {
      const res: CodeBlock[] = [];
      for (const b of list) {
        if (b.id === blockId) {
          movedBlock = b;
          continue;
        }
        if (b.type === "repeat" || b.type === "while") {
          res.push({ ...b, commands: removeRecursive(b.commands) });
        } else {
          res.push(b);
        }
      }
      return res;
    };

    const newBlocks = removeRecursive(blocks);
    if (!movedBlock) return;

    if (targetIndex !== undefined && targetIndex >= 0 && targetIndex <= newBlocks.length) {
      newBlocks.splice(targetIndex, 0, movedBlock);
    } else {
      newBlocks.push(movedBlock);
    }

    pushHistory(newBlocks);
    soundManager.playClick();
  };

  // Add a command block: if a loop is selected or an empty loop exists, insert inside it!
  const addCommand = (action: CommandAction) => {
    if (disabled || isLimitReached) return;

    // Check if there is an intended loop target
    let targetLoop: string | null = null;
    if (selectedLoopId && blocks.some((b) => b.id === selectedLoopId)) {
      targetLoop = selectedLoopId;
    } else {
      // Find empty loop or single loop in workspace
      const emptyLoop = blocks.find(
        (b) => (b.type === "repeat" || b.type === "while") && b.commands.length === 0
      );
      if (emptyLoop) {
        targetLoop = emptyLoop.id;
      } else {
        const loopBlocks = blocks.filter((b) => b.type === "repeat" || b.type === "while");
        if (loopBlocks.length === 1) {
          targetLoop = loopBlocks[0].id;
        }
      }
    }

    if (targetLoop) {
      addChildToLoop(targetLoop, action);
      return;
    }

    const newBlock: CodeBlock = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: "command",
      action,
    };
    pushHistory([...blocks, newBlock]);
    soundManager.playAddBlock();
  };

  // Add for loop (repeat)
  const addForLoop = () => {
    if (disabled || isLimitReached) return;
    const defaultCount = level.expectedIterations || 3;
    const newBlock: RepeatBlock = {
      id: `for-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: "repeat",
      count: defaultCount,
      commands: [], // Empty container: user adds actions themselves
    };
    pushHistory([...blocks, newBlock]);
    setSelectedLoopId(newBlock.id);
    soundManager.playAddBlock();
  };

  // Add while loop
  const addWhileLoop = () => {
    if (disabled || isLimitReached) return;
    const newBlock: WhileBlock = {
      id: `while-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: "while",
      condition: "path_clear",
      commands: [], // Empty container: user adds actions themselves
    };
    pushHistory([...blocks, newBlock]);
    setSelectedLoopId(newBlock.id);
    soundManager.playAddBlock();
  };

  // Delete a block by ID
  const deleteBlock = (id: string) => {
    if (disabled) return;
    const removeRecursive = (list: CodeBlock[]): CodeBlock[] => {
      return list
        .filter((b) => b.id !== id)
        .map((b) => {
          if (b.type === "repeat" || b.type === "while" || b.type === "do_while") {
            return { ...b, commands: removeRecursive(b.commands) };
          }
          return b;
        });
    };
    pushHistory(removeRecursive(blocks));
    soundManager.playClick();
  };

  // Update repeat count
  const updateRepeatCount = (id: string, newCount: number) => {
    if (disabled) return;
    const boundedCount = Math.max(1, Math.min(20, newCount));
    const updateRecursive = (list: CodeBlock[]): CodeBlock[] => {
      return list.map((b) => {
        if (b.id === id && b.type === "repeat") {
          return { ...b, count: boundedCount };
        }
        if (b.type === "repeat" || b.type === "while") {
          return { ...b, commands: updateRecursive(b.commands) };
        }
        return b;
      });
    };
    pushHistory(updateRecursive(blocks));
    soundManager.playClick();
  };

  // Reorder root blocks
  const reorderBlocks = (fromIdx: number, toIdx: number) => {
    if (disabled || fromIdx === toIdx) return;
    const next = [...blocks];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    pushHistory(next);
    soundManager.playClick();
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, type: string, source: "palette" | "workspace", id?: string) => {
    if (disabled) return;
    setDraggedItem({ type, source, id });
    e.dataTransfer.setData("text/plain", JSON.stringify({ type, source, id }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index?: number, loopId?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (index !== undefined) setDragOverIndex(index);
    if (loopId !== undefined) setDragOverLoopId(loopId);
  };

  const handleDrop = (e: React.DragEvent, targetIndex?: number, targetLoopId?: string) => {
    e.preventDefault();
    setDragOverIndex(null);
    setDragOverLoopId(null);
    if (disabled) return;

    try {
      const dataStr = e.dataTransfer.getData("text/plain");
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.source === "palette") {
        if (isLimitReached) {
          soundManager.play("lose");
          return;
        }
        if (targetLoopId) {
          // Dropped into a loop pocket or loop block
          if (
            data.type === "move_forward" ||
            data.type === "turn_left" ||
            data.type === "turn_right" ||
            data.type === "take_battery"
          ) {
            addChildToLoop(targetLoopId, data.type as CommandAction);
          }
        } else {
          // Dropped into root workspace
          if (data.type === "repeat") addForLoop();
          else if (data.type === "while") addWhileLoop();
          else addCommand(data.type as CommandAction);
        }
      } else if (data.source === "workspace" && data.id) {
        if (targetLoopId) {
          // User dragged an existing block from workspace (or another loop) into this loop!
          moveBlockToLoop(data.id, targetLoopId);
        } else if (targetIndex !== undefined) {
          const fromIdx = blocks.findIndex((b) => b.id === data.id);
          if (fromIdx !== -1) {
            reorderBlocks(fromIdx, targetIndex);
          } else {
            // Dragged out of a loop to root
            moveBlockToRoot(data.id, targetIndex);
          }
        } else {
          // Dropped onto root workspace background
          moveBlockToRoot(data.id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyCCode = () => {
    const code = generateFullCProgram(blocks, level.name);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check which blocks are allowed in this level
  const isAllowed = (type: string) => {
    return level.allowedBlocks.includes(type as any);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden select-none">
      {/* Top Header: Tab Toggle, Undo, and Block Counter */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          {/* Blocks vs C Code Toggle */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setViewMode("blocks")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                viewMode === "blocks"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Blocks className="w-3.5 h-3.5 text-indigo-600" />
              <span>Balok Visual</span>
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                viewMode === "code"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kode C</span>
            </button>
          </div>

          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={disabled || history.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 transition-all shadow-xs"
            title="Batal / Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium text-[11px]">Balok:</span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded-md text-xs ${
              isLimitReached
                ? "bg-rose-100 text-rose-700"
                : isOptimal
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {totalUsedBlocks} / {maxLimit}
          </span>
        </div>
      </div>

      {viewMode === "code" ? (
        /* C Code View */
        <div className="flex-1 p-4 bg-slate-900 text-slate-100 font-mono text-xs overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                loopyu_solution.c
              </span>
              <button
                onClick={copyCCode}
                className="flex items-center gap-1.5 text-[11px] text-slate-200 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Tersalin!" : "Salin Kode C"}</span>
              </button>
            </div>
            <pre className="text-emerald-300 font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
              {generateFullCProgram(blocks, level.name)}
            </pre>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-amber-400">💡</span>
            <span>Balok yang kamu susun otomatis diterjemahkan menjadi kode C standar.</span>
          </div>
        </div>
      ) : (
        /* Blockly Visual Workspace */
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
          {/* Palette (Top Section) */}
          <div className="p-3 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Palet Balok Tersedia
              </span>
              <span className="text-[10px] text-slate-400">
                Klik atau tarik balok ke workspace
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* FOR Block (Repeat) */}
              {isAllowed("repeat") && (
                <div
                  draggable={!disabled && !isLimitReached}
                  onDragStart={(e) => handleDragStart(e, "repeat", "palette")}
                  onClick={addForLoop}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white transition-all text-xs font-bold border border-indigo-700 ${
                    isLimitReached ? "opacity-35 cursor-not-allowed" : "hover:bg-indigo-700 active:scale-95 cursor-pointer shadow-xs"
                  }`}
                  title={isLimitReached ? `Batas ${maxLimit} balok tercapai` : "for (int i = 0; i < N; i++)"}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>FOR (...)</span>
                  <Plus className="w-3 h-3 text-indigo-200 ml-0.5" />
                </div>
              )}

              {/* WHILE Block */}
              {isAllowed("while") && (
                <div
                  draggable={!disabled && !isLimitReached}
                  onDragStart={(e) => handleDragStart(e, "while", "palette")}
                  onClick={addWhileLoop}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white transition-all text-xs font-bold border border-purple-700 ${
                    isLimitReached ? "opacity-35 cursor-not-allowed" : "hover:bg-purple-700 active:scale-95 cursor-pointer shadow-xs"
                  }`}
                  title={isLimitReached ? `Batas ${maxLimit} balok tercapai` : "while (pathClear())"}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>WHILE (pathClear)</span>
                  <Plus className="w-3 h-3 text-purple-200 ml-0.5" />
                </div>
              )}

              {/* MOVE Action */}
              {isAllowed("move_forward") && (
                <div
                  draggable={!disabled && !isLimitReached}
                  onDragStart={(e) => handleDragStart(e, "move_forward", "palette")}
                  onClick={() => addCommand("move_forward")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 text-white transition-all text-xs font-bold border border-sky-600 ${
                    isLimitReached ? "opacity-35 cursor-not-allowed" : "hover:bg-sky-600 active:scale-95 cursor-pointer shadow-xs"
                  }`}
                  title={isLimitReached ? `Batas ${maxLimit} balok tercapai` : "move();"}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>MAJU</span>
                  <Plus className="w-3 h-3 text-sky-200 ml-0.5" />
                </div>
              )}

              {/* MOVE BACKWARD Action */}
              {isAllowed("move_backward") && (
                <div
                  draggable={!disabled && !isLimitReached}
                  onDragStart={(e) => handleDragStart(e, "move_backward", "palette")}
                  onClick={() => addCommand("move_backward")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white transition-all text-xs font-bold border border-blue-700 ${
                    isLimitReached ? "opacity-35 cursor-not-allowed" : "hover:bg-blue-700 active:scale-95 cursor-pointer shadow-xs"
                  }`}
                  title={isLimitReached ? `Batas ${maxLimit} balok tercapai` : "moveBackward();"}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>MUNDUR</span>
                  <Plus className="w-3 h-3 text-blue-200 ml-0.5" />
                </div>
              )}

              {/* TURN LEFT */}
              {isAllowed("turn_left") && (
                <div
                  draggable={!disabled && !isLimitReached}
                  onDragStart={(e) => handleDragStart(e, "turn_left", "palette")}
                  onClick={() => addCommand("turn_left")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 text-white transition-all text-xs font-bold border border-teal-600 ${
                    isLimitReached ? "opacity-35 cursor-not-allowed" : "hover:bg-teal-600 active:scale-95 cursor-pointer shadow-xs"
                  }`}
                  title={isLimitReached ? `Batas ${maxLimit} balok tercapai` : "turnLeft();"}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>BELOK KIRI</span>
                  <Plus className="w-3 h-3 text-teal-200 ml-0.5" />
                </div>
              )}

              {/* TURN RIGHT */}
              {isAllowed("turn_right") && (
                <div
                  draggable={!disabled && !isLimitReached}
                  onDragStart={(e) => handleDragStart(e, "turn_right", "palette")}
                  onClick={() => addCommand("turn_right")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 text-white transition-all text-xs font-bold border border-teal-600 ${
                    isLimitReached ? "opacity-35 cursor-not-allowed" : "hover:bg-teal-600 active:scale-95 cursor-pointer shadow-xs"
                  }`}
                  title={isLimitReached ? `Batas ${maxLimit} balok tercapai` : "turnRight();"}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>BELOK KANAN</span>
                  <Plus className="w-3 h-3 text-teal-200 ml-0.5" />
                </div>
              )}

              {/* COLLECT / TAKE BATTERY */}
              {isAllowed("take_battery") && (
                <div
                  draggable={!disabled && !isLimitReached}
                  onDragStart={(e) => handleDragStart(e, "take_battery", "palette")}
                  onClick={() => addCommand("take_battery")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white transition-all text-xs font-bold border border-amber-600 ${
                    isLimitReached ? "opacity-35 cursor-not-allowed" : "hover:bg-amber-600 active:scale-95 cursor-pointer shadow-xs"
                  }`}
                  title={isLimitReached ? `Batas ${maxLimit} balok tercapai` : "collect();"}
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>AMBIL BATERAI</span>
                  <Plus className="w-3 h-3 text-amber-200 ml-0.5" />
                </div>
              )}
            </div>

            {/* Limit Reached Warning Alert */}
            {isLimitReached && (
              <div className="mt-2.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>
                  Batas maksimal {maxLimit} balok untuk Level {level.id} telah tercapai. Hapus balok di workspace jika ingin menambah yang baru.
                </span>
              </div>
            )}
          </div>

          {/* Workspace Droppable Area */}
          <div
            onDragOver={(e) => handleDragOver(e)}
            onDrop={(e) => handleDrop(e)}
            className="flex-1 p-3 overflow-y-auto space-y-2.5"
          >
            {blocks.length === 0 ? (
              <div
                onDragOver={(e) => handleDragOver(e)}
                onDrop={(e) => handleDrop(e)}
                className="h-56 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 text-xs text-center p-6 bg-white/60 transition-all hover:border-indigo-400 hover:bg-indigo-50/20"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-2 border border-indigo-100">
                  <Blocks className="w-6 h-6" />
                </div>
                <p className="font-bold text-slate-700 text-sm">Area Kerja Balok Kosong</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Klik balok di atas untuk menambahkan perintah, atau tarik balok ke sini untuk menyusun program.
                </p>
              </div>
            ) : (
              blocks.map((block, idx) => (
                <div
                  key={block.id}
                  draggable={!disabled}
                  onDragStart={(e) => handleDragStart(e, block.type, "workspace", block.id)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`transition-transform ${dragOverIndex === idx ? "border-t-2 border-indigo-500 pt-1" : ""}`}
                >
                  <BlockItem
                    block={block}
                    index={idx}
                    activeBlockId={activeBlockId}
                    disabled={disabled}
                    selectedLoopId={selectedLoopId}
                    onSelectLoop={(id) => setSelectedLoopId(id)}
                    onDelete={() => deleteBlock(block.id)}
                    onUpdateRepeat={(count) => updateRepeatCount(block.id, count)}
                    onAddChild={(action) => addChildToLoop(block.id, action)}
                    onDeleteChild={(childId) => deleteBlock(childId)}
                    isAllowed={isAllowed}
                    isLimitReached={isLimitReached}
                    handleDragStart={handleDragStart}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                    dragOverLoopId={dragOverLoopId}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface BlockItemProps {
  block: CodeBlock;
  index: number;
  activeBlockId: string | null;
  disabled: boolean;
  selectedLoopId: string | null;
  onSelectLoop: (id: string) => void;
  onDelete: () => void;
  onUpdateRepeat: (count: number) => void;
  onAddChild: (action: CommandAction) => void;
  onDeleteChild: (id: string) => void;
  isAllowed: (type: string) => boolean;
  isLimitReached: boolean;
  handleDragStart: (e: React.DragEvent, type: string, source: "palette" | "workspace", id?: string) => void;
  handleDragOver: (e: React.DragEvent, index?: number, loopId?: string) => void;
  handleDrop: (e: React.DragEvent, index?: number, loopId?: string) => void;
  dragOverLoopId: string | null;
}

const BlockItem: React.FC<BlockItemProps> = ({
  block,
  activeBlockId,
  disabled,
  selectedLoopId,
  onSelectLoop,
  onDelete,
  onUpdateRepeat,
  onAddChild,
  onDeleteChild,
  isAllowed,
  isLimitReached,
  handleDragStart,
  handleDragOver,
  handleDrop,
  dragOverLoopId,
}) => {
  const isActive = activeBlockId === block.id;
  const isSelectedLoop = selectedLoopId === block.id;

  // Single Command Block
  if (block.type === "command") {
    let label = "MAJU";
    let cSyntax = "move();";
    let icon = <ArrowRight className="w-4 h-4 text-white" />;
    let bgColor = "bg-sky-500 hover:bg-sky-600 border-sky-600 text-white";

    if (block.action === "move_backward") {
      label = "MUNDUR";
      cSyntax = "moveBackward();";
      icon = <ArrowDown className="w-4 h-4 text-white" />;
      bgColor = "bg-blue-600 hover:bg-blue-700 border-blue-700 text-white";
    } else if (block.action === "turn_left") {
      label = "BELOK KIRI";
      cSyntax = "turnLeft();";
      icon = <RotateCcw className="w-4 h-4 text-white" />;
      bgColor = "bg-teal-500 hover:bg-teal-600 border-teal-600 text-white";
    } else if (block.action === "turn_right") {
      label = "BELOK KANAN";
      cSyntax = "turnRight();";
      icon = <RotateCw className="w-4 h-4 text-white" />;
      bgColor = "bg-teal-500 hover:bg-teal-600 border-teal-600 text-white";
    } else if (block.action === "take_battery") {
      label = "AMBIL BATERAI";
      cSyntax = "collect();";
      icon = <Zap className="w-4 h-4 fill-white text-white" />;
      bgColor = "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white";
    }

    return (
      <div
        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border shadow-xs transition-all ${bgColor} ${
          isActive ? "ring-4 ring-amber-300 scale-[1.02] shadow-md" : ""
        }`}
      >
        <div className="flex items-center gap-2.5">
          <GripVertical className="w-4 h-4 opacity-50 cursor-grab" />
          {icon}
          <div>
            <span className="text-xs font-black tracking-wide">{label}</span>
            <span className="ml-2 font-mono text-[10px] opacity-80">{cSyntax}</span>
          </div>
        </div>

        <button
          onClick={onDelete}
          disabled={disabled}
          className="p-1 rounded-lg hover:bg-black/20 text-white/80 hover:text-white transition-colors disabled:opacity-30"
          title="Hapus balok"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // FOR Loop Block (Blockly-style pocket container)
  if (block.type === "repeat") {
    return (
      <div
        onClick={() => onSelectLoop(block.id)}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDragOver(e, undefined, block.id);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDrop(e, undefined, block.id);
        }}
        className={`rounded-2xl border-2 transition-all shadow-xs overflow-hidden cursor-pointer ${
          isSelectedLoop
            ? "border-indigo-600 ring-4 ring-indigo-200 scale-[1.005]"
            : isActive
            ? "border-indigo-500 ring-4 ring-indigo-300 scale-[1.01]"
            : "border-indigo-600/90 bg-white hover:border-indigo-700"
        }`}
      >
        {/* Loop Notch Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 opacity-50 cursor-grab" />
            <Repeat className="w-4 h-4" />
            <div className="flex items-center gap-1.5 text-xs font-bold flex-wrap">
              <span>FOR</span>
              <span className="text-indigo-200">ulang</span>

              {/* Interactive Count Stepper */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center bg-white text-indigo-950 rounded-lg px-1.5 py-0.5 border border-indigo-300 shadow-xs font-mono"
              >
                <button
                  onClick={() => onUpdateRepeat(block.count - 1)}
                  disabled={disabled || block.count <= 1}
                  className="px-1 text-indigo-700 hover:bg-indigo-50 rounded text-xs font-bold disabled:opacity-30"
                >
                  -
                </button>
                <span className="px-1.5 font-bold text-xs">
                  {block.count}
                </span>
                <button
                  onClick={() => onUpdateRepeat(block.count + 1)}
                  disabled={disabled || block.count >= 20}
                  className="px-1 text-indigo-700 hover:bg-indigo-50 rounded text-xs font-bold disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <span>kali</span>
              <span className="hidden sm:inline font-mono text-[10px] text-indigo-200 font-normal">
                for (int i = 0; i &lt; {block.count}; i++)
              </span>

              {isSelectedLoop && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-white font-extrabold tracking-wide ml-1">
                  ✓ Aktif
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={disabled}
            className="p-1 rounded-lg hover:bg-indigo-700 text-indigo-100 hover:text-white transition-colors disabled:opacity-30"
            title="Hapus loop FOR"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loop Pocket (Nested Child Blocks) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDragOver(e, undefined, block.id);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDrop(e, undefined, block.id);
          }}
          className={`p-2.5 pl-4 ml-4 my-1.5 border-l-4 border-indigo-400 space-y-1.5 bg-indigo-50/40 rounded-r-xl min-h-[50px] transition-colors ${
            dragOverLoopId === block.id ? "bg-indigo-100/70 border-indigo-600" : ""
          }`}
        >
          {block.commands.length === 0 ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelectLoop(block.id);
                if (isAllowed("move_forward")) onAddChild("move_forward");
              }}
              className="py-3.5 px-3 border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-xl bg-indigo-100/60 hover:bg-indigo-100 text-indigo-950 text-xs text-center flex flex-col items-center justify-center gap-1 my-1 cursor-pointer transition-all"
            >
              <span className="font-extrabold text-xs text-indigo-900 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-indigo-700" /> Wadah FOR Kosong (Klik untuk Tambah MAJU)
              </span>
              <span className="text-[11px] text-indigo-700">
                Gunakan tombol{" "}
                <strong className="font-bold text-sky-800 bg-sky-100 px-1.5 py-0.5 rounded border border-sky-300">
                  + Maju
                </strong>
                {isAllowed("take_battery") && (
                  <>
                    {" "}
                    dan{" "}
                    <strong className="font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                      + Ambil Baterai
                    </strong>
                  </>
                )}{" "}
                di bawah wadah atau klik balok di palet atas
              </span>
            </div>
          ) : (
            block.commands.map((cmd) => {
              const isChildActive = activeBlockId === cmd.id;
              let childBg = "bg-sky-500 text-white";
              let childLabel = "MAJU";
              let childSyntax = "move();";
              let childIcon = <ArrowRight className="w-3.5 h-3.5" />;

              if (cmd.type === "command") {
                if (cmd.action === "move_backward") {
                  childBg = "bg-blue-600 text-white";
                  childLabel = "MUNDUR";
                  childSyntax = "moveBackward();";
                  childIcon = <ArrowDown className="w-3.5 h-3.5" />;
                } else if (cmd.action === "turn_left") {
                  childBg = "bg-teal-500 text-white";
                  childLabel = "BELOK KIRI";
                  childSyntax = "turnLeft();";
                  childIcon = <RotateCcw className="w-3.5 h-3.5" />;
                } else if (cmd.action === "turn_right") {
                  childBg = "bg-teal-500 text-white";
                  childLabel = "BELOK KANAN";
                  childSyntax = "turnRight();";
                  childIcon = <RotateCw className="w-3.5 h-3.5" />;
                } else if (cmd.action === "take_battery") {
                  childBg = "bg-amber-500 text-white";
                  childLabel = "AMBIL BATERAI";
                  childSyntax = "collect();";
                  childIcon = <Zap className="w-3.5 h-3.5 fill-white" />;
                }
              }

              return (
                <div
                  key={cmd.id}
                  draggable={!disabled}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    handleDragStart(e, cmd.type === "command" ? cmd.action : cmd.type, "workspace", cmd.id);
                  }}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all ${childBg} ${
                    isChildActive ? "ring-2 ring-amber-300 scale-[1.01]" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3.5 h-3.5 opacity-50 cursor-grab" />
                    {childIcon}
                    <span>{childLabel}</span>
                    <span className="font-mono text-[10px] opacity-80">{childSyntax}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChild(cmd.id);
                    }}
                    disabled={disabled}
                    className="p-0.5 rounded hover:bg-black/20 text-white/80 hover:text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}

          {/* Quick Add Buttons Inside Loop Pocket */}
          <div className="flex items-center gap-1.5 pt-1 flex-wrap">
            {isAllowed("move_forward") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild("move_forward");
                }}
                disabled={disabled || isLimitReached}
                className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-800 text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs active:scale-95"
              >
                <Plus className="w-3 h-3 text-sky-700" /> + Maju
              </button>
            )}
            {isAllowed("move_backward") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild("move_backward");
                }}
                disabled={disabled || isLimitReached}
                className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-800 text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs active:scale-95"
              >
                <Plus className="w-3 h-3 text-blue-700" /> + Mundur
              </button>
            )}
            {isAllowed("take_battery") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild("take_battery");
                }}
                disabled={disabled || isLimitReached}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs active:scale-95"
              >
                <Plus className="w-3 h-3 text-amber-700" /> + Ambil Baterai
              </button>
            )}
            {isAllowed("turn_left") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild("turn_left");
                }}
                disabled={disabled || isLimitReached}
                className="px-2.5 py-1 rounded-lg bg-teal-100 hover:bg-teal-200 border border-teal-300 text-teal-800 text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs active:scale-95"
              >
                <Plus className="w-3 h-3 text-teal-700" /> + Kiri
              </button>
            )}
            {isAllowed("turn_right") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild("turn_right");
                }}
                disabled={disabled || isLimitReached}
                className="px-2.5 py-1 rounded-lg bg-teal-100 hover:bg-teal-200 border border-teal-300 text-teal-800 text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs active:scale-95"
              >
                <Plus className="w-3 h-3 text-teal-700" /> + Kanan
              </button>
            )}
          </div>
        </div>

        {/* Closing loop notch bottom */}
        <div className="px-3 py-1 bg-indigo-50 border-t border-indigo-100 text-[10px] font-mono font-bold text-indigo-900">
          &#125; // akhir loop for
        </div>
      </div>
    );
  }

  // WHILE Loop Block
  if (block.type === "while") {
    return (
      <div
        onClick={() => onSelectLoop(block.id)}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDragOver(e, undefined, block.id);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDrop(e, undefined, block.id);
        }}
        className={`rounded-2xl border-2 transition-all shadow-xs overflow-hidden cursor-pointer ${
          isSelectedLoop
            ? "border-purple-600 ring-4 ring-purple-200 scale-[1.005]"
            : isActive
            ? "border-purple-500 ring-4 ring-purple-300 scale-[1.01]"
            : "border-purple-600/90 bg-white hover:border-purple-700"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-purple-600 text-white">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 opacity-50 cursor-grab" />
            <Compass className="w-4 h-4" />
            <div className="flex items-center gap-1.5 text-xs font-bold flex-wrap">
              <span>WHILE</span>
              <span className="bg-purple-800/80 px-2 py-0.5 rounded-md font-mono text-purple-100 border border-purple-400/40">
                pathClear()
              </span>
              <span className="text-purple-200 text-[11px]">(jalan di depan aman)</span>

              {isSelectedLoop && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-white font-extrabold tracking-wide ml-1">
                  ✓ Aktif
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={disabled}
            className="p-1 rounded-lg hover:bg-purple-700 text-purple-100 hover:text-white transition-colors disabled:opacity-30"
            title="Hapus loop WHILE"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pocket */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDragOver(e, undefined, block.id);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDrop(e, undefined, block.id);
          }}
          className={`p-2.5 pl-4 ml-4 my-1.5 border-l-4 border-purple-400 space-y-1.5 bg-purple-50/40 rounded-r-xl min-h-[50px] transition-colors ${
            dragOverLoopId === block.id ? "bg-purple-100/70 border-purple-600" : ""
          }`}
        >
          {block.commands.length === 0 ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelectLoop(block.id);
                if (isAllowed("move_forward")) onAddChild("move_forward");
              }}
              className="py-3.5 px-3 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-xl bg-purple-100/60 hover:bg-purple-100 text-purple-900 text-xs text-center flex flex-col items-center justify-center gap-1 my-1 cursor-pointer transition-all"
            >
              <span className="font-extrabold text-xs text-purple-800 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-purple-700" /> Wadah WHILE Kosong (Klik di Sini untuk Isi MAJU)
              </span>
              <span className="text-[11px] text-purple-600">
                Klik tombol <strong className="underline font-bold">+ Maju</strong> di bawah atau klik balok di palet atas
              </span>
            </div>
          ) : (
            block.commands.map((cmd) => {
              const isChildActive = activeBlockId === cmd.id;
              let childBg = "bg-sky-500 text-white";
              let childLabel = "MAJU";
              let childSyntax = "move();";
              let childIcon = <ArrowRight className="w-3.5 h-3.5" />;

              if (cmd.type === "command") {
                if (cmd.action === "move_backward") {
                  childBg = "bg-blue-600 text-white";
                  childLabel = "MUNDUR";
                  childSyntax = "moveBackward();";
                  childIcon = <ArrowDown className="w-3.5 h-3.5" />;
                } else if (cmd.action === "turn_left") {
                  childBg = "bg-teal-500 text-white";
                  childLabel = "BELOK KIRI";
                  childSyntax = "turnLeft();";
                  childIcon = <RotateCcw className="w-3.5 h-3.5" />;
                } else if (cmd.action === "turn_right") {
                  childBg = "bg-teal-500 text-white";
                  childLabel = "BELOK KANAN";
                  childSyntax = "turnRight();";
                  childIcon = <RotateCw className="w-3.5 h-3.5" />;
                } else if (cmd.action === "take_battery") {
                  childBg = "bg-amber-500 text-white";
                  childLabel = "AMBIL BATERAI";
                  childSyntax = "collect();";
                  childIcon = <Zap className="w-3.5 h-3.5 fill-white" />;
                }
              }

              return (
                <div
                  key={cmd.id}
                  draggable={!disabled}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    handleDragStart(e, cmd.type === "command" ? cmd.action : cmd.type, "workspace", cmd.id);
                  }}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all ${childBg} ${
                    isChildActive ? "ring-2 ring-amber-300 scale-[1.01]" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3.5 h-3.5 opacity-50 cursor-grab" />
                    {childIcon}
                    <span>{childLabel}</span>
                    <span className="font-mono text-[10px] opacity-80">{childSyntax}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChild(cmd.id);
                    }}
                    disabled={disabled}
                    className="p-0.5 rounded hover:bg-black/20 text-white/80 hover:text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}

          {/* Quick Add Buttons */}
          <div className="flex items-center gap-1.5 pt-1 flex-wrap">
            {isAllowed("move_forward") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild("move_forward");
                }}
                disabled={disabled || isLimitReached}
                className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-800 text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs active:scale-95"
              >
                <Plus className="w-3 h-3 text-sky-700" /> + Maju
              </button>
            )}
            {isAllowed("move_backward") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild("move_backward");
                }}
                disabled={disabled || isLimitReached}
                className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-800 text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs active:scale-95"
              >
                <Plus className="w-3 h-3 text-blue-700" /> + Mundur
              </button>
            )}
            {isAllowed("turn_left") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild("turn_left");
                }}
                disabled={disabled || isLimitReached}
                className="px-2.5 py-1 rounded-lg bg-teal-100 hover:bg-teal-200 border border-teal-300 text-teal-800 text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs active:scale-95"
              >
                <Plus className="w-3 h-3 text-teal-700" /> + Kiri
              </button>
            )}
            {isAllowed("turn_right") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild("turn_right");
                }}
                disabled={disabled || isLimitReached}
                className="px-2.5 py-1 rounded-lg bg-teal-100 hover:bg-teal-200 border border-teal-300 text-teal-800 text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs active:scale-95"
              >
                <Plus className="w-3 h-3 text-teal-700" /> + Kanan
              </button>
            )}
            {isAllowed("take_battery") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild("take_battery");
                }}
                disabled={disabled || isLimitReached}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs active:scale-95"
              >
                <Plus className="w-3 h-3 text-amber-700" /> + Ambil Baterai
              </button>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="px-3 py-1 bg-purple-50 border-t border-purple-100 text-[10px] font-mono font-bold text-purple-900">
          &#125; // akhir loop while
        </div>
      </div>
    );
  }

  return null;
};
