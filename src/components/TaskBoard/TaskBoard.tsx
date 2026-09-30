import React, { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { TaskItem } from "../../types";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import {
  KanbanSquare,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  CheckCheck,
  Flame,
  Users,
  Sparkles,
  Trophy,
} from "lucide-react";

export const TaskBoard: React.FC = () => {
  const {
    tasks,
    team,
    deleteTask,
    updateTask,
    addToast,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchMember = selectedMember === "all" || t.assignedTo === selectedMember;
      const matchPriority = selectedPriority === "all" || t.priority === selectedPriority;

      return matchSearch && matchMember && matchPriority;
    });
  }, [tasks, searchQuery, selectedMember, selectedPriority]);

  const columns: {
    id: TaskItem["status"];
    title: string;
    icon: any;
    color: string;
    bgHeader: string;
    badgeColor: string;
    cardBorder: string;
  }[] = [
    {
      id: "todo",
      title: "Rencana (To Do) 📌",
      icon: Clock,
      color: "text-blue-700",
      bgHeader: "bg-blue-100/80 border-b-2 border-blue-200 text-blue-900",
      badgeColor: "bg-blue-600 text-white shadow-xs",
      cardBorder: "border-blue-200",
    },
    {
      id: "in_progress",
      title: "Sedang Dikerjakan ⚡",
      icon: Flame,
      color: "text-amber-800",
      bgHeader: "bg-amber-100/80 border-b-2 border-amber-200 text-amber-950",
      badgeColor: "bg-amber-500 text-white shadow-xs",
      cardBorder: "border-amber-200",
    },
    {
      id: "review",
      title: "Uji & Review Tim 👥",
      icon: Users,
      color: "text-purple-800",
      bgHeader: "bg-purple-100/80 border-b-2 border-purple-200 text-purple-950",
      badgeColor: "bg-purple-600 text-white shadow-xs",
      cardBorder: "border-purple-200",
    },
    {
      id: "done",
      title: "Selesai Hebat! 🎉",
      icon: CheckCheck,
      color: "text-emerald-800",
      bgHeader: "bg-emerald-100/80 border-b-2 border-emerald-200 text-emerald-950",
      badgeColor: "bg-emerald-600 text-white shadow-xs",
      cardBorder: "border-emerald-200",
    },
  ];

  const totalDone = tasks.filter((t) => t.status === "done").length;
  const progressPercent = tasks.length > 0 ? Math.round((totalDone / tasks.length) * 100) : 0;

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    await deleteTask(id);
    addToast({
      id: `del-${Date.now()}`,
      title: "Tugas Dihapus",
      message: `Tugas "${taskToDelete?.title || ""}" telah dihapus dari papan.`,
      type: "info",
      timestamp: new Date().toISOString(),
      read: false,
      avatar: "🗑️",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header with Stats & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 border-2 border-amber-500 flex items-center justify-center text-amber-950 shadow-md">
              <KanbanSquare className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Papan Misi Tim (LOOPYU Kanban) 📋</h2>
          </div>
          <p className="text-xs text-slate-600 font-bold">
            Bagi tugas petualangan, coba coding bareng teman, dan selesaikan tantangan dengan notifikasi otomatis!
          </p>
        </div>

        {/* Progress & Quick Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2.5 rounded-2xl border-2 border-slate-200 text-xs shadow-xs">
            <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span className="text-slate-700 font-black">Progress Tim:</span>
            <div className="w-28 bg-slate-200 h-3 rounded-full overflow-hidden border border-slate-300">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <strong className="text-emerald-700 font-black font-mono text-sm">{progressPercent}%</strong>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 rounded-2xl text-xs font-black shadow-lg shadow-amber-200 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Buat Tugas Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari tugas atau #tag misi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 border-2 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Filter Assignee */}
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 border-2 border-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Anggota Tim 👥</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.avatar} {m.name}
              </option>
            ))}
          </select>

          {/* Filter Priority */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 border-2 border-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Prioritas ⭐</option>
            <option value="high">🔥 Penting & Cepat</option>
            <option value="medium">⚡ Menengah</option>
            <option value="low">🌱 Santai</option>
          </select>
        </div>
      </div>

      {/* Kanban Board 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const Icon = col.icon;

          return (
            <div
              key={col.id}
              className={`flex flex-col bg-slate-50 rounded-3xl border-2 ${col.cardBorder} shadow-sm overflow-hidden min-h-[480px]`}
            >
              {/* Column Header */}
              <div
                className={`p-3.5 flex items-center justify-between font-black text-xs ${col.bgHeader}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                  <span>{col.title}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${col.badgeColor}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List Container */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-center border-2 border-dashed border-slate-200 rounded-2xl p-4">
                    <p className="text-xs font-bold text-slate-500">Belum ada tugas di sini</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      Tarik atau pindahkan kartu ke kolom ini!
                    </p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleOpenEdit}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal CRUD Task */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={editingTask}
        />
      )}
    </div>
  );
};
