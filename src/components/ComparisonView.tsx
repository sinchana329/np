/**
 * @file ComparisonView.tsx
 * @brief Side-by-Side Multi-Algorithm Benchmark Comparison Tool
 * @project CSE Network Programming AAT Final-Year Project
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { NetworkConfig, SimulationResult } from '../engine/types';
import { TcpEngineBridge, PRESET_SCENARIOS } from '../engine/TcpEngineBridge';
import { Cpu, Play, Award, CheckCircle, BarChart3 } from 'lucide-react';

interface ComparisonViewProps {
  initialConfig: NetworkConfig;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ initialConfig }) => {
  const [cfg, setCfg] = useState<Omit<NetworkConfig, 'variant'>>({
    linkCapacityMbps: initialConfig.linkCapacityMbps,
    propDelayMs: initialConfig.propDelayMs,
    mssBytes: initialConfig.mssBytes,
    initialCwndPackets: initialConfig.initialCwndPackets,
    initialSsthreshPackets: initialConfig.initialSsthreshPackets,
    queueCapacityPackets: initialConfig.queueCapacityPackets,
    randomLossProbability: initialConfig.randomLossProbability,
    totalRttsToSimulate: initialConfig.totalRttsToSimulate,
    randomSeed: initialConfig.randomSeed,
  });

  // Run comparative simulation for Tahoe, Reno, and NewReno
  const results = useMemo(() => {
    return TcpEngineBridge.runComparison(cfg);
  }, [cfg]);

  // Combine snapshot data for overlay Recharts plot
  const chartData = useMemo(() => {
    const tahoeSnaps = results.TAHOE.snapshots;
    const renoSnaps = results.RENO.snapshots;
    const newRenoSnaps = results.NEW_RENO.snapshots;

    const maxLen = Math.max(tahoeSnaps.length, renoSnaps.length, newRenoSnaps.length);
    const combined = [];

    for (let i = 0; i < maxLen; i++) {
      combined.push({
        rttIndex: i,
        tahoeCwnd: tahoeSnaps[i]?.cwndPackets || 0,
        renoCwnd: renoSnaps[i]?.cwndPackets || 0,
        newRenoCwnd: newRenoSnaps[i]?.cwndPackets || 0,
      });
    }

    return combined;
  }, [results]);

  return (
    <div className="space-y-6">
      {/* Title & Scenario Selector */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Concurrent Multi-Algorithm Benchmark Comparison
              </h2>
              <p className="text-xs text-slate-400">
                Evaluating TCP Tahoe, Reno, and NewReno under identical network conditions and random seeds.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCfg({ ...cfg, randomSeed: Math.floor(Math.random() * 90000) + 10000 })}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-all self-start md:self-auto"
          >
            <span>Change Seed ({cfg.randomSeed})</span>
          </button>
        </div>

        {/* Preset Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PRESET_SCENARIOS.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                setCfg({
                  linkCapacityMbps: p.config.linkCapacityMbps,
                  propDelayMs: p.config.propDelayMs,
                  mssBytes: p.config.mssBytes,
                  initialCwndPackets: p.config.initialCwndPackets,
                  initialSsthreshPackets: p.config.initialSsthreshPackets,
                  queueCapacityPackets: p.config.queueCapacityPackets,
                  randomLossProbability: p.config.randomLossProbability,
                  totalRttsToSimulate: p.config.totalRttsToSimulate,
                  randomSeed: p.config.randomSeed,
                })
              }
              className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 text-left transition-all space-y-1"
            >
              <div className="text-xs font-bold text-slate-200">{p.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{p.badge}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Overlay CWND Comparison Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Overlay CWND Dynamics Comparison Chart</span>
          </h3>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-rose-400 font-bold">● TCP Tahoe</span>
            <span className="text-cyan-400 font-bold">● TCP Reno</span>
            <span className="text-emerald-400 font-bold">● TCP NewReno</span>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="rttIndex" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" />
              <YAxis stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#1e293b',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono',
                }}
              />
              <Line type="monotone" dataKey="tahoeCwnd" name="TCP Tahoe" stroke="#f43f5e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="renoCwnd" name="TCP Reno" stroke="#38bdf8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="newRenoCwnd" name="TCP NewReno" stroke="#34d399" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Matrix Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          <span>Empirical Performance Metrics Benchmark Matrix</span>
        </h3>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Metric</th>
                <th className="py-3 px-4 text-rose-400">TCP Tahoe</th>
                <th className="py-3 px-4 text-cyan-400">TCP Reno</th>
                <th className="py-3 px-4 text-emerald-400">TCP NewReno</th>
                <th className="py-3 px-4">Winning Variant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200 bg-slate-950/40">
              <tr>
                <td className="py-2.5 px-4 font-bold">Receiver Goodput (Mbps)</td>
                <td className="py-2.5 px-4">{results.TAHOE.metrics.goodputMbps} Mbps</td>
                <td className="py-2.5 px-4">{results.RENO.metrics.goodputMbps} Mbps</td>
                <td className="py-2.5 px-4 font-bold text-emerald-400">
                  {results.NEW_RENO.metrics.goodputMbps} Mbps
                </td>
                <td className="py-2.5 px-4 text-emerald-400 font-bold">TCP NewReno</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold">Total Retransmissions</td>
                <td className="py-2.5 px-4">{results.TAHOE.metrics.totalRetransmissions}</td>
                <td className="py-2.5 px-4">{results.RENO.metrics.totalRetransmissions}</td>
                <td className="py-2.5 px-4">{results.NEW_RENO.metrics.totalRetransmissions}</td>
                <td className="py-2.5 px-4 text-cyan-400">
                  {results.NEW_RENO.metrics.totalRetransmissions <= results.RENO.metrics.totalRetransmissions
                    ? 'TCP NewReno'
                    : 'TCP Reno'}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold">RTO Timeouts Count</td>
                <td className="py-2.5 px-4">{results.TAHOE.metrics.totalTimeouts}</td>
                <td className="py-2.5 px-4">{results.RENO.metrics.totalTimeouts}</td>
                <td className="py-2.5 px-4">{results.NEW_RENO.metrics.totalTimeouts}</td>
                <td className="py-2.5 px-4 text-emerald-400">
                  {results.NEW_RENO.metrics.totalTimeouts < results.TAHOE.metrics.totalTimeouts
                    ? 'TCP NewReno / Reno'
                    : 'Tie'}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-bold">Link Goodput Efficiency</td>
                <td className="py-2.5 px-4">
                  {(results.TAHOE.metrics.efficiencyRatio * 100).toFixed(1)}%
                </td>
                <td className="py-2.5 px-4">
                  {(results.RENO.metrics.efficiencyRatio * 100).toFixed(1)}%
                </td>
                <td className="py-2.5 px-4 font-bold text-emerald-400">
                  {(results.NEW_RENO.metrics.efficiencyRatio * 100).toFixed(1)}%
                </td>
                <td className="py-2.5 px-4 text-emerald-400 font-bold">TCP NewReno</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
