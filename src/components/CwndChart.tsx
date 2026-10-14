/**
 * @file CwndChart.tsx
 * @brief High-Contrast CWND vs RTT Line Chart using Recharts
 * @project CSE Network Programming AAT Final-Year Project
 */

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { RttSnapshot } from '../engine/types';
import { Activity, AlertTriangle, RefreshCw, Zap } from 'lucide-react';

interface CwndChartProps {
  snapshots: RttSnapshot[];
  currentRttIndex: number;
}

export const CwndChart: React.FC<CwndChartProps> = ({ snapshots, currentRttIndex }) => {
  const visibleSnapshots = snapshots.slice(0, currentRttIndex + 1);

  // Identify special event points (Fast Retransmits, Timeout)
  const specialEvents = visibleSnapshots.filter(
    (s) => s.lastEvent === 'FAST_RETRANSMIT' || s.lastEvent === 'RTO_TIMEOUT'
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Chart Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            Congestion Window (CWND) Evolution
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 rounded-full" />
            <span className="text-slate-300">CWND (Packets)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 border-b border-dashed border-amber-400" />
            <span className="text-slate-300">SSThresh</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400" />
            <span className="text-slate-300">In-Flight</span>
          </div>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={visibleSnapshots}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="rttIndex"
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono"
              tickLine={false}
              label={{
                value: 'Round Trip Time Index (RTT)',
                position: 'insideBottom',
                offset: -5,
                fill: '#64748b',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
              }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="JetBrains Mono"
              tickLine={false}
              domain={[0, 'auto']}
              label={{
                value: 'Packets',
                angle: -90,
                position: 'insideLeft',
                offset: 15,
                fill: '#64748b',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#334155', strokeWidth: 1 }}
            />

            {/* SSThresh line (dashed amber) */}
            <Line
              type="stepAfter"
              dataKey="ssthreshPackets"
              name="SSThresh"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={false}
            />

            {/* CWND line (bold cyan) */}
            <Line
              type="monotone"
              dataKey="cwndPackets"
              name="CWND"
              stroke="#22d3ee"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#22d3ee', stroke: '#0891b2', strokeWidth: 2 }}
            />

            {/* In-Flight Packets line (emerald) */}
            <Line
              type="monotone"
              dataKey="inFlightPackets"
              name="In-Flight Packets"
              stroke="#34d399"
              strokeWidth={1.5}
              dot={false}
              activeDot={false}
            />

            {/* Event Markers */}
            {specialEvents.map((evt) => (
              <ReferenceLine
                key={`ref_${evt.rttIndex}`}
                x={evt.rttIndex}
                stroke={evt.lastEvent === 'RTO_TIMEOUT' ? '#ef4444' : '#f59e0b'}
                strokeDasharray="3 3"
                label={{
                  value: evt.lastEvent === 'RTO_TIMEOUT' ? 'RTO' : 'FR',
                  position: 'top',
                  fill: evt.lastEvent === 'RTO_TIMEOUT' ? '#fca5a5' : '#fcd34d',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Event Indicator Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-400">
        <span className="text-slate-400">Event Highlights in current run:</span>
        {specialEvents.length === 0 ? (
          <span className="text-emerald-400">● Smooth Growth (No Loss)</span>
        ) : (
          specialEvents.map((e) => (
            <span
              key={`chip_${e.rttIndex}`}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
                e.lastEvent === 'RTO_TIMEOUT'
                  ? 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
              }`}
            >
              {e.lastEvent === 'RTO_TIMEOUT' ? (
                <AlertTriangle className="w-3 h-3 text-rose-400" />
              ) : (
                <Zap className="w-3 h-3 text-amber-400" />
              )}
              <span>
                RTT {e.rttIndex}: {e.lastEvent} (CWND {e.cwndPackets.toFixed(0)})
              </span>
            </span>
          ))
        )}
      </div>
    </div>
  );
};

// Custom Tooltip component for rich inspection
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as RttSnapshot;
    return (
      <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-lg shadow-xl text-xs font-mono space-y-1.5 backdrop-blur-md">
        <div className="font-bold text-cyan-400 flex items-center justify-between gap-4 border-b border-slate-800 pb-1">
          <span>RTT Tick: #{label}</span>
          <span>{data.timeMs.toFixed(0)} ms</span>
        </div>
        <div className="space-y-1 pt-0.5">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">CWND:</span>
            <span className="text-cyan-400 font-bold">{data.cwndPackets.toFixed(2)} pkts</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">SSThresh:</span>
            <span className="text-amber-400 font-bold">{data.ssthreshPackets.toFixed(0)} pkts</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Phase:</span>
            <span className="text-emerald-400">{data.state}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Queue Buffer:</span>
            <span className="text-slate-200">{data.queueLength} pkts</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-400">Total Drops:</span>
            <span className="text-rose-400">{data.totalDrops}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
