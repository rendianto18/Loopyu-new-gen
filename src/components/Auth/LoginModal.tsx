import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Users2,
  CheckCircle2,
  AlertCircle,
  X,
  LogIn,
} from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  canDismiss = true,
}) => {
  const { login, allUsers, appUser } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Mohon masukkan username dan password Anda.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const success = await login(username.trim(), password.trim());
    setIsLoading(false);

    if (success) {
      if (onClose) onClose();
    } else {
      setErrorMsg("Username atau password salah! Silakan coba lagi.");
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative animate-scaleUp">
        {/* Playful Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white p-6 relative">
          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shadow-inner">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xl font-black tracking-tight">Masuk ke LOOPYU</h3>
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              </div>
              <p className="text-xs text-indigo-100 font-medium">
                Setiap anak & guru memiliki akun tersendiri
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="font-semibold">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Username Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Contoh: student01 atau admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Password / Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Masukkan password akun Anda"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-black text-xs shadow-md border-b-3 border-indigo-800 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memeriksa kredensial...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Sekarang</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pilih Cepat Akun (Klik untuk Isi Otomatis)
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold">
                {allUsers.length} Akun Terdaftar
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {/* Prioritize Admin & Teacher */}
              {allUsers
                .filter((u) => u.role === "ADMIN" || u.role === "TEACHER")
                .map((u) => {
                  const pass = u.password || (u.role === "ADMIN" ? "admin123" : "guru123");
                  const isAdminRole = u.role === "ADMIN";
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickFill(u.username, pass)}
                      className={`p-2.5 rounded-xl border text-left transition-all group ${
                        isAdminRole
                          ? "border-purple-200 bg-purple-50/70 hover:bg-purple-100"
                          : "border-blue-200 bg-blue-50/70 hover:bg-blue-100"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <span>{u.avatar || (isAdminRole ? "🛡️" : "👨‍🏫")}</span>
                        <span className={isAdminRole ? "text-purple-900" : "text-blue-900"}>
                          {u.name} ({isAdminRole ? "Admin" : "Guru"})
                        </span>
                      </div>
                      <div className="text-[10px] font-mono mt-0.5 text-slate-600">
                        @{u.username} / {pass}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        {isAdminRole ? "Akses server & tambah user" : "Kelola tugas kelas"}
                      </div>
                    </button>
                  );
                })}

              {/* Student accounts (including newly created ones) */}
              {allUsers
                .filter((u) => u.role !== "ADMIN" && u.role !== "TEACHER")
                .map((u) => {
                  const pass = u.password || "siswa123";
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickFill(u.username, pass)}
                      className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-left transition-all group"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                        <span>{u.avatar || "🧑‍🎓"}</span>
                        <span className="truncate">{u.name}</span>
                        {u.role === "TEAM_LEADER" && (
                          <span className="text-[9px] bg-amber-200 px-1 rounded text-amber-800">
                            Ketua
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-amber-700 font-mono mt-0.5">
                        @{u.username} / {pass}
                      </div>
                      <div className="text-[9px] text-amber-600 mt-0.5 truncate">
                        {u.classId || "Kelas 8A"}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>🔒 Akses aman & terenkripsi</span>
          <span className="font-semibold text-slate-600">LOOPYU Edu v1.0</span>
        </div>
      </div>
    </div>
  );
};
