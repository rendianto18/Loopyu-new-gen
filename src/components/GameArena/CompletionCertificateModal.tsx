import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { soundManager } from "../../utils/audio";
import {
  Trophy,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  User,
  GraduationCap,
  Calendar,
  Share2,
  RefreshCw,
  X,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";

interface CompletionCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedCount: number;
  totalMissions: number;
  elapsedSeconds: number;
  onRestartAll?: () => void;
}

export function formatTimeDisplay(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s} Detik`;
  return `${m} Menit ${s} Detik`;
}

export const CompletionCertificateModal: React.FC<CompletionCertificateModalProps> = ({
  isOpen,
  onClose,
  completedCount,
  totalMissions,
  elapsedSeconds,
  onRestartAll,
}) => {
  const { appUser, updateSessionProfile, addToast } = useApp();

  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem("loopyu_student_name") || appUser.name || "Nama Siswa";
  });
  const [studentClass, setStudentClass] = useState<string>(() => {
    return localStorage.getItem("loopyu_student_class") || "Kelas 10 RPL";
  });

  const [reflection1, setReflection1] = useState<string>(() => {
    return localStorage.getItem("loopyu_reflection_q1") || "";
  });
  const [reflection2, setReflection2] = useState<string>(() => {
    return localStorage.getItem("loopyu_reflection_q2") || "";
  });

  const [isSavedReflection, setIsSavedReflection] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trigger celebration confetti on open
  useEffect(() => {
    if (isOpen) {
      soundManager.play("win");
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {}
    }
  }, [isOpen]);

  // Sync state to localStorage
  const handleNameChange = (val: string) => {
    setStudentName(val);
    localStorage.setItem("loopyu_student_name", val);
  };

  const handleClassChange = (val: string) => {
    setStudentClass(val);
    localStorage.setItem("loopyu_student_class", val);
  };

  const handleSaveReflection = () => {
    localStorage.setItem("loopyu_reflection_q1", reflection1);
    localStorage.setItem("loopyu_reflection_q2", reflection2);
    if (studentName.trim()) {
      updateSessionProfile(studentName.trim(), appUser.avatar || "🧑‍🎓");
    }
    setIsSavedReflection(true);
    soundManager.play("success");
    addToast({
      title: "Data & Refleksi Disimpan!",
      message: "Nama, kelas, dan refleksi berhasil disimpan ke kartu sertifikat.",
      type: "success",
    });
    setTimeout(() => setIsSavedReflection(false), 2500);
  };

  // Draw High-Resolution Certificate on Canvas
  const drawCertificate = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const width = 1200;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background Gradient (Dark Tech Navy to Slate)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#090d16");
    bgGrad.addColorStop(0.5, "#0f172a");
    bgGrad.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Golden/Cyan Border
    ctx.lineWidth = 10;
    const borderGrad = ctx.createLinearGradient(0, 0, width, height);
    borderGrad.addColorStop(0, "#f59e0b");
    borderGrad.addColorStop(0.3, "#38bdf8");
    borderGrad.addColorStop(0.7, "#818cf8");
    borderGrad.addColorStop(1, "#ec4899");
    ctx.strokeStyle = borderGrad;
    ctx.strokeRect(24, 24, width - 48, height - 48);

    // Inner Thin Line
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Corner Accents
    const cornerSize = 40;
    ctx.fillStyle = "#f59e0b";
    // Top-left
    ctx.fillRect(32, 32, cornerSize, 4);
    ctx.fillRect(32, 32, 4, cornerSize);
    // Top-right
    ctx.fillRect(width - 32 - cornerSize, 32, cornerSize, 4);
    ctx.fillRect(width - 36, 32, 4, cornerSize);
    // Bottom-left
    ctx.fillRect(32, height - 36, cornerSize, 4);
    ctx.fillRect(32, height - 32 - cornerSize, 4, cornerSize);
    // Bottom-right
    ctx.fillRect(width - 32 - cornerSize, height - 36, cornerSize, 4);
    ctx.fillRect(width - 36, height - 32 - cornerSize, 4, cornerSize);

    // Top Platform Brand Badge
    ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
    ctx.beginPath();
    ctx.roundRect(width / 2 - 190, 60, 380, 42, 21);
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 15px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⭐ LOOPYU • PEMROGRAMAN BAHASA C ⭐", width / 2, 86);

    // Certificate Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 42px 'Outfit', sans-serif";
    ctx.fillText("SERTIFIKAT KELULUSAN MISI", width / 2, 155);

    // Subtitle
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 18px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("Logika Perulangan Pemrograman Bahasa C: FOR & WHILE", width / 2, 190);

    // Divider Line
    ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 160, 215);
    ctx.lineTo(width / 2 + 160, 215);
    ctx.stroke();

    // "Diberikan Kepada:"
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "italic 16px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("Dengan bangga menyatakan bahwa:", width / 2, 255);

    // Student Name (Large Highlight)
    const nameToRender = (studentName || "Nama Siswa").trim();
    ctx.fillStyle = "#38bdf8";
    ctx.font = "900 44px 'Outfit', sans-serif";
    ctx.fillText(nameToRender, width / 2, 315);

    // Class Name Badge
    const classToRender = (studentClass || "Kelas 10").trim();
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.roundRect(width / 2 - 140, 340, 280, 36, 18);
    ctx.fill();
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(classToRender, width / 2, 364);

    // Statement of Mastery
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "500 17px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(
      `Telah berhasil menuntaskan seluruh ${totalMissions} Misi Pembelajaran Perulangan Bahasa C`,
      width / 2,
      425
    );
    ctx.fillText(
      "dengan menguasai konsep dasar Loop FOR, Logika WHILE pathClear(), off-by-one debugging,",
      width / 2,
      452
    );
    ctx.fillText(
      "serta pemaduan algoritma kontrol perulangan yang terstruktur dan efisien.",
      width / 2,
      479
    );

    // Stats Grid Box (Missions Completed & Time Elapsed - NO SCORE!)
    const boxY = 525;
    const boxW = 860;
    const boxH = 105;
    const boxX = (width - boxW) / 2;

    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Box Stat 1: Total Missions
    ctx.textAlign = "center";
    ctx.fillStyle = "#34d399";
    ctx.font = "900 28px 'Outfit', sans-serif";
    ctx.fillText(`${completedCount} / ${totalMissions} Misi`, boxX + boxW * 0.25, boxY + 45);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("STATUS SELESAI TUNTAS", boxX + boxW * 0.25, boxY + 75);

    // Stat Divider
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(boxX + boxW * 0.5, boxY + 18);
    ctx.lineTo(boxX + boxW * 0.5, boxY + boxH - 18);
    ctx.stroke();

    // Box Stat 2: Time Elapsed
    const timeFormatted = formatTimeDisplay(elapsedSeconds);
    ctx.fillStyle = "#f59e0b";
    ctx.font = "900 28px 'Outfit', sans-serif";
    ctx.fillText(timeFormatted, boxX + boxW * 0.75, boxY + 45);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("WAKTU PENYELESAIAN TERHITUNG", boxX + boxW * 0.75, boxY + 75);

    // Footer Info: Date and Verification
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    ctx.textAlign = "left";
    ctx.fillStyle = "#64748b";
    ctx.font = "500 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`📅 Tanggal Terbit: ${today}`, 70, 715);
    ctx.fillText("🤖 Diverifikasi otomatis oleh Platform Pembelajaran LOOPYU", 70, 735);

    ctx.textAlign = "right";
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 14px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("✓ VERIFIED C LOGIC COMPLETION", width - 70, 715);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 12px 'JetBrains Mono', monospace";
    ctx.fillText("NO_SCORE_COMPETENCE_BASED", width - 70, 735);

    return canvas.toDataURL("image/png");
  };

  const handleDownloadImage = () => {
    setIsGeneratingImage(true);
    try {
      const dataUrl = drawCertificate();
      if (!dataUrl) {
        addToast({
          title: "Gagal Mengunduh",
          message: "Tidak dapat menghasilkan gambar sertifikat.",
          type: "error",
        });
        return;
      }

      const safeName = (studentName || "Siswa")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 30);
      const link = document.createElement("a");
      link.download = `Sertifikat_LOOPYU_${safeName}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      soundManager.play("win");
      addToast({
        title: "Gambar Sertifikat Berhasil Diunduh! 📥",
        message: `File Sertifikat_LOOPYU_${safeName}.png tersimpan di perangkatmu.`,
        type: "success",
      });
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  if (!isOpen) return null;

  const timeFormatted = formatTimeDisplay(elapsedSeconds);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      {/* Hidden high-res canvas used for generating download PNG */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full my-auto overflow-hidden animate-scaleUp flex flex-col max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30 text-amber-300">
              <Trophy className="w-8 h-8 fill-amber-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold mb-1 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>Pencapaian Akhir Pemrograman C</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Selamat! Kamu Telah Menyelesaikan Misi! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 font-medium mt-0.5">
                Semua rangkaian tantangan logika perulangan (FOR dan WHILE) sukses dituntaskan.
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Mission Completion & Time Elapsed Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Status Misi Selesai
                </span>
                <div className="text-lg font-black text-slate-900">
                  {completedCount} dari {totalMissions} Misi
                </div>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Semua rute perulangan tuntas 100%
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <Clock className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Waktu Penyelesaian
                </span>
                <div className="text-lg font-black text-slate-900">
                  {timeFormatted}
                </div>
                <p className="text-[11px] text-amber-700 font-medium">
                  Terhitung otomatis sejak petualangan dimulai
                </p>
              </div>
            </div>
          </div>

          {/* Student Identity Form: Nama dan Kelas */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Identitas Siswa (Untuk Sertifikat Gambar)</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Ketik nama & kelasmu di bawah
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Siswa:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Contoh: Rendi Siswanto"
                    maxLength={35}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kelas / Rombel:
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={studentClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    placeholder="Contoh: X RPL 1 / Kelas 10A"
                    maxLength={25}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Refleksi Pembelajaran Section */}
          <div className="p-4 sm:p-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-3.5">
            <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm border-b border-indigo-100 pb-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Refleksi Pengalaman Pembelajaran Perulangan C</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  1. Berdasarkan 10 misi yang telah diselesaikan, apa perbedaan paling mendasar antara perulangan FOR dan WHILE dalam bahasa C?
                </label>
                <textarea
                  rows={2}
                  value={reflection1}
                  onChange={(e) => setReflection1(e.target.value)}
                  placeholder="Contoh: FOR digunakan saat jumlah iterasi sudah diketahui pasti (ada counter batas), sedangkan WHILE digunakan saat jumlah putaran bergantung pada kondisi jalan aman (pathClear)..."
                  className="w-full p-2.5 rounded-xl border border-indigo-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  2. Kapan sebaiknya kamu menggunakan loop FOR, dan kapan sebaiknya memilih loop WHILE dalam memecahkan masalah pemrograman?
                </label>
                <textarea
                  rows={2}
                  value={reflection2}
                  onChange={(e) => setReflection2(e.target.value)}
                  placeholder="Contoh: Gunakan FOR saat mengulang pola 4 sisi kotak atau mengambil 3 baterai berjejer. Gunakan WHILE saat melintasi lorong yang panjangnya fleksibel hingga mendeteksi dinding..."
                  className="w-full p-2.5 rounded-xl border border-indigo-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveReflection}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSavedReflection ? "Tersimpan ✓" : "Simpan Refleksi & Data"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Visual Certificate Card Preview (Matches canvas for exact fidelity) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Pratinjau Sertifikat Kelulusan Gambar</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Format PNG resolusi tinggi siap disimpan
              </span>
            </div>

            <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border-2 border-amber-400/60 shadow-xl relative overflow-hidden text-center space-y-3">
              {/* Top pill */}
              <div className="inline-block px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 font-bold text-[10px] tracking-wider border border-sky-400/30">
                LOOPYU • EDUKASI BAHASA C
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                SERTIFIKAT KELULUSAN MISI
              </h3>

              <div className="w-20 h-0.5 bg-gradient-to-r from-amber-400 to-pink-500 mx-auto" />

              <p className="text-xs text-slate-300 italic">Diberikan kepada:</p>

              <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-pink-300">
                {studentName || "Nama Siswa"}
              </div>

              <div className="inline-block px-3 py-0.5 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/15">
                {studentClass || "Kelas 10"}
              </div>

              <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed pt-1">
                Telah berhasil menyelesaikan seluruh <strong>{totalMissions} Misi Perulangan C</strong> (Loop FOR, Logika WHILE, Off-by-one Debugging, dan Traversal Alur).
              </p>

              {/* Time & Mission badges inside preview */}
              <div className="pt-2 flex items-center justify-center gap-3 text-xs">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl font-bold">
                  ✓ {completedCount}/{totalMissions} Misi Tuntas
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl font-bold">
                  ⏱ {timeFormatted}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
            Kamu dapat mengunduh gambar sertifikat ini untuk portofolio atau laporan belajar.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isGeneratingImage}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingImage ? "Membuat Gambar..." : "Simpan Gambar (PNG)"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
