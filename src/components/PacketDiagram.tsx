/**
 * @file PacketDiagram.tsx
 * @brief Interactive Animated Sender -> Router -> Receiver Topology Stage
 * @project CSE Network Programming AAT Final-Year Project
 */

import React from 'react';
import { NetworkConfig, RttSnapshot } from '../engine/types';
import { Server, HardDrive, ArrowRight, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PacketDiagramProps {
  config: NetworkConfig;
  currentSnapshot?: RttSnapshot;
  isRunning: boolean;
}

export const PacketDiagram: React.FC<PacketDiagramProps> = ({
  config,
  currentSnapshot,
  isRunning,
}) => {
  const cwnd = currentSnapshot?.cwndPackets || config.initialCwndPackets;
  const queueLength = currentSnapshot?.queueLength || 0;
  const queueCap = config.queueCapacityPackets;
  const state = currentSnapshot?.state || 'Slow Start';
  const lastEvent = currentSnapshot?.lastEvent || 'ACK_RX';

  // Calculate percentage queue utilization
  const queueFillPct = Math.min(100, Math.round((queueLength / queueCap) * 100));

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            Network Topology & Bottleneck Queue Dynamics
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Queue Usage:</span>
          <span
            className={`font-bold ${
              queueFillPct > 80
                ? 'text-rose-400'
                : queueFillPct > 50
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {queueLength} / {queueCap} pkts ({queueFillPct}%)
          </span>
        </div>
      </div>

      {/* Interactive Topology Diagram Stage */}
      <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-6 overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:16px_16px]" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Node 1: TCP Sender */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center space-y-2 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-tight">TCP Sender</h3>
              <p className="text-[10px] font-mono text-cyan-400 mt-0.5">
                {config.variant} Engine
              </p>
            </div>
            <div className="w-full bg-slate-950 p-2 rounded border border-slate-800/80 text-[11px] font-mono space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">CWND:</span>
                <span className="text-cyan-400 font-bold">{cwnd.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">State:</span>
                <span className="text-emerald-400">{state}</span>
              </div>
            </div>
          </div>

          {/* Node 2: Bottleneck Router Queue */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center space-y-3 shadow-lg relative">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <span>Bottleneck Router</span>
              <span className="text-[10px] font-mono text-slate-400">({config.linkCapacityMbps} Mbps)</span>
            </div>

            {/* Queue Buffer Animation Slot */}
            <div className="w-full bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Buffer Capacity ({queueCap})</span>
                <span>{queueLength} Queued</span>
              </div>

              {/* Buffer Slots Visualizer */}
              <div className="grid grid-cols-10 gap-1 h-6 items-center">
                {Array.from({ length: Math.min(20, queueCap) }).map((_, idx) => {
                  const isFilled = idx < queueLength;
                  return (
                    <div
                      key={idx}
                      className={`h-4 rounded-sm transition-all duration-300 ${
                        isFilled
                          ? idx >= queueCap - 2
                            ? 'bg-rose-500 animate-pulse'
                            : 'bg-cyan-400 shadow-sm shadow-cyan-400/50'
                          : 'bg-slate-800/60 border border-slate-700/30'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Event Drop Status Banner */}
            {lastEvent === 'DROP_QUEUE' && (
              <div className="w-full bg-rose-950/80 border border-rose-800 rounded p-1.5 flex items-center justify-center gap-1.5 text-[11px] font-mono text-rose-300 animate-bounce">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Queue Tail-Drop Occurred!</span>
              </div>
            )}
            {lastEvent === 'DROP_RANDOM' && (
              <div className="w-full bg-amber-950/80 border border-amber-800 rounded p-1.5 flex items-center justify-center gap-1.5 text-[11px] font-mono text-amber-300 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Random Link Corruption Drop</span>
              </div>
            )}
            {lastEvent === 'ACK_RX' && (
              <div className="w-full bg-emerald-950/40 border border-emerald-800/40 rounded p-1 text-[11px] font-mono text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Packet Transmitted & ACKed</span>
              </div>
            )}
          </div>

          {/* Node 3: TCP Receiver */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center space-y-2 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-tight">TCP Receiver</h3>
              <p className="text-[10px] font-mono text-emerald-400 mt-0.5">Cumulative ACKs</p>
            </div>
            <div className="w-full bg-slate-950 p-2 rounded border border-slate-800/80 text-[11px] font-mono space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Acked Bytes:</span>
                <span className="text-emerald-400 font-bold">
                  {((currentSnapshot?.totalBytesAcked || 0) / 1024).toFixed(0)} KB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Prop Delay:</span>
                <span className="text-slate-300">{config.propDelayMs} ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Moving Packets Overlay */}
        {isRunning && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/80 animate-ping" />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/80 animate-ping" />
          </div>
        )}
      </div>
    </div>
  );
};
