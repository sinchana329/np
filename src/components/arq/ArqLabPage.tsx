/**
 * @file ArqLabPage.tsx
 * @brief Reliable Transport Protocol Lab Page (Stop-and-Wait, Go-Back-N, Selective Repeat)
 * @project NetScope Platform - CSE Network Programming AAT Final-Year Project
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArqEngine, ArqConfig, ArqProtocol, ArqMetrics } from '../../engine/arqEngine';
import { ArqSlidingWindow } from './ArqSlidingWindow';
import { RotateCcw, Play, Pause, SkipForward, Sliders, Zap, Award, Gauge, Clock, RefreshCw } from 'lucide-react';

export const ArqLabPage: React.FC = () => {
  const [config, setConfig] = useState<ArqConfig>({
    protocol: 'GO_BACK_N',
    windowSize: 4,
    totalPacketsToSend: 20,
    lossProbability: 0.15,
    propDelayMs: 30,
    timeoutMs: 120,
    randomSeed: 42,
  });

  const [engine, setEngine] = useState<ArqEngine>(() => new ArqEngine(config));
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stepCount, setStepCount] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const newEngine = new ArqEngine(config);
    setEngine(newEngine);
    setIsRunning(false);
    setStepCount(0);
  }, [config]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setStepCount((prev) => {
          const hasMore = engine.step();
          if (!hasMore) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
          }
          return prev + 1;
        });
      }, 350);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, engine]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStep = () => {
    engine.step();
    setStepCount((prev) => prev + 1);
  };

  const handleReset = () => {
    setIsRunning(false);
    engine.reset();
    setStepCount(0);
  };

  const snapshots = engine.getSnapshots();
  const currentSnap = snapshots[snapshots.length - 1] || snapshots[0];
  const metrics: ArqMetrics = engine.getMetrics();

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono">Delivered Frames</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {metrics.totalDelivered} / {config.totalPacketsToSend}
          </div>
          <p className="text-[10px] text-slate-400">Successfully ACKed</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono">Retransmissions</span>
            <RefreshCw className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {metrics.totalRetransmissions} <span className="text-xs font-normal text-slate-400">pkts</span>
          </div>
          <p className="text-[10px] text-slate-400">Loss / Timeout resends</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono">Estimated Throughput</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {metrics.throughputMbps} <span className="text-xs font-normal text-slate-400">Mbps</span>
          </div>
          <p className="text-[10px] text-slate-400">Payload delivery rate</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono">Protocol Efficiency</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-400">
            {metrics.efficiencyPercent}%
          </div>
          <p className="text-[10px] text-slate-400">Delivered / Transmitted</p>
        </div>
      </div>

      {/* Main Grid: Controls + Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Controls (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="space-y-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white tracking-wide">
                ARQ Protocol Config
              </h2>
            </div>

            {/* Protocol Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono">
              {(['STOP_AND_WAIT', 'GO_BACK_N', 'SELECTIVE_REPEAT'] as ArqProtocol[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setConfig({ ...config, protocol: p })}
                  className={`py-1.5 px-1 rounded font-bold transition-all text-center ${
                    config.protocol === p
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p === 'STOP_AND_WAIT' ? 'Stop-Wait' : p === 'GO_BACK_N' ? 'GBN' : 'SR'}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 text-xs font-mono">
            {config.protocol !== 'STOP_AND_WAIT' && (
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sliding Window Size (N):</span>
                  <span className="text-cyan-400 font-bold">{config.windowSize}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  value={config.windowSize}
                  onChange={(e) => setConfig({ ...config, windowSize: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-cyan-400"
                />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Frame Loss Rate:</span>
                <span className="text-amber-400 font-bold">
                  {(config.lossProbability * 100).toFixed(0)} %
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.4"
                step="0.05"
                value={config.lossProbability}
                onChange={(e) => setConfig({ ...config, lossProbability: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-amber-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Propagation Delay:</span>
                <span className="text-cyan-400 font-bold">{config.propDelayMs} ms</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={config.propDelayMs}
                onChange={(e) => setConfig({ ...config, propDelayMs: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-cyan-400"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="col-span-2 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start ARQ</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="col-span-2 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all active:scale-95 shadow-md shadow-amber-500/20"
              >
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Right Stage (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <ArqSlidingWindow
            protocol={config.protocol}
            frames={currentSnap ? currentSnap.frames : []}
            sendBase={currentSnap ? currentSnap.sendBase : 0}
            windowSize={config.windowSize}
          />
        </div>
      </div>
    </div>
  );
};
