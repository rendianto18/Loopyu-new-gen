import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Users2,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Settings,
  History,
  PlusCircle,
  Search,
  RefreshCw,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Download,
  Award,
  FileText,
  UserCheck,
} from "lucide-react";
import * as api from "../../services/api";
import { User, Team, Assignment, AssignmentProgress, AuditLog, ClassRoom, AppSettings } from "../../types";

export const AdminTeacherDashboard: React.FC = () => {
  const {
    appUser,
    allUsers,
    teams,
    assignments,
    settings,
    updateSettings,
    refreshData,
    refreshTeamData,
    switchUser,
    addToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "assignments" | "teams" | "users" | "gradebook" | "settings" | "audit"
  >("overview");

  const [progressList, setProgressList] = useState<AssignmentProgress[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  // New assignment form state
  const [newAsgTitle, setNewAsgTitle] = useState("");
  const [newAsgDesc, setNewAsgDesc] = useState("");
  const [newAsgMode, setNewAsgMode] = useState<"INDIVIDUAL" | "TEAM">("TEAM");
  const [newAsgLevels, setNewAsgLevels] = useState<number[]>([1, 2, 3]);
  const [newAsgDueDate, setNewAsgDueDate] = useState("2026-10-30");

  // New user form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserAvatar, setNewUserAvatar] = useState("🧑‍🎓");
  const [newUserRole, setNewUserRole] = useState<User["role"]>("STUDENT");

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [progs, audits, cls] = await Promise.all([
        api.fetchAllProgress(),
        api.fetchAuditLogs(),
        api.fetchClasses(),
      ]);
      setProgressList(progs);
      setAuditLogs(audits);
      setClasses(cls);
    } catch (e) {
      console.error("Error loading admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [activeSubTab]);

  // Create Assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle.trim()) return;

    try {
      await api.createAssignment({
        title: newAsgTitle.trim(),
        description: newAsgDesc.trim(),
        classId: "class-8a",
        mode: newAsgMode,
        targetLevels: newAsgLevels,
        quizId: "quiz-loop-01",
        reflectionTemplateId: "refl-01",
        testId: "test-mid-loop",
        createdBy: appUser.id,
        status: "ACTIVE",
        dueDate: newAsgDueDate,
      });

      await refreshData();
      await loadAdminData();
      setShowCreateAssignmentModal(false);
      setNewAsgTitle("");
      setNewAsgDesc("");
      addToast({
        title: "Tugas Berhasil Dibuat",
        message: `Tugas "${newAsgTitle}" telah aktif untuk siswa.`,
      });
    } catch (err: any) {
      addToast({
        title: "Gagal Membuat Tugas",
        message: err.message || "Terjadi kesalahan.",
      });
    }
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserUsername.trim()) return;

    try {
      await api.createUser({
        name: newUserName.trim(),
        username: newUserUsername.trim().toLowerCase(),
        avatar: newUserAvatar,
        role: newUserRole,
        classId: "class-8a",
        status: "ACTIVE",
      });

      await refreshData();
      setShowCreateUserModal(false);
      setNewUserName("");
      setNewUserUsername("");
      addToast({
        title: "Pengguna Baru Ditambahkan! 🎉",
        message: `${newUserName} (@${newUserUsername.trim().toLowerCase()}) berhasil dibuat.`,
      });
    } catch (err: any) {
      addToast({
        title: "Gagal Mendaftarkan Pengguna",
        message: err.message || "Terjadi kesalahan.",
      });
    }
  };

  // Delete User
  const handleDeleteUser = async (user: User) => {
    if (user.id === appUser.id) {
      addToast({
        title: "Tidak Dapat Menghapus",
        message: "Anda tidak dapat menghapus akun Anda sendiri.",
      });
      return;
    }
    if (!window.confirm(`Hapus akun @${user.username} (${user.name}) secara permanen?`)) return;

    try {
      await api.deleteUser(user.id);
      await refreshData();
      addToast({
        title: "Pengguna Dihapus",
        message: `Akun @${user.username} telah dihapus dari sistem.`,
      });
    } catch (err: any) {
      addToast({
        title: "Gagal Menghapus",
        message: err.message || "Terjadi kesalahan.",
      });
    }
  };

  // Regenerate Team Code from Admin
  const handleAdminRegenCode = async (teamId: string) => {
    try {
      const res = await api.regenerateTeamCode(teamId);
      await refreshTeamData();
      addToast({
        title: "Kode Tim Diperbarui",
        message: `Kode baru: ${res.newCode}`,
      });
    } catch (e: any) {
      addToast({ title: "Gagal", message: e.message });
    }
  };

  // Delete Team
  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus tim ini?")) return;
    try {
      await api.deleteTeam(teamId);
      await refreshData();
      await refreshTeamData();
      addToast({ title: "Tim Dihapus", message: "Tim berhasil dihapus dari database." });
    } catch (e: any) {
      addToast({ title: "Gagal Menghapus", message: e.message });
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm("Hapus tugas ini beserta seluruh riwayat nilainya?")) return;
    try {
      await api.deleteAssignment(id);
      await refreshData();
      await loadAdminData();
      addToast({ title: "Tugas Dihapus", message: "Tugas berhasil dihapus." });
    } catch (e: any) {
      addToast({ title: "Gagal", message: e.message });
    }
  };

  // Export Gradebook CSV
  const handleExportGradebookCSV = () => {
    const headers = ["ID", "Tugas", "Tipe", "Entitas (Siswa/Tim)", "Level Selesai", "Nilai Kuis", "Refleksi", "Nilai Ujian", "Total Nilai", "Status"];
    const rows = progressList.map((p) => [
      p.id,
      p.assignmentId,
      p.teamId ? "TIM" : "INDIVIDU",
      p.teamId || p.userName || p.userId || "Siswa",
      (p.completedLevels || p.completedLevelIds || []).join(";"),
      p.quizScore,
      p.reflectionCompleted ? "SELESAI" : "BELUM",
      p.testScore,
      p.score,
      p.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Buku_Nilai_LOOPYU_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({ title: "Buku Nilai Diekspor", message: "File CSV berhasil diunduh." });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-sm">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">Dashboard Aktivitas & Manajemen Kelas</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                Akses Terbuka
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau tugas perulangan C, manajemen kelompok tim, buku nilai, dan log aktivitas belajar siswa secara terbuka.
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: "overview", label: "Ringkasan", icon: Award },
          { id: "assignments", label: "Kelola Tugas", icon: ClipboardList },
          { id: "teams", label: "Kelola Tim", icon: Users2 },
          { id: "users", label: "Kelola Pengguna", icon: UserCheck },
          { id: "gradebook", label: "Buku Nilai", icon: GraduationCap },
          { id: "settings", label: "Pengaturan", icon: Settings },
          { id: "audit", label: "Log Audit", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase">Total Siswa Terdaftar</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {allUsers.filter((u) => u.role === "STUDENT" || u.role === "TEAM_LEADER").length} Siswa
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Kelas 8A Informatika</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase">Kelompok Tim Aktif</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">{teams.length} Tim</div>
              <div className="text-[11px] text-slate-500 mt-1">Kapasitas 5 siswa/tim</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase">Tugas Terbit</div>
              <div className="text-2xl font-black text-blue-600 mt-1">{assignments.length} Misi</div>
              <div className="text-[11px] text-slate-500 mt-1">Game + Kuis + Refleksi + Tes</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase">Rata-Rata Kelas</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {progressList.length > 0
                  ? Math.round(progressList.reduce((acc, curr) => acc + curr.score, 0) / progressList.length)
                  : 85}{" "}
                Poin
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">Status Sangat Baik</div>
            </div>
          </div>

          {/* Quick Shortcuts & Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900">Tugas Terkini Kelas</h3>
                <button
                  onClick={() => setActiveSubTab("assignments")}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Kelola Semua →
                </button>
              </div>

              <div className="space-y-3">
                {assignments.slice(0, 3).map((asg) => (
                  <div key={asg.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{asg.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {asg.mode}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Target Level: {(asg.targetLevels || asg.levelIds || []).join(", ")} • Tenggat: {asg.dueDate || asg.deadline || "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900">Daftar Tim Aktif</h3>
                <button
                  onClick={() => setActiveSubTab("teams")}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Kelola Tim →
                </button>
              </div>

              <div className="space-y-3">
                {teams.slice(0, 3).map((tm) => (
                  <div key={tm.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{tm.teamName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Kode: {tm.teamCode}</div>
                    </div>
                    <button
                      onClick={() => handleAdminRegenCode(tm.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                    >
                      Regenerate Kode
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNMENTS */}
      {activeSubTab === "assignments" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Daftar Penugasan Belajar C Looping</h2>
            <button
              onClick={() => setShowCreateAssignmentModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Tugas Baru</span>
            </button>
          </div>

          <div className="space-y-3">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">{asg.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      {asg.mode}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      Tenggat: {asg.dueDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{asg.description}</p>
                  <div className="text-[11px] text-slate-600 flex items-center gap-3 pt-1">
                    <span>Target Level: {(asg.targetLevels || asg.levelIds || []).join(", ")}</span>
                    <span>•</span>
                    <span>Kuis ID: {asg.quizId || "quiz-loop-01"}</span>
                    <span>•</span>
                    <span>Refleksi ID: {asg.reflectionTemplateId || "refl-01"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDeleteAssignment(asg.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Tugas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TEAMS */}
      {activeSubTab === "teams" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daftar Tim Kelompok Siswa</h2>
              <p className="text-xs text-slate-500">Pantau kode unik tim, ketua, dan keanggotaan</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-3.5">Nama Tim</th>
                  <th className="p-3.5">Kode Tim</th>
                  <th className="p-3.5">Kelas</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teams.map((tm) => (
                  <tr key={tm.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900">{tm.teamName}</td>
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {tm.teamCode}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">Kelas 8A</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {tm.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleAdminRegenCode(tm.id)}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px] font-bold"
                      >
                        Reset Kode
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(tm.id)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        title="Hapus Tim"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS */}
      {activeSubTab === "users" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daftar Profil Pengguna & Peserta</h2>
              <p className="text-xs text-slate-500">
                Semua siswa dan peserta dapat bermain langsung secara bersamaan tanpa memerlukan kata sandi.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNewUserName("");
                  setNewUserUsername("");
                  setShowCreateUserModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Tambah Peserta Baru</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-3.5">Nama & Avatar</th>
                  <th className="p-3.5">Username</th>
                  <th className="p-3.5">Peran</th>
                  <th className="p-3.5">Kelas</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map((u) => {
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{u.avatar || "🧑‍🎓"}</span>
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            {u.id === appUser.id && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                Sesi Anda Saat Ini
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 font-bold">@{u.username}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : u.role === "TEACHER"
                            ? "bg-blue-100 text-blue-800"
                            : u.role === "TEAM_LEADER"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {u.role === "ADMIN"
                            ? "Administrator"
                            : u.role === "TEACHER"
                            ? "Guru"
                            : u.role === "TEAM_LEADER"
                            ? "Ketua Tim"
                            : "Siswa"}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">{u.classId || "Kelas 8A"}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => switchUser(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer"
                            title="Beralih ke profil ini"
                          >
                            Pilih Profil
                          </button>

                          {u.id !== appUser.id && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs transition-colors cursor-pointer"
                              title="Hapus Pengguna"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: GRADEBOOK */}
      {activeSubTab === "gradebook" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Buku Nilai & Analisis Hasil Belajar</h2>
              <p className="text-xs text-slate-500">
                Laporan penyelesaian 6 level game Blockly C, tantangan perulangan, dan refleksi
              </p>
            </div>
            <button
              onClick={handleExportGradebookCSV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Nilai (CSV)</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-3.5">Peserta / Tim</th>
                  <th className="p-3.5">Tugas</th>
                  <th className="p-3.5 text-center">Progres Level (x/8)</th>
                  <th className="p-3.5 text-center">Refleksi Akhir</th>
                  <th className="p-3.5 text-center">Total Nilai</th>
                  <th className="p-3.5 text-center">Predikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {progressList.map((prog) => {
                  const total = prog.score;
                  let grade = "A";
                  if (total < 70) grade = "C";
                  else if (total < 85) grade = "B";

                  return (
                    <tr key={prog.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">
                          {prog.teamId ? `Tim: ${prog.teamId}` : prog.userName || "Siswa"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {prog.teamId ? "Penilaian Kelompok" : "Penilaian Mandiri"}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-[150px] truncate">{prog.assignmentId}</td>
                      <td className="p-3.5 text-center font-semibold">
                        <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                          {(prog.completedLevels || prog.completedLevelIds || []).length} / 8 Level
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {prog.reflectionCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center font-black text-sm text-slate-900">{prog.score}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded font-black text-xs ${
                          grade === "A"
                            ? "bg-emerald-100 text-emerald-800"
                            : grade === "B"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeSubTab === "settings" && settings && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 max-w-2xl mx-auto space-y-5">
          <h2 className="text-base font-bold text-slate-900">Konfigurasi & Batasan Sistem Kelas</h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="font-bold text-slate-800">Maksimal Anggota per Tim</div>
                <div className="text-slate-500 text-[11px]">Batas jumlah siswa dalam 1 kelompok tim</div>
              </div>
              <input
                type="number"
                min={2}
                max={10}
                value={settings.maxTeamMembers}
                onChange={(e) => updateSettings({ maxTeamMembers: parseInt(e.target.value) || 5 })}
                className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-center font-bold"
              />
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="font-bold text-slate-800">Izinkan Siswa Membuat Tim</div>
                <div className="text-slate-500 text-[11px]">Siswa dapat membuat kelompok mandiri atau hanya guru</div>
              </div>
              <input
                type="checkbox"
                checked={settings.allowStudentTeamCreation}
                onChange={(e) => updateSettings({ allowStudentTeamCreation: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="font-bold text-slate-800">Wajibkan Refleksi Sebelum Ujian</div>
                <div className="text-slate-500 text-[11px]">Siswa harus mengisi refleksi agar ujian dapat dibuka</div>
              </div>
              <input
                type="checkbox"
                checked={settings.requireReflectionBeforeTest}
                onChange={(e) => updateSettings({ requireReflectionBeforeTest: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Tampilkan Leaderboard Publik</div>
                <div className="text-slate-500 text-[11px]">Tampilkan peringkat tim secara publik di kelas</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showPublicLeaderboard}
                onChange={(e) => updateSettings({ showPublicLeaderboard: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOG */}
      {activeSubTab === "audit" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Log Riwayat Audit Sistem</h2>
            <button
              onClick={loadAdminData}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Segarkan Log</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Belum ada riwayat audit tercatat.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="font-mono text-indigo-600 text-[11px] uppercase bg-indigo-50 px-1.5 py-0.2 rounded">
                        {log.action}
                      </span>
                      <span>{log.entityType} ({log.entityId})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Oleh: <strong>{log.userId}</strong>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString("id-ID")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showCreateAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Buat Penugasan Baru</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Tantangan Loop C Tingkat Lanjut"
                  value={newAsgTitle}
                  onChange={(e) => setNewAsgTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Tugas</label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan tujuan dan instruksi pengerjaan..."
                  value={newAsgDesc}
                  onChange={(e) => setNewAsgDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mode Pengerjaan</label>
                  <select
                    value={newAsgMode}
                    onChange={(e: any) => setNewAsgMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="TEAM">Kolaborasi Tim</option>
                    <option value="INDIVIDUAL">Belajar Mandiri</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tenggat Waktu</label>
                  <input
                    type="date"
                    value={newAsgDueDate}
                    onChange={(e) => setNewAsgDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Level Game (Pilih Level yang Harus Dituntaskan)
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Array.from({ length: 6 }, (_, i) => i + 1).map((lvl) => {
                    const isSelected = newAsgLevels.includes(lvl);
                    return (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => {
                          if (isSelected) {
                            setNewAsgLevels((prev) => prev.filter((l) => l !== lvl));
                          } else {
                            setNewAsgLevels((prev) => [...prev, lvl].sort((a, b) => a - b));
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Lvl {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateAssignmentModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Terbitkan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xl">
                👤
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Tambah Akun Pengguna / Siswa</h3>
                <p className="text-[11px] text-slate-500">
                  Tetapkan username dan password agar setiap anak memiliki akun sendiri
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Ahmad Zaki"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username Unik untuk Login</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-mono font-bold">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: zaki01 atau siswa_budi"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peran (Role)</label>
                  <select
                    value={newUserRole}
                    onChange={(e: any) => setNewUserRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="STUDENT">Siswa</option>
                    <option value="TEAM_LEADER">Ketua Tim</option>
                    <option value="TEACHER">Guru</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Avatar</label>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {["🧑‍🎓", "👧", "👦", "👨‍💻", "👩‍💻", "🤖", "🦊", "🚀"].map((av) => (
                      <button
                        type="button"
                        key={av}
                        onClick={() => setNewUserAvatar(av)}
                        className={`text-lg p-1 rounded-lg border transition-all ${
                          newUserAvatar === av
                            ? "bg-indigo-100 border-indigo-400 scale-110 shadow-xs"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Simpan Peserta Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
