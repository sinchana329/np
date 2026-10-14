/**
 * @file UnifiedDashboardPage.tsx
 * @brief Unified Network Monitoring Dashboard & Alert Aggregator
 * @project NetScope Platform - CSE Network Programming AAT Final-Year Project
 */

import React from 'react';
import { MonitorCheck, ShieldAlert, Activity, Network, FileSearch, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

export const UnifiedDashboardPage: React.FC = () => {
  const alerts = [
    { id: 'a1', time: '03:04:12', module: 'LowGuard', level: 'HIGH', message: 'Connection rate burst detected from IP 192.168.1.105 (80 RPS > 50 RPS threshold)' },
    { id: 'a2', time: '03:02:45', module: 'Topology', level: 'WARN', message: 'Link L1_2 set to FAILED status. Dijkstra rerouted path via R2.' },
    { id: 'a3', time: '03:01:10', module: 'TCP Sim', level: 'INFO', message: 'TCP Reno Fast Retransmit triggered on 3 DupACKs at RTT #14.' },
    { id: 'a4', time: '02:58:30', module: 'PCAP Inspector', level: 'INFO', message: 'TCP 3-Way Handshake successfully validated in capture stream.' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MonitorCheck className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Unified Network Monitoring Dashboard & Telemetry Aggregator
            </h2>
            <p className="text-xs text-slate-400">
              Consolidated real-time feed summarizing transport layer congestion, topology routing, ARQ protocols, and LowGuard security alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-bold">System Status: NOMINAL</span>
        </div>
      </div>

      {/* Module Quick Health Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">TCP Simulator Status</div>
          <div className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Active (8.92 Mbps)</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">Routing Topology</div>
          <div className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-1.5">
            <Network className="w-4 h-4 text-cyan-400" />
            <span>Reachable (4 Nodes)</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">LowGuard Security</div>
          <div className="text-sm font-bold font-mono text-rose-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>1 Burst Blocked</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">PCAP Inspector</div>
          <div className="text-sm font-bold font-mono text-purple-400 flex items-center gap-1.5">
            <FileSearch className="w-4 h-4 text-purple-400" />
            <span>200 Packets Analyzed</span>
          </div>
        </div>
      </div>

      {/* Cross-Module Security & Telemetry Alert Feed */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
          Cross-Module Security & Network Event Feed
        </h3>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Origin Module</th>
                <th className="py-2.5 px-3">Alert Severity</th>
                <th className="py-2.5 px-3">Telemetry Log Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 bg-slate-950/40">
              {alerts.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400">{a.time}</td>
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{a.module}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.level === 'HIGH'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : a.level === 'WARN'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {a.level}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{a.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
