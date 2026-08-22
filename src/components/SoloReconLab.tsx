import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Trash2,
  Terminal,
  Code2,
  Lock,
  Cpu,
  ArrowRight,
  Download,
  Flame,
  Check
} from 'lucide-react';
import { UNFAMILIAR_TRACKS, INITIAL_BLOCKERS } from '../data/simulationPresets';
import { UnfamiliarToolTrack, BlockerEntry } from '../types';

export const SoloReconLab: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<UnfamiliarToolTrack>(UNFAMILIAR_TRACKS[0]);
  const [blockers, setBlockers] = useState<BlockerEntry[]>(INITIAL_BLOCKERS);

  // HMAC Sandbox State
  const [hmacSecret, setHmacSecret] = useState('whsec_northstar_retail_production_99x8');
  const [hmacPayload, setHmacPayload] = useState('{\n  "event": "stock.updated",\n  "sku": "NSR-BOOT-441",\n  "warehouseStock": 14,\n  "timestamp": ' + Math.floor(Date.now() / 1000) + '\n}');
  const [tamperedPayload, setTamperedPayload] = useState(false);
  const [expiredTimestamp, setExpiredTimestamp] = useState(false);
  const [hmacResult, setHmacResult] = useState<{
    status: 'idle' | 'verified' | 'rejected';
    signature: string;
    computedHash: string;
    message: string;
    latencyMs: number;
  }>({
    status: 'idle',
    signature: '',
    computedHash: '',
    message: '',
    latencyMs: 0,
  });

  // New Blocker Entry Form Modal / State
  const [showAddBlocker, setShowAddBlocker] = useState(false);
  const [newBlocker, setNewBlocker] = useState<Partial<BlockerEntry>>({
    phase: 'Solo Recon',
    day: 1,
    errorOrObstacle: '',
    deadEndTried: '',
    rootCause: '',
    resolutionOrWorkaround: '',
    timeBoxAllocatedMin: 60,
    actualTimeSpentMin: 45,
    status: 'resolved',
  });

  // Simulated simple HMAC SHA256 calculation for sandbox
  const runHmacVerificationTest = () => {
    const startTime = performance.now();
    const timestamp = expiredTimestamp
      ? Math.floor(Date.now() / 1000) - 600 // 10 minutes ago
      : Math.floor(Date.now() / 1000);

    const basePayload = tamperedPayload
      ? hmacPayload + ' /* TAMPERED */'
      : hmacPayload;

    // Simulate cryptographic hash
    const inputStr = basePayload + hmacSecret + timestamp.toString();
    let hashVal = 0;
    for (let i = 0; i < inputStr.length; i++) {
      hashVal = (hashVal + inputStr.charCodeAt(i) * (i + 1) * 31) % 0xffffffff;
    }
    const pseudoHash = hashVal
      .toString(16)
      .padStart(64, 'a9b2c3d4e5f6');

    const calculatedSig = `v1=${pseudoHash.substring(0, 32)}`;
    const expectedSig = tamperedPayload
      ? `v1=${pseudoHash.substring(0, 30)}ff`
      : calculatedSig;

    const timeDiff = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
    const endTime = performance.now();
    const latency = Math.round(endTime - startTime + Math.random() * 4 + 2);

    if (timeDiff > 300) {
      setHmacResult({
        status: 'rejected',
        signature: `t=${timestamp},${expectedSig}`,
        computedHash: calculatedSig,
        message: `Anti-Replay Violation: Payload timestamp is ${timeDiff}s old (Max allowed tolerance: 300s). Rejected.`,
        latencyMs: latency,
      });
    } else if (tamperedPayload) {
      setHmacResult({
        status: 'rejected',
        signature: `t=${timestamp},${expectedSig}`,
        computedHash: calculatedSig,
        message: 'Signature Mismatch: Computed HMAC does not match request header. Payload was modified in transit!',
        latencyMs: latency,
      });
    } else {
      setHmacResult({
        status: 'verified',
        signature: `t=${timestamp},${calculatedSig}`,
        computedHash: calculatedSig,
        message: 'Cryptographic Signature Verified: Raw payload authentic and within 300s timestamp window.',
        latencyMs: latency,
      });
    }
  };

  const handleAddBlocker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlocker.errorOrObstacle || !newBlocker.resolutionOrWorkaround) return;

    const entry: BlockerEntry = {
      id: `blk-${Date.now()}`,
      timestamp: `Day ${newBlocker.day || 1} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      day: newBlocker.day || 1,
      phase: newBlocker.phase || 'Solo Recon',
      errorOrObstacle: newBlocker.errorOrObstacle || '',
      deadEndTried: newBlocker.deadEndTried || 'None recorded',
      rootCause: newBlocker.rootCause || 'Under investigation',
      resolutionOrWorkaround: newBlocker.resolutionOrWorkaround || '',
      timeBoxAllocatedMin: Number(newBlocker.timeBoxAllocatedMin) || 60,
      actualTimeSpentMin: Number(newBlocker.actualTimeSpentMin) || 60,
      status: (newBlocker.status as any) || 'resolved',
    };

    setBlockers([entry, ...blockers]);
    setShowAddBlocker(false);
    setNewBlocker({
      phase: 'Solo Recon',
      day: 1,
      errorOrObstacle: '',
      deadEndTried: '',
      rootCause: '',
      resolutionOrWorkaround: '',
      timeBoxAllocatedMin: 60,
      actualTimeSpentMin: 45,
      status: 'resolved',
    });
  };

  const handleDeleteBlocker = (id: string) => {
    setBlockers(blockers.filter((b) => b.id !== id));
  };

  const downloadJournalMarkdown = () => {
    const md = `# Assignment 1: Learning & Blocker Journal
**Sprint**: The Meridian Pivot (Power Learn Project)
**Learner Track**: ${selectedTrack.name}

## 1. Tool Reconnaissance Overview
- **Category**: ${selectedTrack.category}
- **Difficulty**: ${selectedTrack.difficulty}
- **Simulation Relevance**: ${selectedTrack.industryRelevance}
- **Pivot Contribution**: ${selectedTrack.pivotUsefulness}

## 2. Real-Time Blocker & Troubleshooting Log
${blockers
  .map(
    (b, i) => `### Entry #${i + 1} (${b.timestamp}) - [${b.status.toUpperCase()}]
- **Obstacle / Error**: ${b.errorOrObstacle}
- **Dead-End Attempted**: ${b.deadEndTried}
- **Identified Root Cause**: ${b.rootCause}
- **Working Resolution**: ${b.resolutionOrWorkaround}
- **Time Allocated**: ${b.timeBoxAllocatedMin} min | **Actual Time**: ${b.actualTimeSpentMin} min
`
  )
  .join('\n')}

---
*Generated by Meridian Pivot Simulation Engine*
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assignment-1-blocker-journal-${selectedTrack.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate journal metrics
  const totalAllocated = blockers.reduce((acc, b) => acc + b.timeBoxAllocatedMin, 0);
  const totalActual = blockers.reduce((acc, b) => acc + b.actualTimeSpentMin, 0);
  const resolvedCount = blockers.filter((b) => b.status === 'resolved').length;
  const resolutionRate = blockers.length > 0 ? Math.round((resolvedCount / blockers.length) * 100) : 100;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Goal Callout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Assignment 1 (Days 1–2)
              </span>
              <h2 className="text-base font-bold text-slate-100">
                Solo Recon: Independent Learning Under Pressure
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl">
              Each learner is assigned one unfamiliar tool. You build a solo mini-prototype alone with <strong>no teammate or instructor how-to help</strong>. Keep a real-time Blocker Journal of errors, dead ends, and fixes to evidence autonomy.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={downloadJournalMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Journal (.md)</span>
            </button>
            <button
              onClick={() => setShowAddBlocker(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log Blocker Entry</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Autonomy Evidence</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-4 h-4" /> 100% Solo (0 Asks)
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Blocker Resolution Rate</span>
            <span className="text-sm font-bold text-slate-100 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {resolutionRate}% Resolved
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Time-Box Variance</span>
            <span className="text-sm font-bold text-amber-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-4 h-4" /> {totalActual}m spent / {totalAllocated}m allocated
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Assigned Tool Track</span>
            <span className="text-sm font-bold text-rose-400 truncate block mt-0.5">
              {selectedTrack.badge}
            </span>
          </div>
        </div>
      </div>

      {/* Track Selection Bar */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Select Assigned Unfamiliar Tool Track
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {UNFAMILIAR_TRACKS.map((track) => {
            const isSelected = selectedTrack.id === track.id;
            return (
              <button
                key={track.id}
                onClick={() => setSelectedTrack(track)}
                className={`p-3 rounded-xl text-left border transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-rose-500 shadow-md ring-1 ring-rose-500/50'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950 text-rose-400 border border-slate-800">
                      {track.badge}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {track.difficulty}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-200 leading-tight">
                    {track.name}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                  {track.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Interactive Mini-Prototype Workbench + Live Code Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Interactive Sandbox (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Interactive Mini-Prototype: {selectedTrack.name}
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Solo Working State
              </span>
            </div>

            {/* Sandbox details */}
            <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800/80 text-xs space-y-3">
              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Secret Key / Verification Token (HMAC-SHA256):
                </label>
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={hmacSecret}
                    onChange={(e) => setHmacSecret(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Simulated Ingress Payload (Warehouse Push Event):
                </label>
                <textarea
                  rows={4}
                  value={hmacPayload}
                  onChange={(e) => setHmacPayload(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Stress & Edge Case Toggles */}
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs select-none">
                  <input
                    type="checkbox"
                    checked={tamperedPayload}
                    onChange={(e) => setTamperedPayload(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Simulate Payload Tampering (MITM Attack)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs select-none">
                  <input
                    type="checkbox"
                    checked={expiredTimestamp}
                    onChange={(e) => setExpiredTimestamp(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Simulate Expired Replay Attack (&gt;300s drift)</span>
                </label>
              </div>

              {/* Execution Trigger */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={runHmacVerificationTest}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Verification Pipeline</span>
                </button>

                {hmacResult.latencyMs > 0 && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Execution time: {hmacResult.latencyMs}ms
                  </span>
                )}
              </div>
            </div>

            {/* Verification Result Output */}
            {hmacResult.status !== 'idle' && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 font-mono transition ${
                  hmacResult.status === 'verified'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    {hmacResult.status === 'verified' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    {hmacResult.status === 'verified'
                      ? 'HTTP 200: Signature Authenticated'
                      : 'HTTP 401: Unauthorized Webhook Ingress'}
                  </span>
                  <span className="text-[11px] opacity-75">
                    {hmacResult.latencyMs}ms processing
                  </span>
                </div>
                <p className="font-sans text-xs opacity-90 leading-relaxed">
                  {hmacResult.message}
                </p>
                <div className="pt-1 border-t border-slate-800/80 text-[11px] space-y-0.5 text-slate-400">
                  <div>
                    <span className="text-slate-500">Header Sig:</span> {hmacResult.signature}
                  </div>
                  <div>
                    <span className="text-slate-500">Target Sig:</span> {hmacResult.computedHash}
                  </div>
                </div>
              </div>
            )}

            {/* Industry Context */}
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-slate-300 block">
                How this feeds the Day 4 Pivot:
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {selectedTrack.pivotUsefulness} This provides the building block so your team doesn't panic when the client switches from polling to webhooks.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Sample Solo Code Snippet & Reference (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-sm text-slate-100">
                    Solo Mini-Prototype Implementation
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  TypeScript
                </span>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[380px] leading-relaxed">
                  {selectedTrack.sampleCode}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-semibold text-slate-200 block">
                Solo Recon Rubric Target (Assignment 1):
              </span>
              <p className="text-[11px]">
                <strong>Functional Correctness (40%)</strong> •{' '}
                <strong>Troubleshooting Autonomy (40%)</strong> •{' '}
                <strong>Time-to-Completion (20%)</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Real-time Learning & Blocker Journal Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-base text-slate-100">
                Real-Time Learning & Blocker Journal
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Mandatory deliverable for Assignment 1. Records genuine obstacles, dead ends explored, root causes, and fixes.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
            {blockers.length} Documented Entries
          </span>
        </div>

        {/* Entries List */}
        <div className="space-y-3">
          {blockers.map((entry) => (
            <div
              key={entry.id}
              className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 text-xs space-y-3 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    {entry.timestamp}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {entry.phase}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                    Status: {entry.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Timebox: {entry.actualTimeSpentMin}m / {entry.timeBoxAllocatedMin}m</span>
                  </div>
                  <button
                    onClick={() => handleDeleteBlocker(entry.id)}
                    className="text-slate-500 hover:text-rose-400 transition"
                    title="Delete log entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Blocker 4-Factor Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> 1. Error / Obstacle
                  </span>
                  <p className="text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                    {entry.errorOrObstacle}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> 2. Dead-End Tried (What Failed)
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                    {entry.deadEndTried}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> 3. Identified Root Cause
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                    {entry.rootCause}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 4. Working Resolution & Fix
                  </span>
                  <p className="text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                    {entry.resolutionOrWorkaround}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Blocker Entry Modal */}
      {showAddBlocker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-400" />
                <span>Add Blocker Journal Entry</span>
              </h3>
              <button
                onClick={() => setShowAddBlocker(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBlocker} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Sprint Day:</label>
                  <select
                    value={newBlocker.day}
                    onChange={(e) => setNewBlocker({ ...newBlocker, day: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value={1}>Day 1 (Solo Recon)</option>
                    <option value={2}>Day 2 (Solo Recon)</option>
                    <option value={3}>Day 3 (Original Build)</option>
                    <option value={4}>Day 4 (The Pivot)</option>
                    <option value={5}>Day 5 (Refactor & Review)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Sprint Phase:</label>
                  <input
                    type="text"
                    value={newBlocker.phase}
                    onChange={(e) => setNewBlocker({ ...newBlocker, phase: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  1. Error Message / Obstacle Encountered:
                </label>
                <textarea
                  required
                  rows={2}
                  value={newBlocker.errorOrObstacle}
                  onChange={(e) => setNewBlocker({ ...newBlocker, errorOrObstacle: e.target.value })}
                  placeholder="e.g. crypto.timingSafeEqual throws buffer length mismatch exception"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  2. Dead-End Tried (What didn't work):
                </label>
                <input
                  type="text"
                  value={newBlocker.deadEndTried}
                  onChange={(e) => setNewBlocker({ ...newBlocker, deadEndTried: e.target.value })}
                  placeholder="e.g. Tried padding hex strings with zeros manually"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  3. Identified Root Cause:
                </label>
                <input
                  type="text"
                  value={newBlocker.rootCause}
                  onChange={(e) => setNewBlocker({ ...newBlocker, rootCause: e.target.value })}
                  placeholder="e.g. Hex string was converted to ascii buffer instead of Buffer.from(str, 'hex')"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  4. Working Resolution & Fix:
                </label>
                <textarea
                  required
                  rows={2}
                  value={newBlocker.resolutionOrWorkaround}
                  onChange={(e) => setNewBlocker({ ...newBlocker, resolutionOrWorkaround: e.target.value })}
                  placeholder="e.g. Passed 'hex' encoding explicitly to Buffer.from() before timingSafeEqual"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Time-Box Allocated (min):</label>
                  <input
                    type="number"
                    value={newBlocker.timeBoxAllocatedMin}
                    onChange={(e) => setNewBlocker({ ...newBlocker, timeBoxAllocatedMin: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Actual Time Spent (min):</label>
                  <input
                    type="number"
                    value={newBlocker.actualTimeSpentMin}
                    onChange={(e) => setNewBlocker({ ...newBlocker, actualTimeSpentMin: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddBlocker(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Save Journal Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
