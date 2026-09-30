import React from "react";
import { TaskItem } from "../../types";
import { useApp } from "../../context/AppContext";
import {
  ArrowRight,
  Edit2,
  Trash2,
  Gamepad2,
  Users2,
  Code2,
  Sparkles,
} from "lucide-react";

interface TaskCardProps {
  task: TaskItem;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
}) => {
  const {
    team,
    updateTask,
    setCurrentLevelId,
    setActiveTab,
  } = useApp();

  const assignee = team.find((m) => m.id === task.assignedTo);

  const getPriorityBadge = (p: TaskItem["priority"]) => {
    switch (p) {
      case "high":
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
            🔥 Cepat
          </span>
        );
      case "medium":
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
            ⚡ Normal
          </span>
        );
      case "low":
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs">
            🌱 Santai
          </span>
        );
    }
  };

  const nextStatusMap: Record<TaskItem["status"], TaskItem["status"] | null> = {
    todo: "in_progress",
    in_progress: "review",
    review: "done",
    done: null,
  };

  const nextStatusLabel: Record<TaskItem["status"], string> = {
    todo: "Mulai ⚡",
    in_progress: "Uji Tim 👥",
    review: "Selesai 🎉",
    done: "",
  };

  const handleAdvanceStatus = () => {
    const next = nextStatusMap[task.status];
    if (next) {
      updateTask(task.id, { status: next });
    }
  };

  const handleOpenLevel = () => {
    if (task.levelId) {
      setCurrentLevelId(task.levelId);
      setActiveTab("arena");
      setTimeout(() => {
        const boardEl = document.getElementById("papan-game");
        if (boardEl) {
          boardEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 80);
    }
  };

  return (
    <div className="group bg-white hover:bg-slate-50/80 border-2 border-slate-200 hover:border-blue-400 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all space-y-3">
      {/* Card Header: Priority & Quick Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {getPriorityBadge(task.priority)}
          {task.levelId && (
            <button
              onClick={handleOpenLevel}
              className="cursor-pointer px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 transition-all flex items-center gap-1"
              title="Buka level ini di Arena Game"
            >
              <Gamepad2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Level {task.levelId}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit tugas"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Hapus tugas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="text-xs font-black text-slate-800 leading-snug line-clamp-2">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed font-bold">
            {task.description}
          </p>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-black border border-slate-200"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Attached Solution Code Preview Chip */}
      {task.solutionCode && task.solutionCode.length > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-[10px] text-indigo-900 font-bold shadow-xs">
          <Code2 className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
          <span>Tersimpan {task.solutionCode.length} blok kode solusi</span>
        </div>
      )}

      {/* Card Footer: Assignee Avatar & Next Stage Button */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-black">
          <span className="text-base">{assignee?.avatar || "👤"}</span>
          <span className="truncate max-w-[100px]">{assignee?.name || "Belum ada"}</span>
        </div>

        {nextStatusMap[task.status] && (
          <button
            onClick={handleAdvanceStatus}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black bg-blue-600 hover:bg-blue-500 text-white shadow-xs border-b-2 border-blue-800 active:border-b-0 active:translate-y-0.5 transition-all"
          >
            <span>{nextStatusLabel[task.status]}</span>
            <ArrowRight className="w-3 h-3 stroke-[3]" />
          </button>
        )}
      </div>
    </div>
  );
};
