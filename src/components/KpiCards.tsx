/**
 * @file KpiCards.tsx
 * @brief Performance Metrics Summary Cards
 * @project CSE Network Programming AAT Final-Year Project
 */

import React from 'react';
import { SimulationMetrics } from '../engine/types';
import { Zap, Gauge, AlertTriangle, RefreshCw, Clock, Award } from 'lucide-react';

interface KpiCardsProps {
  metrics: SimulationMetrics;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* KPI 1: Receiver Goodput */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1 hover:border-cyan-500/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono">Receiver Goodput</span>
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-lg font-bold font-mono text-cyan-400">
          {metrics.goodputMbps.toFixed(2)} <span className="text-xs font-normal text-slate-400">Mbps</span>
        </div>
        <p className="text-[10px] text-slate-400">Payload delivery rate</p>
      </div>

      {/* KPI 2: Offered Throughput */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono">Offered Load</span>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-lg font-bold font-mono text-slate-200">
          {metrics.offeredThroughputMbps.toFixed(2)} <span className="text-xs font-normal text-slate-400">Mbps</span>
        </div>
        <p className="text-[10px] text-slate-400">Includes retransmissions</p>
      </div>

      {/* KPI 3: Packet Loss Rate */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1 hover:border-rose-500/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono">Packet Loss</span>
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="text-lg font-bold font-mono text-rose-400">
          {metrics.lossRatePercent.toFixed(2)} <span className="text-xs font-normal text-slate-400">%</span>
        </div>
        <p className="text-[10px] text-slate-400">
          {metrics.totalQueueDrops + metrics.totalRandomDrops} drops ({metrics.totalQueueDrops} queue)
        </p>
      </div>

      {/* KPI 4: Retransmission Count */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1 hover:border-amber-500/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono">Retransmissions</span>
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-lg font-bold font-mono text-amber-400">
          {metrics.totalRetransmissions} <span className="text-xs font-normal text-slate-400">pkts</span>
        </div>
        <p className="text-[10px] text-slate-400">
          {metrics.totalFastRetransmits} Fast / {metrics.totalTimeouts} RTO
        </p>
      </div>

      {/* KPI 5: Avg RTT & Queue Delay */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1 hover:border-emerald-500/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono">Avg RTT Latency</span>
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-lg font-bold font-mono text-emerald-400">
          {metrics.avgRttMs.toFixed(0)} <span className="text-xs font-normal text-slate-400">ms</span>
        </div>
        <p className="text-[10px] text-slate-400">+{metrics.avgQueueingDelayMs.toFixed(1)} ms queue</p>
      </div>

      {/* KPI 6: Link Efficiency Rating */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1 hover:border-purple-500/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono">Goodput Efficiency</span>
          <Award className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-lg font-bold font-mono text-purple-400">
          {(metrics.efficiencyRatio * 100).toFixed(1)} <span className="text-xs font-normal text-slate-400">%</span>
        </div>
        <p className="text-[10px] text-slate-400">Goodput / Offered</p>
      </div>
    </div>
  );
};
