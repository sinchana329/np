/**
 * @file AlgorithmsExplanation.tsx
 * @brief Comprehensive Academic Guide on TCP Algorithms and Rules
 * @project CSE Network Programming AAT Final-Year Project
 */

import React from 'react';
import { BookOpen, Shield, Zap, AlertTriangle } from 'lucide-react';

export const AlgorithmsExplanation: React.FC = () => {
  return (
    <div className="space-y-6 text-slate-200">
      {/* Overview Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            TCP Congestion Control Algorithms &amp; Mathematical Specifications
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          TCP Congestion Control prevents network collapse by dynamically discovering bottleneck link capacity
          and adjusting the sender’s transmission window (<code className="text-cyan-400">cwnd</code>). This document details the exact rule sets,
          state transitions, and mathematical formulas implemented in our C++ core simulation engine.
        </p>
      </div>

      {/* Side-by-Side Algorithm Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* TCP Tahoe */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-rose-400 font-mono">1. TCP Tahoe (RFC 1122 / 2001)</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              Legacy Base
            </span>
          </div>

          <ul className="text-xs space-y-2.5 text-slate-300 font-mono">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">●</span>
              <span><strong>Slow Start:</strong> cwnd_next = cwnd + 1 per ACK (when cwnd &lt; ssthresh).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">●</span>
              <span><strong>Congestion Avoidance:</strong> cwnd_next = cwnd + (1 / cwnd) per ACK (when cwnd &ge; ssthresh).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">●</span>
              <span><strong>On 3 DupACKs:</strong> ssthresh = max(2, floor(cwnd/2)), reset cwnd = 1, enter Slow Start.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">●</span>
              <span><strong>On Timeout (RTO):</strong> ssthresh = max(2, floor(cwnd/2)), reset cwnd = 1.</span>
            </li>
          </ul>

          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400">
            <strong className="text-rose-300">Key Limitation:</strong> Tahoe drops <code className="text-rose-300">cwnd</code> back to 1 on <em>every</em> loss event, resulting in low bandwidth utilization over high BDP paths.
          </div>
        </div>

        {/* TCP Reno */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-cyan-400 font-mono">2. TCP Reno (RFC 2581)</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Fast Recovery
            </span>
          </div>

          <ul className="text-xs space-y-2.5 text-slate-300 font-mono">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">●</span>
              <span><strong>Slow Start &amp; AIMD:</strong> Same as Tahoe during normal delivery.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">●</span>
              <span><strong>Fast Retransmit:</strong> On 3 DupACKs, retransmit missing segment without waiting for RTO timer.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">●</span>
              <span><strong>Fast Recovery:</strong> ssthresh = max(2, floor(cwnd/2)), inflate cwnd = ssthresh + 3.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">●</span>
              <span><strong>Exit Rule:</strong> On New ACK, deflate cwnd = ssthresh, re-enter Congestion Avoidance.</span>
            </li>
          </ul>

          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400">
            <strong className="text-cyan-300">Key Limitation:</strong> If multiple packets are dropped from a single window, Reno suffers multiple Fast Recoveries or falls back to an RTO timeout.
          </div>
        </div>

        {/* TCP NewReno */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-emerald-400 font-mono">3. TCP NewReno (RFC 6582)</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Partial ACK Smart
            </span>
          </div>

          <ul className="text-xs space-y-2.5 text-slate-300 font-mono">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">●</span>
              <span><strong>Recovery Sequence Tracker:</strong> Records recoverSeq = highest sent segment upon loss.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">●</span>
              <span><strong>Partial ACK Handling:</strong> If ACK &lt; recoverSeq, retransmit next missing segment immediately while staying in Fast Recovery.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">●</span>
              <span><strong>Full ACK Exit:</strong> Only exits Fast Recovery when ACK &ge; recoverSeq.</span>
            </li>
          </ul>

          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400">
            <strong className="text-emerald-300">Key Advantage:</strong> Efficiently recovers from multiple packet drops in one window without unnecessary RTO timeouts.
          </div>
        </div>
      </div>

      {/* Queue Loss vs Random Loss Classification */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Distinction Between Queue Overflow Loss and Random Link Corruption</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <h4 className="font-bold text-rose-400 font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Queue Overflow Loss (Congestion Drop)</span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Occurs when the total offered packet rate exceeds link capacity and fills the finite bottleneck router queue.
              Tail-drop policy discards arriving packets once the queue reaches capacity (<code className="text-rose-300">queueLength == queueCap</code>).
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-400 font-mono flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Random Independent Loss (Non-Congestion Drop)</span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Occurs due to wireless signal attenuation, bit errors, or physical medium noise.
              Modeled using a Bernoulli trial with configurable probability <i>P<sub>loss</sub></i> independent of buffer occupancy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
