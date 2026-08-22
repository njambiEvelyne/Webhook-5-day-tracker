/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { PivotAlertBanner } from './components/PivotAlertBanner';
import { SoloReconLab } from './components/SoloReconLab';
import { InventorySyncEngine } from './components/InventorySyncEngine';
import { ScopeDeltaAnalysis } from './components/ScopeDeltaAnalysis';
import { AdaptabilityIndex } from './components/AdaptabilityIndex';
import { TechStackAdvisorModal } from './components/TechStackAdvisorModal';
import { GradingRubricModal } from './components/GradingRubricModal';
import { SprintDay } from './types';

export default function App() {
  const [currentDay, setCurrentDay] = useState<SprintDay>(4); // Default to Day 4 Pivot for immediate rich experience
  const [activeTab, setActiveTab] = useState<'inventory' | 'recon' | 'delta' | 'adaptability'>('inventory');
  const [showRubricModal, setShowRubricModal] = useState(false);
  const [showTechStackModal, setShowTechStackModal] = useState(false);

  const handleSelectDay = (day: SprintDay) => {
    setCurrentDay(day);
    if (day <= 2) {
      setActiveTab('recon');
    } else if (day === 3) {
      setActiveTab('inventory');
    } else if (day === 4) {
      setActiveTab('inventory');
    } else if (day === 5) {
      setActiveTab('delta');
    }
  };

  const handleAdvanceToPivot = () => {
    setCurrentDay(4);
    setActiveTab('inventory');
  };

  const handleAdvanceToRefactor = () => {
    setCurrentDay(5);
    setActiveTab('delta');
  };

  const handleResetSimulation = () => {
    setCurrentDay(1);
    setActiveTab('recon');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Header & Day Progression */}
      <Header
        currentDay={currentDay}
        onSelectDay={handleSelectDay}
        onOpenRubric={() => setShowRubricModal(true)}
        onOpenTechStack={() => setShowTechStackModal(true)}
        onResetSimulation={handleResetSimulation}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Dynamic Mid-Sprint Pivot Banner */}
      <PivotAlertBanner
        currentDay={currentDay}
        onAdvanceToPivot={handleAdvanceToPivot}
        onAdvanceToRefactor={handleAdvanceToRefactor}
      />

      {/* Main Simulation View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'inventory' && (
          <InventorySyncEngine
            currentDay={currentDay}
            onAdvanceToPivot={handleAdvanceToPivot}
          />
        )}

        {activeTab === 'recon' && <SoloReconLab />}

        {activeTab === 'delta' && <ScopeDeltaAnalysis />}

        {activeTab === 'adaptability' && <AdaptabilityIndex />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">The Meridian Pivot</span>
            <span>•</span>
            <span>Power Learn Project Industry Working Simulation</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Assignment 1 (Solo Recon)</span>
            <span>Assignment 2 (Live Sync & Scope Delta)</span>
            <span>Assignment 3 (Adaptability Index)</span>
          </div>
        </div>
      </footer>

      {/* Tech Stack Advisor Modal */}
      <TechStackAdvisorModal
        isOpen={showTechStackModal}
        onClose={() => setShowTechStackModal(false)}
      />

      {/* Grading Rubrics & Rules Modal */}
      <GradingRubricModal
        isOpen={showRubricModal}
        onClose={() => setShowRubricModal(false)}
      />
    </div>
  );
}
