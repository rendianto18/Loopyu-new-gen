import React, { useState } from "react";
import { useApp, ActiveNavTab } from "../context/AppContext";
import { BrandLogo } from "./BrandLogo";
import {
  Gamepad2,
  Users2,
  Database,
  Bell,
  Volume2,
  VolumeX,
  Coins,
  ChevronDown,
  Copy,
  Check,
  ClipboardList,
  Sparkles,
  User,
  PlusCircle,
  Users,
  Smile,
  Radio,
} from "lucide-react";

const AVATAR_OPTIONS = [
  "🤖", "🚀", "🐱", "🦊", "🦁", "🐼", "🦉", "👩‍💻", "👨‍💻", "⚡", "🌟", "🎮", "🦄", "🎯", "🎨"
];

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    appUser,
    allUsers,
    switchUser,
    currentTeam,
    learningMode,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    soundEnabled,
    toggleSound,
    isSocketConnected,
    addToast,
    onlineUsers,
    sessionId,
    updateSessionProfile,
    createNewSession,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSessionMenuOpen, setIsSessionMenuOpen] = useState(false);
  const [isOnlineListOpen, setIsOnlineListOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Edit name state inside session popover
  const [editingName, setEditingName] = useState(appUser.name);
  const [showUserPicker, setShowUserPicker] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleCopyTeamCode = () => {
    if (!currentTeam) return;
    navigator.clipboard.writeText(currentTeam.teamCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    addToast({
      title: "Kode Tim Disalin",
      message: `Kode ${currentTeam.teamCode} siap dibagikan ke teman satu tim.`,
    });
  };

  const handleSaveName = async () => {
    if (editingName.trim()) {
      await updateSessionProfile(editingName.trim(), appUser.avatar || "🧑‍🎓");
    }
  };

  const handleSelectAvatar = async (avatar: string) => {
    await updateSessionProfile(appUser.name, avatar);
  };

  // Only Start Screen and Game Arena (removed team, tasks, database)
  const navTabs: { id: ActiveNavTab; label: string; icon: any }[] = [
    { id: "start", label: "Mulai / Beranda", icon: Sparkles },
    { id: "arena", label: "Game Arena (8 Level)", icon: Gamepad2 },
  ];

  const onlineCount = Math.max(onlineUsers.length, 1);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-2 sm:gap-3">
          {/* Brand Identity - Interactive Loopi Mascot */}
          <BrandLogo
            isSocketConnected={isSocketConnected}
            soundEnabled={soundEnabled}
            onClick={() => setActiveTab("start")}
          />

          {/* Navigation Tabs - Desktop Segmented Bar */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-blue-600 shadow-xs border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Live Online Sessions Counter Pill */}
            <div className="relative">
              <button
                onClick={() => setIsOnlineListOpen(!isOnlineListOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold transition-colors cursor-pointer"
                title="Pemain & Sesi yang sedang aktif saat ini"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] animate-pulse" />
                <span className="hidden sm:inline">{onlineCount} Sesi Aktif</span>
                <span className="sm:hidden">{onlineCount}</span>
              </button>

              {/* Online Users Popover */}
              {isOnlineListOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-2 animate-scaleUp">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      <span>Sesi Terhubung Real-time</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {onlineCount} Online
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Aplikasi ini mendukung banyak orang bermain secara bersamaan dengan sesi independen masing-masing.
                  </p>

                  <div className="max-h-56 overflow-y-auto space-y-1.5 divide-y divide-slate-50">
                    {onlineUsers.length > 0 ? (
                      onlineUsers.map((u, i) => (
                        <div key={u.userId || i} className="pt-1.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{u.avatar || "🧑‍🎓"}</span>
                            <div>
                              <div className="font-bold text-slate-800 flex items-center gap-1">
                                <span>{u.userName}</span>
                                {u.userId === appUser.id && (
                                  <span className="text-[9px] bg-blue-100 text-blue-700 px-1 rounded font-bold">
                                    Kamu
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {u.activeLevelId && (
                            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              Lvl {u.activeLevelId}
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="pt-1.5 flex items-center gap-2 text-xs">
                        <span className="text-base">{appUser.avatar || "🧑‍🎓"}</span>
                        <span className="font-bold text-slate-800">{appUser.name} (Sesi Anda)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Coins & XP */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100/80 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-200/70 text-xs font-bold">
              <div className="flex items-center gap-1 text-amber-700" title="Koin LOOPYU">
                <Coins className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{currentUser.coins}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="text-blue-700" title="XP Pengalaman">
                <span>{currentUser.points} XP</span>
              </div>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? "bg-sky-50 text-blue-600 border-sky-200 hover:bg-sky-100"
                  : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
              }`}
              title={soundEnabled ? "Audio Aktif" : "Audio Nonaktif"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors"
                title="Notifikasi Aktivitas Tim"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-scaleUp">
                  <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">Notifikasi Tim & Kelas</span>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
                      >
                        Bersihkan
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        Belum ada notifikasi.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-3 text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                            n.read
                              ? "bg-white text-slate-500"
                              : "bg-blue-50/60 text-slate-800 font-semibold"
                          }`}
                        >
                          <div className="text-lg">{n.avatar || "🔔"}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 text-xs">{n.title}</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">{n.message}</div>
                            <div className="text-[9px] text-slate-400 mt-1">
                              {new Date(n.timestamp || n.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Session Profile Widget (No login/admin barrier) */}
            <div className="relative">
              <button
                onClick={() => {
                  setEditingName(appUser.name);
                  setIsSessionMenuOpen(!isSessionMenuOpen);
                }}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 transition-colors text-left shadow-2xs cursor-pointer"
                title="Atur Nama & Profil Sesi Pemain"
              >
                <div className="text-xl leading-none">{currentUser.avatar || appUser.avatar || "🧑‍🎓"}</div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight max-w-[120px] truncate">
                    {appUser.name}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      Sesi Aktif
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Session Profile Popover */}
              {isSessionMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 space-y-3.5 animate-scaleUp">
                  {/* Current Session Header */}
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl border border-sky-100">
                    <div className="text-3xl">{currentUser.avatar || appUser.avatar || "🧑‍🎓"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{appUser.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ID: {sessionId.slice(0, 14)}...
                      </div>
                      <span className="inline-block mt-1 text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                        🟢 Sesi Mandiri
                      </span>
                    </div>
                  </div>

                  {/* Change Player Name in this session */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                      <span>Nama Pemain di Sesi Ini:</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Ketik nama kamu..."
                        maxLength={24}
                        className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                      <button
                        onClick={handleSaveName}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>

                  {/* Pick Avatar */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <Smile className="w-3 h-3 text-amber-500" />
                      <span>Pilih Karakter Avatar:</span>
                    </label>
                    <div className="grid grid-cols-5 gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      {AVATAR_OPTIONS.map((av) => (
                        <button
                          key={av}
                          onClick={() => handleSelectAvatar(av)}
                          className={`text-xl p-1.5 rounded-lg transition-transform hover:scale-110 flex items-center justify-center cursor-pointer ${
                            (currentUser.avatar || appUser.avatar) === av
                              ? "bg-white shadow-xs border-2 border-blue-500"
                              : "hover:bg-white"
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start a New Session Button */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => {
                        createNewSession();
                        setIsSessionMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Mulai Sesi Baru (+ Pemain Baru)</span>
                    </button>

                    <button
                      onClick={() => setShowUserPicker(!showUserPicker)}
                      className="w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-800 font-medium py-1 transition-colors cursor-pointer"
                    >
                      <Users className="w-3 h-3" />
                      <span>{showUserPicker ? "Tutup Pilihan Profil" : "Atau Pilih dari Profil Terdaftar"}</span>
                    </button>

                    {showUserPicker && (
                      <div className="max-h-40 overflow-y-auto space-y-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
                        {allUsers.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => {
                              switchUser(u.id);
                              setIsSessionMenuOpen(false);
                            }}
                            className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                              u.id === appUser.id
                                ? "bg-blue-100/70 text-blue-900 font-bold"
                                : "hover:bg-slate-200/60 text-slate-700"
                            }`}
                          >
                            <span className="text-base">{u.avatar || "🧑‍🎓"}</span>
                            <span className="truncate flex-1">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex lg:hidden overflow-x-auto py-1.5 gap-1 border-t border-slate-100 no-scrollbar">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
