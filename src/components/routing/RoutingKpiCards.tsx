/**
 * @file RoutingKpiCards.tsx
 * @brief Performance Summary Cards for Routing & Packet Metrics
 * @project CSE Network Programming AAT Final-Year Project Expansion
 */

import React from 'react';
import { PathResult, RoutingMetrics } from '../../engine/routingTypes';
import { Send, CheckCircle2, Clock, Gauge, Award, ShieldAlert } from 'lucide-react';

interface RoutingKpiCardsProps {
  metrics: RoutingMetrics | null;
  activePath?: PathResult;
}

export const RoutingKpiCards: React.FC<RoutingKpiCardsProps> = ({
  metrics,
  activePath,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Active Path Reachability */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1 hover:border-cyan-500/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono">Route Reachable</span>
          <Award className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className={`text-base font-bold font-mono ${activePath?.reachable ? 'text-emerald-400' : 'text-rose-400'}`}>
          {activePath?.reachable ? 'YES (Active)' : 'NO (Unreachable)'}
        </div>
        <p className="text-[10px] text-slate-400 truncate">
          Path Cost: {activePath?.reachable ? activePath.totalWeight : 'N/A'}
        </p>
      </div>

      {/* Path Delay */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1 hover:border-emerald-500/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono">Prop Delay</span>
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-bold font-mono text-emerald-400">
          {activePath?.reachable ? `${activePath.totalDelayMs} ms` : '0 ms'}
        </div>
        <p className="text-[10px] text-slate-400 font-mono">
          {activePath?.nodePath.length ? `${activePath.nodePath.length - 1} hops` : '0 hops'}
        </p>
      </div>

      {/* Bottleneck Bandwidth */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1 hover:border-amber-500/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono">Bottleneck BW</span>
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-base font-bold font-mono text-amber-400">
          {activePath?.reachable ? `${activePath.minBandwidthMbps} Mbps` : '0 Mbps'}
        </div>
        <p className="text-[10px] text-slate-400">Min link bandwidth</p>
      </div>

      {/* Packets Generated */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1 hover:border-purple-500/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono">Packets Sent</span>
          <Send className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-bold font-mono text-purple-400">
          {metrics ? metrics.totalPacketsGenerated : 0} pkts
        </div>
        <p className="text-[10px] text-slate-400">Burst transmission</p>
      </div>

      {/* Delivery Ratio */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1 hover:border-cyan-500/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono">Delivery Ratio</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-bold font-mono text-cyan-400">
          {metrics ? `${metrics.deliveryRatioPercent}%` : '100%'}
        </div>
        <p className="text-[10px] text-slate-400">
          {metrics ? `${metrics.totalPacketsDelivered} delivered` : '0 delivered'}
        </p>
      </div>

      {/* Route Changes */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1 hover:border-rose-500/40 transition-colors">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono">Route Changes</span>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="text-base font-bold font-mono text-rose-400">
          {metrics ? metrics.totalRouteChanges : 0} failovers
        </div>
        <p className="text-[10px] text-slate-400">Failures / Toggles</p>
      </div>
    </div>
  );
};
