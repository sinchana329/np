/**
 * @file ArqSlidingWindow.tsx
 * @brief Interactive Sliding Window Visualizer Component for ARQ Protocols
 * @project NetScope Platform - CSE Network Programming AAT Final-Year Project
 */

import React from 'react';
import { ArqFrame, ArqProtocol } from '../../engine/arqEngine';

interface ArqSlidingWindowProps {
  protocol: ArqProtocol;
  frames: ArqFrame[];
  sendBase: number;
  windowSize: number;
}

export const ArqSlidingWindow: React.FC<ArqSlidingWindowProps> = ({
  protocol,
  frames,
  sendBase,
  windowSize,
}) => {
  const maxWindow = protocol === 'STOP_AND_WAIT' ? 1 : windowSize;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
          <span>Sliding Window State Visualizer</span>
          <span className="text-xs font-normal text-cyan-400">
            (Window Size N = {maxWindow}, Send Base = {sendBase})
          </span>
        </h3>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
            <span className="text-slate-300">ACKed</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
            <span className="text-slate-300">In-Flight</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500" />
            <span className="text-slate-300">Timed-Out</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-800" />
            <span className="text-slate-300">Unsent</span>
          </div>
        </div>
      </div>

      {/* Sliding Window Sequence Slot Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-2 min-w-max p-4 bg-slate-950 rounded-xl border border-slate-800">
          {frames.map((frame, idx) => {
            const inWindow = idx >= sendBase && idx < sendBase + maxWindow;
            const isBase = idx === sendBase;

            return (
              <div
                key={frame.seqNum}
                className={`relative flex flex-col items-center justify-between p-2.5 w-14 h-20 rounded-lg border transition-all ${
                  inWindow
                    ? 'border-cyan-500/80 bg-slate-900 shadow-md shadow-cyan-500/10'
                    : 'border-slate-800/80 bg-slate-950/60 opacity-60'
                }`}
              >
                {/* Window Boundary Indicator */}
                {isBase && (
                  <span className="absolute -top-3 text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                    BASE
                  </span>
                )}

                <span className="text-[10px] font-mono font-bold text-slate-400">
                  #{frame.seqNum}
                </span>

                {/* Status Dot / Block */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                    frame.status === 'ACKED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : frame.status === 'IN_FLIGHT'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse'
                      : frame.status === 'TIMED_OUT'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}
                >
                  {frame.status === 'ACKED'
                    ? 'ACK'
                    : frame.status === 'IN_FLIGHT'
                    ? 'TX'
                    : frame.status === 'TIMED_OUT'
                    ? 'RTO'
                    : '-'}
                </div>

                <span className="text-[9px] font-mono text-slate-400">
                  {frame.txCount > 0 ? `${frame.txCount} tx` : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
