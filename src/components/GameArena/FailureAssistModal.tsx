import React from "react";
import { CodeBlock, LevelConfig } from "../../types";
import {
  HelpCircle,
  Lightbulb,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  X,
  ArrowRight,
  Zap,
  Repeat,
  Compass,
  AlertTriangle,
} from "lucide-react";
import { soundManager } from "../../utils/audio";

interface FailureAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: LevelConfig;
  failCount: number;
  onApplyRecommendedBlocks: (blocks: CodeBlock[]) => void;
}

// Recommended solution blocks generator for each level (1-8)
export const getRecommendedSolutionBlocks = (levelId: number): CodeBlock[] => {
  const ts = Date.now();
  switch (levelId) {
    case 1:
      return [
        { id: `rec-1-1-${ts}`, type: "command", action: "move_forward" },
        { id: `rec-1-2-${ts}`, type: "command", action: "take_battery" },
        { id: `rec-1-3-${ts}`, type: "command", action: "move_forward" },
        { id: `rec-1-4-${ts}`, type: "command", action: "take_battery" },
      ];
    case 2:
      return [
        {
          id: `rec-2-rep-${ts}`,
          type: "repeat",
          count: 4,
          commands: [
            { id: `rec-2-1-${ts}`, type: "command", action: "move_forward" },
            { id: `rec-2-2-${ts}`, type: "command", action: "take_battery" },
          ],
        },
      ];
    case 3:
      return [
        {
          id: `rec-3-rep-${ts}`,
          type: "repeat",
          count: 3,
          commands: [
            { id: `rec-3-1-${ts}`, type: "command", action: "move_forward" },
            { id: `rec-3-2-${ts}`, type: "command", action: "turn_left" },
            { id: `rec-3-3-${ts}`, type: "command", action: "move_forward" },
            { id: `rec-3-4-${ts}`, type: "command", action: "take_battery" },
            { id: `rec-3-5-${ts}`, type: "command", action: "turn_right" },
          ],
        },
      ];
    case 4:
      return [
        {
          id: `rec-4-while-${ts}`,
          type: "while",
          condition: "path_clear",
          commands: [
            { id: `rec-4-1-${ts}`, type: "command", action: "move_forward" },
          ],
        },
        { id: `rec-4-2-${ts}`, type: "command", action: "take_battery" },
      ];
    case 5:
      return [
        {
          id: `rec-5-rep-${ts}`,
          type: "repeat",
          count: 3, // Bug fixed from 5 to 3
          commands: [
            { id: `rec-5-1-${ts}`, type: "command", action: "move_forward" },
            { id: `rec-5-2-${ts}`, type: "command", action: "take_battery" },
          ],
        },
      ];
    case 6:
      return [
        {
          id: `rec-6-w1-${ts}`,
          type: "while",
          condition: "path_clear",
          commands: [
            { id: `rec-6-1-${ts}`, type: "command", action: "move_forward" },
          ],
        },
        { id: `rec-6-2-${ts}`, type: "command", action: "turn_right" },
        {
          id: `rec-6-w2-${ts}`,
          type: "while",
          condition: "path_clear",
          commands: [
            { id: `rec-6-3-${ts}`, type: "command", action: "move_forward" },
          ],
        },
        { id: `rec-6-4-${ts}`, type: "command", action: "take_battery" },
      ];
    case 7:
      return [
        {
          id: `rec-7-rep-${ts}`,
          type: "repeat",
          count: 4,
          commands: [
            { id: `rec-7-1-${ts}`, type: "command", action: "move_forward" },
            { id: `rec-7-2-${ts}`, type: "command", action: "move_forward" },
            { id: `rec-7-3-${ts}`, type: "command", action: "take_battery" },
            { id: `rec-7-4-${ts}`, type: "command", action: "turn_right" },
          ],
        },
      ];
    case 8:
      return [
        {
          id: `rec-8-rep1-${ts}`,
          type: "repeat",
          count: 3,
          commands: [
            { id: `rec-8-1-${ts}`, type: "command", action: "move_forward" },
            { id: `rec-8-2-${ts}`, type: "command", action: "take_battery" },
          ],
        },
        {
          id: `rec-8-rep2-${ts}`,
          type: "repeat",
          count: 3,
          commands: [
            { id: `rec-8-tr-${ts}`, type: "command", action: "turn_right" },
            {
              id: `rec-8-w-${ts}`,
              type: "while",
              condition: "path_clear",
              commands: [
                { id: `rec-8-mf-${ts}`, type: "command", action: "move_forward" },
              ],
            },
            { id: `rec-8-tb-${ts}`, type: "command", action: "take_battery" },
          ],
        },
      ];
    default:
      return [];
  }
};

