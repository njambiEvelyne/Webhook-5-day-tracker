import React from 'react';
import { AlertCircle, ArrowRight, Clock, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SprintDay } from '../types';

interface PivotAlertBannerProps {
  currentDay: SprintDay;
  onAdvanceToPivot: () => void;
  onAdvanceToRefactor: () => void;
}

export const PivotAlertBanner: React.FC<PivotAlertBannerProps> = ({
  currentDay,
  onAdvanceToPivot,
  onAdvanceToRefactor,
}) => {
  if (currentDay < 4) {
    return (
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="font-semibold text-slate-200">Current Phase:</span>
            <span className="text-slate-400">
              {currentDay <= 2
                ? 'Solo Recon: Build solo mini-prototype with no instructor or peer help allowed.'
                : 'Day 3 Original Spec: Polling Warehouse API every 5 minutes, caching stock count.'}
            </span>
          </div>
          <button
            onClick={onAdvanceToPivot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Day 4 Client Pivot</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/90 via-red-950/80 to-slate-900 border-b border-amber-500/40 text-amber-100 px-4 py-3.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 animate-bounce" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white">
                CRITICAL CLIENT PIVOT • DAY 4
              </span>
              <span className="text-xs font-bold text-amber-300">
                Northstar Retail Co. Decommissioning Polling API in 48 Hours
              </span>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed max-w-3xl">
              <strong>Non-Negotiable Mandate:</strong> The 5-minute warehouse polling mechanism is cancelled immediately. All stock synchronization MUST switch to a verified <strong>Webhook Push model (HMAC-SHA256)</strong>. No deadline extension, no scope rollback.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-300">
              <Clock className="w-3.5 h-3.5" />
              <span>48h Sprint Clock</span>
            </div>
            <span className="text-[11px] text-slate-400">Strict Non-Negotiable</span>
          </div>

          {currentDay === 4 ? (
            <button
              onClick={onAdvanceToRefactor}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Advance to Day 5: Ship & Review</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Day 5 Refactoring Mode Active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
