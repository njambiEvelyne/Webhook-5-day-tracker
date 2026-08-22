import React from 'react';
import {
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  Cpu,
  AlertTriangle
} from 'lucide-react';
import { SprintDay } from '../types';

interface HeaderProps {
  currentDay: SprintDay;
  onSelectDay: (day: SprintDay) => void;
  onOpenRubric: () => void;
  onOpenTechStack: () => void;
  onResetSimulation: () => void;
  activeTab: 'inventory' | 'recon' | 'delta' | 'adaptability';
  setActiveTab: (tab: 'inventory' | 'recon' | 'delta' | 'adaptability') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDay,
  onSelectDay,
  onOpenRubric,
  onOpenTechStack,
  onResetSimulation,
  activeTab,
  setActiveTab,
}) => {
  const getPhaseName = (day: SprintDay) => {
    switch (day) {
      case 1:
      case 2:
        return 'Days 1-2: Solo Recon (Unfamiliar Tool Mini-Prototype)';
      case 3:
        return 'Day 3: Original Build (5-Min Warehouse Polling Spec)';
      case 4:
        return 'Day 4: The Meridian Pivot (Switch to Webhook Push)';
      case 5:
        return 'Day 5: Refactor, Scope Delta & Peer Adaptability Index';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold shadow-inner">
            <span className="text-xl font-black tracking-tight">PLP</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight">
                The Meridian Pivot
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Simulation Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Power Learn Project • 1-Week Industry Working Simulation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onOpenTechStack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Configure Stack & Technology Recommendations"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tech Stack Advisor</span>
          </button>

          <button
            onClick={onOpenRubric}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="View Grading Rubrics and 5 Non-Negotiable Rules"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Rubrics & Rules</span>
          </button>

          <button
            onClick={onResetSimulation}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition"
            title="Reset simulation data to Day 1 initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Sprint Day Progression Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
              Sprint Timeline:
            </span>
            <div className="flex items-center gap-1.5">
              {([1, 2, 3, 4, 5] as SprintDay[]).map((day) => {
                const isActive = currentDay === day;
                const isPast = currentDay > day;
                return (
                  <button
                    key={day}
                    onClick={() => onSelectDay(day)}
                    className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400 font-bold'
                        : isPast
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-900/60 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <span>Day {day}</span>
                    {day === 4 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-medium text-slate-200">{getPhaseName(currentDay)}</span>
            {currentDay >= 4 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PIVOT ACTIVE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-slate-900 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-slate-800 text-rose-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Northstar Inventory Sync (Assignment 2)</span>
          </button>

          <button
            onClick={() => setActiveTab('recon')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'recon'
                ? 'bg-slate-800 text-rose-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Solo Recon & Blocker Journal (Assignment 1)</span>
          </button>

          <button
            onClick={() => setActiveTab('delta')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'delta'
                ? 'bg-slate-800 text-rose-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Scope Delta & Deprecation Diff (Day 5)</span>
          </button>

          <button
            onClick={() => setActiveTab('adaptability')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'adaptability'
                ? 'bg-slate-800 text-rose-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Peer Adaptability Index (Assignment 3)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
