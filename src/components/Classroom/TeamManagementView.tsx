import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Users2,
  Crown,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  PlusCircle,
  LogIn,
  LogOut,
  Sparkles,
  Award,
  Activity,
  UserPlus,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Gamepad2,
} from "lucide-react";
import * as api from "../../services/api";

export const TeamManagementView: React.FC = () => {
  const {
    appUser,
    currentTeam,
    currentTeamMembers,
    teamActivities,
    joinTeamByCode,
    createNewTeam,
    leaveCurrentTeam,
    refreshTeamData,
    teams,
    learningMode,
    setLearningMode,
    currentAssignment,
    assignmentProgress,
    setActiveTab,
    addToast,
  } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [newTeamNameInput, setNewTeamNameInput] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isJoiningTeam, setIsJoiningTeam] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const isLeader = currentTeam?.leaderId === appUser.id || appUser.role === "ADMIN" || appUser.role === "TEACHER";

  const handleCopyCode = () => {
    if (!currentTeam) return;
    navigator.clipboard.writeText(currentTeam.teamCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    addToast({
      title: "Kode Tim Disalin",
      message: `Kode ${currentTeam.teamCode} siap dibagikan ke teman satu kelompok.`,
    });
  };

  const handleRegenerateCode = async () => {
    if (!currentTeam || !isLeader) return;
    setIsRegenerating(true);
    try {
      const res = await api.regenerateTeamCode(currentTeam.id);
      await refreshTeamData();
      addToast({
        title: "Kode Tim Diperbarui",
        message: `Kode baru tim: ${res.newCode}`,
      });
    } catch (e: any) {
      addToast({
        title: "Gagal Mengubah Kode",
        message: e.message || "Terjadi kesalahan.",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    setIsJoiningTeam(true);
    await joinTeamByCode(joinCodeInput.trim().toUpperCase());
    setIsJoiningTeam(false);
    setJoinCodeInput("");
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamNameInput.trim()) return;
    setIsCreatingTeam(true);
    try {
      await createNewTeam(newTeamNameInput.trim());
      setNewTeamNameInput("");
    } catch (e: any) {
      addToast({
        title: "Gagal Membuat Tim",
        message: e.message || "Terjadi kesalahan.",
      });
    } finally {
      setIsCreatingTeam(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">Manajemen Tim Belajar</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Kelas 8A
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kolaborasi pemecahan masalah logika C looping bersama rekan kelompok Anda
            </p>
          </div>
        </div>

        {/* Learning Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold w-full md:w-auto justify-center">
          <button
            onClick={() => {
              setLearningMode("TEAM");
              addToast({ title: "Mode Tim Aktif", message: "Progress tugas disinkronkan dengan tim." });
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              learningMode === "TEAM"
                ? "bg-white text-blue-600 shadow-xs border border-slate-200 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users2 className="w-4 h-4" />
            <span>Mode Tim</span>
          </button>
          <button
            onClick={() => {
              setLearningMode("INDIVIDUAL");
              addToast({ title: "Mode Mandiri Aktif", message: "Progress dihitung per individu." });
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              learningMode === "INDIVIDUAL"
                ? "bg-white text-blue-600 shadow-xs border border-slate-200 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Mode Individu</span>
          </button>
        </div>
      </div>

      {/* If User Has a Team */}
      {currentTeam ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Info & Member Roster (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Team Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">
                      <span>Tim Aktif</span>
                      <span>•</span>
                      <span>Kapasitas: {currentTeamMembers.length}/5 Anggota</span>
                    </div>
                    <h2 className="text-2xl font-black">{currentTeam.teamName}</h2>
                  </div>

                  {/* Team Code Display */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex items-center justify-between sm:justify-start gap-3">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-blue-100">Kode Undangan Tim</div>
                      <div className="text-lg font-mono font-black tracking-wider text-amber-300">
                        {currentTeam.teamCode}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleCopyCode}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                        title="Salin Kode Tim"
                      >
                        {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      </button>
                      {isLeader && (
                        <button
                          onClick={handleRegenerateCode}
                          disabled={isRegenerating}
                          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors disabled:opacity-50"
                          title="Generate Ulang Kode Tim"
                        >
                          <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users2 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-800 text-sm">Anggota Kelompok</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Maksimal 5 siswa per tim
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentTeamMembers.map((m) => {
                    const memberName = m.user?.name || "Anggota Tim";
                    const isSelf = m.userId === appUser.id;
                    const isMemberLeader = m.role === "LEADER";

                    return (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isSelf
                            ? "bg-blue-50/60 border-blue-200"
                            : "bg-slate-50/60 border-slate-200/70 hover:bg-slate-100/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xl shadow-2xs">
                            {isMemberLeader ? "👨‍💻" : "🧑‍🎓"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900">{memberName}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-200 text-blue-800">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {isMemberLeader ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-200">
                                  <Crown className="w-2.5 h-2.5 fill-amber-500" />
                                  Ketua Tim
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-slate-500 bg-slate-200/60 px-1.5 py-0.2 rounded">
                                  Anggota
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Online Indicator */}
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Aktif</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Team Controls Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                  <div className="text-xs text-slate-500">
                    Semua progres 6 level Blockly C dan tantangan tim akan dicatat atas nama tim ini.
                  </div>
                  <button
                    onClick={leaveCurrentTeam}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar dari Tim</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Team Assignment Progress Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Status Tugas & Misi Tim</h3>
                </div>
                {currentAssignment && (
                  <button
                    onClick={() => setActiveTab("arena")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Masuk ke Game Arena</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {currentAssignment ? (
                (() => {
                  const asgLevels = currentAssignment.targetLevels || currentAssignment.levelIds || [1, 2, 3, 4, 5, 6, 7, 8];
                  const compLevels = assignmentProgress ? (assignmentProgress.completedLevels || assignmentProgress.completedLevelIds || []) : [];
                  return (
                    <div className="space-y-4">
                      <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-black text-indigo-950">{currentAssignment.title}</div>
                          <div className="text-[11px] text-indigo-700 mt-0.5">
                            Target: Level {asgLevels.join(", ")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-600">Total Skor Tim</div>
                          <div className="text-xl font-black text-indigo-700">
                            {assignmentProgress ? assignmentProgress.score : 0} Poin
                          </div>
                        </div>
                      </div>

                      {/* 2 Pillars Progress */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Game Arena Levels */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                          <Gamepad2 className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                          <div className="text-[11px] font-bold text-slate-700">6 Level Game</div>
                          <div className="text-sm font-black text-slate-900 mt-0.5">
                            {compLevels.length} / {asgLevels.length} Selesai
                          </div>
                        </div>

                        {/* Reflection */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                          <BookOpen className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                          <div className="text-[11px] font-bold text-slate-700">Refleksi Akhir</div>
                          <div className="text-sm font-black text-slate-900 mt-0.5">
                            {assignmentProgress?.reflectionCompleted ? (
                              <span className="text-emerald-600 font-black">Selesai ✓</span>
                            ) : (
                              <span className="text-slate-400 font-medium">Opsional</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Belum ada tugas aktif untuk tim ini.
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed & Team Code Helper (Col 3) */}
          <div className="space-y-6">
            {/* Live Team Activities */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
              <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-slate-100">
                <Activity className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Aktivitas Terkini Tim
                </h3>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {teamActivities.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    Belum ada rekaman aktivitas kelompok.
                  </div>
                ) : (
                  teamActivities.slice(0, 8).map((act) => (
                    <div key={act.id} className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-blue-600">{act.userName}</span>
                        <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div className="font-bold text-slate-800 mt-0.5">{act.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{act.description}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Switch / Join Other Team */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200 p-5">
              <h4 className="font-bold text-xs text-slate-900 mb-2">Punya Kode Tim Lain?</h4>
              <p className="text-[11px] text-slate-500 mb-3">
                Masukkan kode tim yang diberikan oleh teman kelompok Anda untuk berpindah tim.
              </p>
              <form onSubmit={handleJoinSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: LP-4821"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isJoiningTeam}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  Gabung
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* If User Does Not Have a Team Yet */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto py-8">
          {/* Option A: Join Existing Team */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-slate-900 mb-1">Gabung ke Tim yang Ada</h2>
              <p className="text-xs text-slate-500 mb-4">
                Jika ketua tim Anda sudah membuat kelompok, mintalah 7 digit kode tim (misal: LP-4821).
              </p>

              <form onSubmit={handleJoinSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Tim</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: LP-4821"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono uppercase tracking-wider focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isJoiningTeam}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isJoiningTeam ? "Menghubungkan..." : "Gabung ke Kelompok"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Option B: Create New Team */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-slate-900 mb-1">Buat Tim Belajar Baru</h2>
              <p className="text-xs text-slate-500 mb-4">
                Buat tim baru dan Anda akan otomatis menjadi Ketua Tim. Bagikan kode yang muncul ke teman-teman Anda.
              </p>

              <form onSubmit={handleCreateSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Tim</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: LOOP MASTER"
                    value={newTeamNameInput}
                    onChange={(e) => setNewTeamNameInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreatingTeam}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isCreatingTeam ? "Memproses..." : "Buat Tim Sekarang"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
