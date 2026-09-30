import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import * as api from "../../services/api";
import { AttemptLog, TeamMember } from "../../types";
import {
  Database,
  RefreshCw,
  Trophy,
  Award,
  Layers,
  Activity,
  RotateCcw,
  CheckCircle2,
  Zap,
} from "lucide-react";

export const DatabaseView: React.FC = () => {
  const { team, tasks, levels, notifications, refreshData, setActiveTab } = useApp();
  const [attempts, setAttempts] = useState<AttemptLog[]>([]);
  const [activeCollection, setActiveCollection] = useState<
    "overview" | "tasks" | "attempts" | "team" | "notifications"
  >("overview");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      const data = await api.fetchAttempts();
      setAttempts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetDb = async () => {
    if (confirm("Reset seluruh data ke kondisi awal Blueprint LOOPYU?")) {
      setIsResetting(true);
      try {
        await api.resetDatabase();
        await refreshData();
        await loadAttempts();
      } catch (e) {
        console.error(e);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-blue-700">
              <Database className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Database & Analitik Belajar Tim 📊
            </h2>
            <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black">
              Penyimpanan Tersinkron
            </span>
          </div>
          <p className="text-xs text-slate-600 font-bold">
            Data real-time: Tugas Tim, Catatan Simulasi, Kartu Refleksi, Hasil Kuis, dan Notifikasi Otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              refreshData();
              loadAttempts();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border-2 border-slate-200 rounded-xl text-xs font-black transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4 stroke-[2.5]" />
            <span>Segarkan Data</span>
          </button>

          <button
            onClick={handleResetDb}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 rounded-xl text-xs font-black transition-colors shadow-xs"
            title="Reset data ke data contoh awal"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>{isResetting ? "Mereset..." : "Reset Data Awal"}</span>
          </button>
        </div>
      </div>

      {/* Database Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
          <div className="text-slate-500 font-black text-xs mb-1">Misi Tim (Tasks)</div>
          <div className="text-3xl font-black text-blue-600 font-mono">{tasks.length}</div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">
            {tasks.filter((t) => t.status === "done").length} selesai diselesaikan 🎉
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
          <div className="text-slate-500 font-black text-xs mb-1">Uji Coba (Attempts)</div>
          <div className="text-3xl font-black text-emerald-600 font-mono">{attempts.length}</div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">
            {attempts.filter((a) => a.isEfficient).length} solusi sangat efisien ⭐
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
          <div className="text-slate-500 font-black text-xs mb-1">Anggota Tim Aktif</div>
          <div className="text-3xl font-black text-purple-600 font-mono">{team.length}</div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">Kolaborasi aktif 👥</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
          <div className="text-slate-500 font-black text-xs mb-1">Notifikasi Otomatis</div>
          <div className="text-3xl font-black text-amber-500 font-mono">{notifications.length}</div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">Pemberitahuan real-time 🔔</div>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex border-b-2 border-slate-200 gap-2 overflow-x-auto">
        {[
          { id: "overview", label: "Papan Kontribusi Tim" },
          { id: "attempts", label: "Log Percobaan Misi" },
          { id: "tasks", label: "Tabel Data Tugas" },
          { id: "notifications", label: "Log Notifikasi Otomatis" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCollection(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-black border-b-4 transition-colors whitespace-nowrap ${
              activeCollection === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeCollection === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team Leaderboard */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-xl">
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span>Profil Anggota & Perolehan Loop Coins 🪙</span>
            </h3>

            <div className="space-y-3">
              {team.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{m.avatar}</span>
                    <div>
                      <div className="text-xs font-black text-slate-900">{m.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{m.role}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black font-mono text-blue-700">{m.points} XP</div>
                    <div className="text-[10px] text-amber-600 font-black">{m.coins} Loop Coins 🪙</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges Showcase */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-xl">
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Lencana Kompetensi Perulangan (Badges) 🎖️</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Pattern Spotter", desc: "Mengenali pola berulang Level 1", icon: "🔍", color: "bg-sky-50 border-sky-200 text-sky-950" },
                { name: "Loop Explorer", desc: "Menggunakan Balok For di Level 2", icon: "🔄", color: "bg-emerald-50 border-emerald-200 text-emerald-950" },
                { name: "Stair Builder", desc: "Pola belokan tangga Level 3", icon: "📐", color: "bg-blue-50 border-blue-200 text-blue-950" },
                { name: "While Sentinel", desc: "While loop kondisi aman Level 4", icon: "🛡️", color: "bg-purple-50 border-purple-200 text-purple-950" },
                { name: "Loop Breaker", desc: "Debugging off-by-one Level 5", icon: "⚡", color: "bg-rose-50 border-rose-200 text-rose-950" },
                { name: "Loop Master", desc: "Efisiensi tinggi tantangan Level 6", icon: "👑", color: "bg-amber-50 border-amber-200 text-amber-950" },
              ].map((b, i) => (
                <div key={i} className={`p-3 rounded-2xl border-2 ${b.color} flex items-start gap-2.5 shadow-xs`}>
                  <span className="text-2xl">{b.icon}</span>
                  <div>
                    <div className="text-xs font-black leading-tight">{b.name}</div>
                    <div className="text-[10px] font-bold opacity-80 mt-0.5">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeCollection === "attempts" && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-100 text-slate-600 font-black">
                <th className="pb-3">Waktu</th>
                <th className="pb-3">Level</th>
                <th className="pb-3">Siswa</th>
                <th className="pb-3">Hasil</th>
                <th className="pb-3">Balok</th>
                <th className="pb-3">Efisiensi</th>
                <th className="pb-3">Skor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada riwayat percobaan. Mainkan misi di Game Arena untuk mencatat log!
                  </td>
                </tr>
              ) : (
                attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 text-slate-500">
                      {new Date(att.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 font-black text-slate-900">Level {att.levelId}</td>
                    <td className="py-3 text-slate-700">{att.userName}</td>
                    <td className="py-3">
                      {att.success ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[11px]">
                          Berhasil 🎉
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-300 font-black text-[11px]">
                          Gagal 💥
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-mono">{att.blocksUsed} balok</td>
                    <td className="py-3">
                      {att.isEfficient ? (
                        <span className="text-amber-600 font-black">Efisien ⭐</span>
                      ) : (
                        <span className="text-slate-400">Standar</span>
                      )}
                    </td>
                    <td className="py-3 font-mono font-black text-blue-600">+{att.scoreAwarded}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeCollection === "tasks" && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-100 text-slate-600 font-black">
                <th className="pb-3">Judul Tugas</th>
                <th className="pb-3">Level</th>
                <th className="pb-3">Penanggung Jawab</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Prioritas</th>
                <th className="pb-3">Terakhir Diperbarui</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {tasks.map((task) => {
                const assignee = team.find((m) => m.id === task.assignedTo);
                return (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-black text-slate-900 max-w-xs truncate">{task.title}</td>
                    <td className="py-3 text-slate-600">
                      {task.levelId ? `Level ${task.levelId}` : "-"}
                    </td>
                    <td className="py-3 text-slate-700">{assignee?.name || "Tim"}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[10px] font-black uppercase">
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="font-black text-slate-700">{task.priority}</span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(task.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeCollection === "notifications" && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 divide-y divide-slate-100 shadow-xl">
          {notifications.map((n) => (
            <div key={n.id} className="py-3.5 flex items-center justify-between text-xs">
              <div>
                <div className="font-black text-slate-900">{n.title}</div>
                <div className="text-slate-600 font-bold mt-0.5">{n.message}</div>
              </div>
              <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap ml-4">
                {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
