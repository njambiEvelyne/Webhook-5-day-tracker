import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Package,
  Activity,
  ArrowRight,
  Server,
  Database,
  Radio,
  FileCode2,
  Lock
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { INITIAL_INVENTORY } from '../data/simulationPresets';
import { InventoryItem, WebhookEventLog, PollingLog, SprintDay } from '../types';

interface InventorySyncEngineProps {
  currentDay: SprintDay;
  onAdvanceToPivot?: () => void;
}

export const InventorySyncEngine: React.FC<InventorySyncEngineProps> = ({
  currentDay,
  onAdvanceToPivot,
}) => {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [activeSyncMode, setActiveSyncMode] = useState<'polling' | 'webhook'>(
    currentDay >= 4 ? 'webhook' : 'polling'
  );

  // Customer Support Query state
  const [selectedSku, setSelectedSku] = useState<string>(INITIAL_INVENTORY[1].sku);
  const [searchQuery, setSearchQuery] = useState('');
  const [queryCount, setQueryCount] = useState(28);
  const [cacheHitRate, setCacheHitRate] = useState(99.4);

  // Polling logs
  const [pollingLogs, setPollingLogs] = useState<PollingLog[]>([
    {
      id: 'poll-1',
      timestamp: '11:40:00 AM',
      status: '200_OK',
      itemsFetched: 6,
      durationMs: 420,
      stalenessLagSec: 295,
      apiCostUnits: 6,
    },
    {
      id: 'poll-2',
      timestamp: '11:45:00 AM',
      status: '304_NOT_MODIFIED',
      itemsFetched: 0,
      durationMs: 180,
      stalenessLagSec: 280,
      apiCostUnits: 2,
    },
  ]);

  // Webhook event logs
  const [webhookLogs, setWebhookLogs] = useState<WebhookEventLog[]>([
    {
      id: 'wh-1',
      timestamp: '11:46:12 AM',
      eventType: 'stock.updated',
      sku: 'NSR-BOOT-441',
      previousStock: 30,
      newStock: 24,
      signature: 'v1=e7a89fbc01284a778c1b5592',
      verified: true,
      deliveryLatencyMs: 38,
      processingStatus: 'success',
    },
    {
      id: 'wh-2',
      timestamp: '11:47:05 AM',
      eventType: 'stock.updated',
      sku: 'NSR-AUDIO-802',
      previousStock: 18,
      newStock: 3,
      signature: 'v1=4b998cd112aa3e70ff8812c4',
      verified: true,
      deliveryLatencyMs: 44,
      processingStatus: 'success',
    },
  ]);

  // Telemetry chart data for staleness comparison
  const [telemetryData, setTelemetryData] = useState([
    { time: '11:30', pollingStalenessSec: 180, webhookLatencyMs: 35 },
    { time: '11:35', pollingStalenessSec: 270, webhookLatencyMs: 42 },
    { time: '11:40', pollingStalenessSec: 298, webhookLatencyMs: 38 },
    { time: '11:45', pollingStalenessSec: 210, webhookLatencyMs: 45 },
    { time: '11:50', pollingStalenessSec: 295, webhookLatencyMs: 39 },
  ]);

  // Keep mode in sync if sprint changes
  useEffect(() => {
    if (currentDay >= 4) {
      setActiveSyncMode('webhook');
    } else {
      setActiveSyncMode('polling');
    }
  }, [currentDay]);

  const activeItem = items.find((i) => i.sku === selectedSku) || items[0];

  // Action: Trigger Warehouse Stock Change
  const triggerWarehouseStockChange = (sku: string, delta: number) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const targetItem = items.find((i) => i.sku === sku);
    if (!targetItem) return;

    const newWarehouseStock = Math.max(0, targetItem.warehouseStock + delta);
    const oldWarehouseStock = targetItem.warehouseStock;

    if (activeSyncMode === 'webhook') {
      // Instant Push: Cache updates synchronously with HMAC verification
      const newWebhookLog: WebhookEventLog = {
        id: `wh-${Date.now()}`,
        timestamp: now,
        eventType: delta < 0 ? 'stock.updated' : 'stock.replenished',
        sku,
        previousStock: targetItem.cachedStock,
        newStock: newWarehouseStock,
        signature: `v1=${Math.random().toString(16).substring(2, 26)}`,
        verified: true,
        deliveryLatencyMs: Math.floor(Math.random() * 25 + 28),
        processingStatus: 'success',
      };

      setWebhookLogs([newWebhookLog, ...webhookLogs]);
      setItems(
        items.map((item) =>
          item.sku === sku
            ? {
                ...item,
                warehouseStock: newWarehouseStock,
                cachedStock: newWarehouseStock,
                lastWarehouseUpdate: 'Just now (Push Event)',
                lastCacheSync: 'Just now (<40ms)',
                isStale: false,
              }
            : item
        )
      );

      // Add telemetry data point
      setTelemetryData((prev) => [
        ...prev.slice(1),
        {
          time: now.substring(0, 5),
          pollingStalenessSec: 0,
          webhookLatencyMs: newWebhookLog.deliveryLatencyMs,
        },
      ]);
    } else {
      // Polling Mode: Warehouse changes, but Cache remains STALE until poll occurs!
      setItems(
        items.map((item) =>
          item.sku === sku
            ? {
                ...item,
                warehouseStock: newWarehouseStock,
                lastWarehouseUpdate: 'Just now (Warehouse change)',
                isStale: item.cachedStock !== newWarehouseStock,
              }
            : item
        )
      );
    }
  };

  // Action: Trigger Polling Cycle manually
  const triggerManualPollingCycle = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const duration = Math.floor(Math.random() * 150 + 250);

    const newPollLog: PollingLog = {
      id: `poll-${Date.now()}`,
      timestamp: now,
      status: '200_OK',
      itemsFetched: items.length,
      durationMs: duration,
      stalenessLagSec: 299,
      apiCostUnits: items.length,
    };

    setPollingLogs([newPollLog, ...pollingLogs]);

    // Update all caches to match warehouse
    setItems(
      items.map((item) => ({
        ...item,
        cachedStock: item.warehouseStock,
        lastCacheSync: 'Just now (Polling Batch)',
        isStale: false,
      }))
    );
  };

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Overview & Architecture Mode Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Assignment 2 System Core
              </span>
              <h2 className="text-base font-bold text-slate-100">
                Northstar Retail Co. Live Inventory Synchronization Service
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl">
              Powers customer support agent answers ("is this in stock?"). Demonstrates the architectural transition from legacy <strong>5-minute periodic polling</strong> (Day 3) to <strong>real-time webhook push with HMAC authentication</strong> (Days 4–5).
            </p>
          </div>

          {/* Sync Engine Selector */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveSyncMode('polling')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSyncMode === 'polling'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Day 3: 5-Min Polling</span>
              {currentDay >= 4 && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-rose-950 text-rose-300 font-mono">
                  DEPRECATED
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSyncMode('webhook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSyncMode === 'webhook'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Days 4–5: Webhook Push (HMAC)</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono">
                ACTIVE
              </span>
            </button>
          </div>
        </div>

        {/* Live Architecture Flow Visualizer Card */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Server className="w-4 h-4 text-rose-400" />
              Live Ingress Pipeline: {activeSyncMode === 'polling' ? 'Legacy Poller Architecture' : 'Event-Driven Webhook Push Architecture'}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              activeSyncMode === 'polling' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {activeSyncMode === 'polling' ? 'Staleness Window: 0–300s' : 'Zero-Staleness: <45ms delivery'}
            </span>
          </div>

          {activeSyncMode === 'polling' ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-slate-300 font-mono text-[11px] bg-slate-900/80 p-3 rounded-lg border border-amber-500/20">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                <span>Northstar Warehouse</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="px-2 py-1 bg-amber-950/60 rounded border border-amber-500/30 text-amber-300 text-center">
                <span className="block font-bold">Cron Polling Worker (300s)</span>
                <span className="text-[9px] opacity-80">Hits GET /warehouse/inventory/all</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-center">
                <span className="block font-bold">Stock Cache Store</span>
                <span className="text-[9px] text-amber-400">Can be up to 4m59s Stale!</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-center">
                <span className="block font-bold">Support "Is In Stock?" Query</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-slate-300 font-mono text-[11px] bg-slate-900/80 p-3 rounded-lg border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                <span>Warehouse Shelf Event</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="px-2 py-1 bg-emerald-950/60 rounded border border-emerald-500/30 text-emerald-300 text-center">
                <span className="block font-bold">Instant Push Hook</span>
                <span className="text-[9px] opacity-80">HMAC-SHA256 Signature Header</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="px-2 py-1 bg-emerald-950/60 rounded border border-emerald-500/30 text-emerald-300 text-center">
                <span className="block font-bold">Ingress Verification</span>
                <span className="text-[9px] opacity-80">Timing-Safe + Anti-Replay</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-center">
                <span className="block font-bold">Atomic Cache Write</span>
                <span className="text-[9px] text-emerald-400">0ms Staleness Sync</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Split: Left (Support Query Tool & Live Warehouse Catalog) - Right (Telemetry & Event Logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer Support Tool & Catalog (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Support Query Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Customer Support Inquiry Portal: "Is This In Stock?"
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                API Endpoint: GET /api/support/stock/:sku
              </span>
            </div>

            {/* Active Selected Item Query Result Banner */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-rose-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {activeItem.sku}
                  </span>
                  <h4 className="font-bold text-sm text-slate-100 mt-1">
                    {activeItem.name}
                  </h4>
                  <span className="text-xs text-slate-400">
                    Category: {activeItem.category} • ${activeItem.unitPrice.toFixed(2)}
                  </span>
                </div>

                <div className="text-right sm:text-right">
                  <span className="text-[11px] text-slate-400 block">
                    Support Rep View (Cached):
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {activeItem.cachedStock > 5 ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        IN STOCK ({activeItem.cachedStock} units)
                      </span>
                    ) : activeItem.cachedStock > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        LOW STOCK ({activeItem.cachedStock} left)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        OUT OF STOCK (0 units)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* STALENESS INTEGRITY CHECK */}
              {activeItem.isStale && activeSyncMode === 'polling' ? (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5 animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">
                      CRITICAL DATA STALENESS DANGER!
                    </span>
                    <p className="text-[11px] leading-relaxed">
                      Physical warehouse count is <strong>{activeItem.warehouseStock}</strong>, but customer support is telling callers <strong>{activeItem.cachedStock}</strong> units are available! Polling delay causes orders for sold-out inventory.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Physical Truth: {activeItem.warehouseStock} units • Cached: {activeItem.cachedStock} units
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    Synced: {activeItem.lastCacheSync}
                  </span>
                </div>
              )}

              {/* Simulation Action Triggers */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-400 font-medium text-[11px]">
                  Simulate Warehouse Physical Event:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerWarehouseStockChange(activeItem.sku, -5)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 font-medium transition cursor-pointer"
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Purchase / Drop 5 Units</span>
                  </button>
                  <button
                    onClick={() => triggerWarehouseStockChange(activeItem.sku, 15)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-medium transition cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Warehouse Restock +15</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Warehouse Catalog Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Northstar Warehouse Inventory Catalog
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search SKU or Name..."
                    className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-rose-500 w-44"
                  />
                </div>

                {activeSyncMode === 'polling' && (
                  <button
                    onClick={triggerManualPollingCycle}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition cursor-pointer"
                    title="Simulate 5-minute interval poll cycle"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Trigger 5m Poll</span>
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                    <th className="py-2.5 px-3">Item / SKU</th>
                    <th className="py-2.5 px-2 text-center">Warehouse Real Stock</th>
                    <th className="py-2.5 px-2 text-center">Cached Support Stock</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredItems.map((item) => {
                    const isSelected = item.sku === selectedSku;
                    return (
                      <tr
                        key={item.sku}
                        onClick={() => setSelectedSku(item.sku)}
                        className={`cursor-pointer transition ${
                          isSelected
                            ? 'bg-slate-800/80 text-slate-100'
                            : 'hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-100">{item.name}</div>
                          <span className="font-mono text-[10px] text-slate-400">
                            {item.sku}
                          </span>
                        </td>

                        <td className="py-2.5 px-2 text-center font-mono font-bold">
                          <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-100 border border-slate-800">
                            {item.warehouseStock}
                          </span>
                        </td>

                        <td className="py-2.5 px-2 text-center font-mono font-bold">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              item.isStale
                                ? 'bg-rose-950 text-rose-300 border border-rose-500/40 font-black'
                                : 'bg-slate-950 text-slate-200 border border-slate-800'
                            }`}
                          >
                            {item.cachedStock}
                          </span>
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          {item.isStale ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                              STALE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                              SYNCED
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerWarehouseStockChange(item.sku, -1);
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium"
                              title="Decrease 1 unit"
                            >
                              -1
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerWarehouseStockChange(item.sku, 5);
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium"
                              title="Restock 5 units"
                            >
                              +5
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & Ingress Event Logs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Latency & Staleness Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Sync Telemetry: Staleness vs. Push Latency
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Real-Time
              </span>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="pollingStalenessSec"
                    name="Polling Lag (sec)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="webhookLatencyMs"
                    name="Webhook Latency (ms)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[11px] text-slate-400">
              {activeSyncMode === 'polling'
                ? '⚠️ Polling introduces up to 300s staleness between warehouse shelf changes and cache refreshes.'
                : '⚡ Webhook push reduces stock sync propagation to under 45 milliseconds.'}
            </p>
          </div>

          {/* Ingress Event Log Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  {activeSyncMode === 'webhook' ? 'Verified Push Webhooks' : 'Warehouse Polling Executions'}
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {activeSyncMode === 'webhook' ? `${webhookLogs.length} events` : `${pollingLogs.length} polls`}
              </span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {activeSyncMode === 'webhook' ? (
                webhookLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 flex items-center gap-1 font-mono text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        {log.eventType} [{log.sku}]
                      </span>
                      <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    </div>

                    <div className="text-[11px] text-slate-300 flex items-center justify-between">
                      <span>Stock: {log.previousStock} → <strong className="text-emerald-400">{log.newStock}</strong></span>
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        {log.deliveryLatencyMs}ms delivery
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 truncate pt-1 border-t border-slate-900">
                      Sig: {log.signature} (HMAC Verified)
                    </div>
                  </div>
                ))
              ) : (
                pollingLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400 font-mono text-[11px]">
                        GET /warehouse/inventory/all
                      </span>
                      <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    </div>

                    <div className="text-[11px] text-slate-300 flex items-center justify-between">
                      <span>Status: <strong className="text-slate-100">{log.status}</strong></span>
                      <span className="font-mono text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">
                        {log.durationMs}ms network lag
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
                      <span>Items Synced: {log.itemsFetched}</span>
                      <span>Staleness: ~{log.stalenessLagSec}s</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
