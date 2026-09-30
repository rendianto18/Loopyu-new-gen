import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { ToastContainer } from "./components/Notifications/ToastContainer";
import { StartScreen } from "./components/StartScreen/StartScreen";
import { GameArena } from "./components/GameArena/GameArena";
import { Sparkles, Gamepad2 } from "lucide-react";

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setCurrentLevelId,
    isSocketConnected,
  } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-sky-50/50 to-indigo-50/40 text-slate-800 flex flex-col font-sans selection:bg-amber-300 selection:text-slate-900 relative overflow-x-hidden">
      {/* Playful Ambient Background Shapes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-sky-200/35 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute top-2/3 -left-20 w-80 h-80 bg-emerald-200/25 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <div className="relative z-30">
        <Navbar />
      </div>

      {/* Main Tab Content - Simple, focused on Start Screen & 6-Level Game Arena */}
      <main className="flex-1 pb-12 relative z-10">
        {activeTab === "start" && (
          <StartScreen
            onStart={() => setActiveTab("arena")}
            onSelectLevel={(lvlId) => {
              setCurrentLevelId(lvlId);
              setActiveTab("arena");
            }}
          />
        )}

        {activeTab === "arena" && (
          <GameArena
            onBackToStart={() => setActiveTab("start")}
          />
        )}
      </main>

      {/* Real-time Toast Notifications */}
      <ToastContainer />

      {/* Simple, Clean Bottom Status Footer */}
      <footer className="border-t border-slate-200/80 bg-white/90 backdrop-blur-md py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-600 relative z-20 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 text-sm">
              <Sparkles className="w-4 h-4 text-amber-500 animate-wiggle" />
              LOOPYU
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 text-[11px] font-semibold">
              Game Edukasi Pemrograman Logika Perulangan Bahasa C (for & while) 🚀
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="bg-blue-50 text-blue-800 font-bold px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1.5 shadow-2xs">
              <Gamepad2 className="w-3.5 h-3.5 text-blue-600" />
              <span>8 Level Interaktif</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
