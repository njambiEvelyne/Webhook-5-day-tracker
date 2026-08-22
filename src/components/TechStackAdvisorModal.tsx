import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Zap,
  Server,
  Database,
  Lock,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { TechStackConfig } from '../types';
import { DEFAULT_TECH_STACK_CONFIG } from '../data/simulationPresets';

interface TechStackAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechStackAdvisorModal: React.FC<TechStackAdvisorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<TechStackConfig>(DEFAULT_TECH_STACK_CONFIG);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30">
                <Cpu className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-100">
                Technology Stack Architecture & Feature Blueprint
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Tailored technology recommendations and core feature specifications for "The Meridian Pivot" 5-day simulation.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Core Feature Outlines by Assignment */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Core Feature Outline (Sprint Scope)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Assignment 1 (Days 1–2)
              </span>
              <h4 className="font-bold text-sm text-slate-100">Solo Recon & Prototype</h4>
              <ul className="text-slate-300 space-y-1 text-[11px] list-disc list-inside">
                <li>Assign one unfamiliar tool (HMAC, BullMQ, Circuit Breaker).</li>
                <li>Build solo working mini-prototype (zero peer/mentor help).</li>
                <li>Maintain timestamped Blocker Journal (error, dead-end, fix).</li>
                <li>Track time-box vs actual resolution duration.</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Assignment 2 (Days 3–5)
              </span>
              <h4 className="font-bold text-sm text-slate-100">Northstar Inventory Sync</h4>
              <ul className="text-slate-300 space-y-1 text-[11px] list-disc list-inside">
                <li>Day 3: Build 5-minute warehouse polling + stock cache.</li>
                <li>Day 4 Pivot: Decommission polling; pivot to Webhook Push.</li>
                <li>HMAC-SHA256 signature verification + anti-replay filter.</li>
                <li>Produce Scope Delta Analysis & remove deprecated code.</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Assignment 3 (Day 5)
              </span>
              <h4 className="font-bold text-sm text-slate-100">Adaptability Index</h4>
              <ul className="text-slate-300 space-y-1 text-[11px] list-disc list-inside">
                <li>Peer evaluation on 5 dimensions (composure, clarity, etc.).</li>
                <li>Evaluate flexibility to scrap obsolete polling code.</li>
                <li>Confidential submissions with anonymized radar telemetry.</li>
                <li>Rehire recommendation index calculation.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Interactive Stack Questionnaire & Selector */}
        <div className="space-y-4 pt-2 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" />
            Recommended Production Stack Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Backend Runtime */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="font-bold text-slate-200 block">
                Backend Language & Runtime:
              </label>
              <select
                value={config.backendLanguage}
                onChange={(e) => setConfig({ ...config, backendLanguage: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="TypeScript / Node.js">TypeScript / Node.js (Recommended for Webhooks & Fast Prototyping)</option>
                <option value="Go (Golang)">Go / Golang (Optimal for raw concurrency & sub-millisecond crypto)</option>
                <option value="Python / FastAPI">Python / FastAPI (Asynchronous, strong typing)</option>
                <option value="Java / Spring Boot">Java / Spring Boot (Enterprise grade)</option>
              </select>
              <span className="text-[10px] text-slate-400 block">
                Native raw buffer body parsing is crucial for HMAC byte-exact signatures.
              </span>
            </div>

            {/* Ingress Framework */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="font-bold text-slate-200 block">
                Ingress Web Framework:
              </label>
              <select
                value={config.webFramework}
                onChange={(e) => setConfig({ ...config, webFramework: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="Express / Fastify">Express.js / Fastify (Native express.raw support)</option>
                <option value="Fiber / Gin">Fiber / Gin (High throughput HTTP router)</option>
                <option value="FastAPI / AsyncIO">FastAPI / Uvicorn (Async event loop)</option>
                <option value="Spring WebFlux">Spring WebFlux (Reactive Netty server)</option>
              </select>
              <span className="text-[10px] text-slate-400 block">
                Must capture untouched raw request bodies for signature hashing.
              </span>
            </div>

            {/* Queue Buffer */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="font-bold text-slate-200 block">
                Asynchronous Event Queue Buffer:
              </label>
              <select
                value={config.queueSystem}
                onChange={(e) => setConfig({ ...config, queueSystem: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="BullMQ / Redis">BullMQ / Redis Streams (Lightweight, retries & dead-letter)</option>
                <option value="RabbitMQ / AMQP">RabbitMQ (AMQP message broker with acknowledgment)</option>
                <option value="Apache Kafka">Apache Kafka (High-volume event log)</option>
                <option value="AWS SQS / GCP PubSub">AWS SQS / GCP Pub/Sub (Managed cloud queue)</option>
              </select>
              <span className="text-[10px] text-slate-400 block">
                Prevents warehouse webhook bursts from overwhelming support cache writes.
              </span>
            </div>

            {/* In-Memory Cache */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="font-bold text-slate-200 block">
                Low-Latency Stock Cache:
              </label>
              <select
                value={config.cacheStore}
                onChange={(e) => setConfig({ ...config, cacheStore: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="Redis In-Memory">Redis (Key-Value & Hashes with sub-millisecond GETs)</option>
                <option value="KeyDB">KeyDB (Multithreaded Redis drop-in)</option>
                <option value="Memcached">Memcached (High concurrency cache)</option>
                <option value="Local LRU / Cache-Manager">Local LRU in-memory buffer</option>
              </select>
              <span className="text-[10px] text-slate-400 block">
                Guarantees customer support queries "is this in stock?" respond in &lt;10ms.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <span className="text-slate-400 text-[11px]">
            Selected: <strong className="text-rose-400">{config.backendLanguage}</strong> + <strong className="text-slate-200">{config.queueSystem}</strong> + <strong className="text-slate-200">{config.cacheStore}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Config!' : 'Copy Config (JSON)'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition cursor-pointer"
            >
              Done / Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
