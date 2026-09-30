import React from "react";
import { useApp } from "../../context/AppContext";
import { X, Bell, Trophy, CheckCircle, Sparkles, AlertCircle } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {(toasts || []).map((toast) => {
        let Icon = Bell;
        let colorClass = "border-blue-300 bg-white text-blue-900 shadow-blue-100";
        let iconBg = "bg-blue-100 text-blue-700";

        if (toast.type === "mission_completed" || toast.type === "badge_earned") {
          Icon = Trophy;
          colorClass = "border-amber-300 bg-white text-amber-950 shadow-amber-100";
          iconBg = "bg-amber-100 text-amber-700";
        } else if (toast.type === "task_status" || toast.type === "success") {
          Icon = CheckCircle;
          colorClass = "border-emerald-300 bg-white text-emerald-950 shadow-emerald-100";
          iconBg = "bg-emerald-100 text-emerald-700";
        } else if (toast.type === "review_requested") {
          Icon = Sparkles;
          colorClass = "border-purple-300 bg-white text-purple-950 shadow-purple-100";
          iconBg = "bg-purple-100 text-purple-700";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border-2 shadow-xl animate-in slide-in-from-right duration-200 ${colorClass}`}
          >
            <div className={`p-2 rounded-xl flex-shrink-0 ${iconBg}`}>
              <Icon className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black truncate">{toast.title}</span>
                <span className="text-[10px] font-bold text-slate-400">Otomatis 🔔</span>
              </div>
              <p className="text-xs font-bold text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
