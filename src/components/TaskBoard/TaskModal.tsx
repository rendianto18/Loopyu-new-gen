import React, { useState } from "react";
import { TaskItem } from "../../types";
import { useApp } from "../../context/AppContext";
import { X, Plus, Save } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: TaskItem | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
}) => {
  const { team, levels, createTask, updateTask, currentUser } = useApp();

  const [title, setTitle] = useState(taskToEdit?.title || "");
  const [description, setDescription] = useState(taskToEdit?.description || "");
  const [levelId, setLevelId] = useState<number | undefined>(taskToEdit?.levelId || 1);
  const [assignedTo, setAssignedTo] = useState(taskToEdit?.assignedTo || currentUser.id);
  const [status, setStatus] = useState<TaskItem["status"]>(taskToEdit?.status || "todo");
  const [priority, setPriority] = useState<TaskItem["priority"]>(taskToEdit?.priority || "medium");
  const [tagInput, setTagInput] = useState(taskToEdit?.tags?.join(", ") || "LOOPYU, Algoritma");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (taskToEdit) {
        await updateTask(taskToEdit.id, {
          title,
          description,
          levelId: levelId ? Number(levelId) : undefined,
          assignedTo,
          status,
          priority,
          tags,
        });
      } else {
        await createTask({
          title,
          description,
          levelId: levelId ? Number(levelId) : undefined,
          assignedTo,
          status,
          priority,
          tags,
        });
      }
      onClose();
    } catch (err) {
      console.error("Failed to save task:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-5 sm:p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-black text-slate-900 mb-4">
          {taskToEdit ? "Edit Tugas Tim ✏️" : "Tambah Tugas Tim Baru 🚀"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">Judul Tugas</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Selesaikan Level 3 dengan Balok For"
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">Deskripsi & Catatan Kolaborasi</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan petunjuk atau target untuk rekan timmu..."
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all resize-none shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">Tautkan Level Arena</label>
              <select
                value={levelId || ""}
                onChange={(e) => setLevelId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="">Tidak ditautkan</option>
                {levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    Level {lvl.id}: {lvl.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">Tugaskan Kepada</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.avatar} {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">Status Papan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskItem["status"])}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="todo">Rencana (To Do)</option>
                <option value="in_progress">Sedang Dikerjakan</option>
                <option value="review">Uji Tim (Review)</option>
                <option value="done">Misi Selesai (Done)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">Tingkat Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskItem["priority"])}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="high">🔥 Tinggi / Cepat</option>
                <option value="medium">⚡ Sedang</option>
                <option value="low">🌱 Santai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">Tag (Pisahkan dengan koma)</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Contoh: Loop, Algoritma, Baterai"
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-md border-b-3 border-blue-800 active:border-b-0 active:translate-y-0.5 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? "Menyimpan..." : taskToEdit ? "Simpan Perubahan" : "Buat Tugas Baru"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