const getSolutionStepsText = (levelId: number): string[] => {
  switch (levelId) {
    case 1:
      return [
        "Misi tutorial pemula: kumpulkan 2 baterai di depan lintasan robot.",
        "Lengkapi pola langkah menjadi: MAJU -> AMBIL BATERAI -> MAJU -> AMBIL BATERAI.",
        "Tekan tombol 'Jalankan Program' untuk melihat robot berhasil mengambil kedua baterai.",
      ];
    case 2:
      return [
        "Tarik balok FOR (...) dengan hitungan 4 kali.",
        "Masukkan balok MAJU ke dalam loop.",
        "Masukkan balok AMBIL BATERAI tepat setelah MAJU di dalam loop.",
      ];
    case 3:
      return [
        "Tarik balok FOR (...) dengan hitungan 3 kali.",
        "Di dalam loop, susun pola tangga: MAJU -> BELOK KIRI -> MAJU -> AMBIL BATERAI -> BELOK KANAN.",
        "Robot akan memanjat 3 anak tangga dan mengambil semua baterai!",
      ];
    case 4:
      return [
        "Tarik balok WHILE (pathClear).",
        "Masukkan balok MAJU ke dalam loop agar robot meluncur sampai mendekati dinding.",
        "Pasang balok AMBIL BATERAI di luar/setelah loop WHILE untuk mengambil baterai di pos akhir.",
      ];
    case 5:
      return [
        "Ada kesalahan hitungan pengulangan (off-by-one bug).",
        "Ubah angka perulangan pada balok FOR dari 5 menjadi 3.",
        "Robot hanya akan mengambil 3 baterai dan tidak akan menabrak dinding di (5,3).",
      ];
    case 6:
      return [
        "Gunakan WHILE (pathClear) berisi MAJU untuk koridor mendatar pertama.",
        "Pasang balok BELOK KANAN di sudut.",
        "Gunakan WHILE (pathClear) kedua berisi MAJU, lalu pasang AMBIL BATERAI!",
      ];
    case 7:
      return [
        "Persegi memiliki 4 sisi identik: gunakan loop FOR (4 kali).",
        "Di dalam loop, masukkan: MAJU -> MAJU -> AMBIL BATERAI -> BELOK KANAN.",
        "Robot akan mengitari seluruh sisi bujur sangkar secara rapi.",
      ];
    case 8:
      return [
        "Langkah 1: Gunakan loop FOR (3 kali) berisi [MAJU -> AMBIL BATERAI] untuk mengumpulkan 3 baterai di baris pertama.",
        "Langkah 2: Susun lorong spiral dengan pola: BELOK KANAN -> WHILE (pathClear) [MAJU] -> AMBIL BATERAI.",
        "Langkah 3: Pola lorong spiral tersebut diulang 3 kali (kamu bisa membungkusnya dengan loop FOR kedua repeat 3 kali)!",
        "Robot akan mengitari seluruh spiral reaktor dan mengambil seluruh 6 baterai secara sempurna!",
      ];
    default:
      return ["Periksa kembali fokus level dan susun balok sesuai petunjuk."];
  }
};

export const FailureAssistModal: React.FC<FailureAssistModalProps> = ({
  isOpen,
  onClose,
  level,
  failCount,
  onApplyRecommendedBlocks,
}) => {
  if (!isOpen) return null;

  const steps = getSolutionStepsText(level.id);

  const handleApply = () => {
    soundManager.playClick();
    const recommended = getRecommendedSolutionBlocks(level.id);
    onApplyRecommendedBlocks(recommended);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl border-2 border-amber-300 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 animate-scaleUp overflow-hidden">
        {/* Top Decorative Amber Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Tutup panduan"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="space-y-1 pr-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Sistem Bantuan Khusus • Gagal {failCount}x</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            Tetap Semangat! Butuh Bantuan di Level {level.id}?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Pemrograman membutuhkan trial and error. Kamu sudah mencoba {failCount} kali! Berikut adalah panduan langkah demi langkah untuk menyelesaikan misi ini:
          </p>
        </div>

        {/* Step-by-Step Guidance Box */}
        <div className="bg-amber-50/70 rounded-xl p-3.5 border border-amber-200 space-y-2">
          <h4 className="text-[11px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Panduan Pola Balok Solusi:
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
            {steps.map((st, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-snug">{st}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Specific Level Advice */}
        <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>
            Setiap level memiliki tombol <strong>AMBIL BATERAI</strong> untuk mengumpulkan energi sebelum garis akhir.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <button
            onClick={handleApply}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md border-b-2 border-amber-700 active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pasang Balok Solusi</span>
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Coba Sendiri
          </button>
        </div>
      </div>
    </div>
  );
};
