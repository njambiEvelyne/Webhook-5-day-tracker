import React from 'react';
import { BookOpen, CheckCircle2, ShieldAlert, Award, AlertCircle } from 'lucide-react';

interface GradingRubricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GradingRubricModal: React.FC<GradingRubricModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-100">
                Grading Rubrics & 5 Non-Negotiable Rules
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Official Power Learn Project evaluation criteria for "The Meridian Pivot" sprint.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Section 1: 5 Non-Negotiable Rules */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> 5 Non-Negotiable Rules
          </h3>

          <div className="space-y-2 text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-rose-600/20 text-rose-400 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                1
              </span>
              <p className="text-[11px] leading-relaxed">
                <strong>Genuinely Unfamiliar Tool:</strong> The unfamiliar tool must be genuinely new to the learner — no picking something they already half-know.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-rose-600/20 text-rose-400 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                2
              </span>
              <p className="text-[11px] leading-relaxed">
                <strong>Zero Technical How-To Help in Days 1–2:</strong> No teammate or instructor gives technical how-to help during Days 1–2 — that is what makes autonomy measurable.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-rose-600/20 text-rose-400 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                3
              </span>
              <p className="text-[11px] leading-relaxed">
                <strong>Non-Negotiable Day 4 Pivot:</strong> The Day 4 pivot is delivered as final: no deadline extension, no negotiating scope back to the original spec.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-rose-600/20 text-rose-400 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                4
              </span>
              <p className="text-[11px] leading-relaxed">
                <strong>Obsolete Code Removal:</strong> Obsolete code from before the pivot must be visibly removed or marked deprecated — not left running in parallel.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-rose-600/20 text-rose-400 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                5
              </span>
              <p className="text-[11px] leading-relaxed">
                <strong>Strict Confidentiality of Adaptability Index:</strong> The Adaptability Index is confidential and never shared verbatim between teammates; only aggregate patterns may be released.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Grading Rubric Weights */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Grading Map & Rubric Weights
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                  <th className="py-2.5 px-3">Assignment</th>
                  <th className="py-2.5 px-3">Criteria & Weights</th>
                  <th className="py-2.5 px-3">Evidenced By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
                <tr className="bg-slate-950/40">
                  <td className="py-3 px-3 font-bold text-rose-400">
                    Assignment 1
                    <span className="block text-[10px] text-slate-500 font-normal">Solo Recon</span>
                  </td>
                  <td className="py-3 px-3">
                    <div>• Functional correctness (40%)</div>
                    <div>• Troubleshooting autonomy & docs (40%)</div>
                    <div>• Time-to-completion (20%)</div>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    Day 1–2 mini-prototype working state • Real-time Blocker Journal entries (errors, dead ends, fixes) • Time-box vs. actual time.
                  </td>
                </tr>

                <tr className="bg-slate-950/40">
                  <td className="py-3 px-3 font-bold text-amber-400">
                    Assignment 2
                    <span className="block text-[10px] text-slate-500 font-normal">Inventory Sync & Scope Delta</span>
                  </td>
                  <td className="py-3 px-3">
                    <div>• Adaptation completeness (40%)</div>
                    <div>• Architectural integrity (30%)</div>
                    <div>• Trade-off documentation (30%)</div>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    Day 5 deliverable meets the NEW spec • Regression-check line in Scope Delta Analysis • Dropped / Modified / Added + reprioritized backlog.
                  </td>
                </tr>

                <tr className="bg-slate-950/40">
                  <td className="py-3 px-3 font-bold text-emerald-400">
                    Assignment 3
                    <span className="block text-[10px] text-slate-500 font-normal">Adaptability Index</span>
                  </td>
                  <td className="py-3 px-3">
                    <div>• Peer-rated adaptability during the pivot</div>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    Day 5 confidential Adaptability Index — composure, communication, flexibility, contribution, rehire.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
          >
            Close Rubric
          </button>
        </div>
      </div>
    </div>
  );
};
