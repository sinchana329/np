/**
 * @file LowGuardPage.tsx
 * @brief LowGuard Lightweight Network Flood Detection & Rate-Limiter Module
 * @project NetScope Platform - CSE Network Programming AAT Final-Year Project
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { LowGuardEngine, LowGuardConfig, LowGuardMetrics } from '../../engine/lowguardEngine';
import { ShieldAlert, Activity, Sliders, CheckCircle2, AlertTriangle, Zap, Play } from 'lucide-react';

export const LowGuardPage: React.FC = () => {
  const [config, setConfig] = useState<LowGuardConfig>({
    detectionThresholdRps: 50,
    slidingWindowSec: 5,
    baselineRateRps: 15,
    burstRateRps: 80,
    rateLimitMaxRps: 60,
    detectorType: 'THRESHOLD',
  });

  const [engine] = useState(() => new LowGuardEngine(config));
  const [events, setEvents] = useState(() => engine.generateSyntheticTraffic(30));

  const handleRunSimulation = () => {
    const newEngine = new LowGuardEngine(config);
    const evts = newEngine.generateSyntheticTraffic(30);
    setEvents(evts);
  };

  const metrics: LowGuardMetrics = useMemo(() => {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    let accepted = 0, rejected = 0;

    events.forEach((e) => {
      if (e.isTrueBurst && e.detectedAsBurst) tp++;
      else if (!e.isTrueBurst && e.detectedAsBurst) fp++;
      else if (!e.isTrueBurst && !e.detectedAsBurst) tn++;
      else if (e.isTrueBurst && !e.detectedAsBurst) fn++;

      if (e.rateLimited) rejected++;
      else accepted++;
    });

    const prec = tp + fp > 0 ? (tp / (tp + fp)) * 100 : 0;
    const rec = tp + fn > 0 ? (tp / (tp + fn)) * 100 : 0;
    const f1 = prec + rec > 0 ? (2 * prec * rec) / (prec + rec) : 0;

    return {
      truePositives: tp,
      falsePositives: fp,
      trueNegatives: tn,
      falseNegatives: fn,
      precisionPercent: parseFloat(prec.toFixed(1)),
      recallPercent: parseFloat(rec.toFixed(1)),
      f1ScorePercent: parseFloat(f1.toFixed(1)),
      detectionLatencyMs: 12.5,
      totalAccepted: accepted,
      totalRejected: rejected,
    };
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              LowGuard — Lightweight Network Flood Detection & Rate-Limiter
            </h2>
            <p className="text-xs text-slate-400">
              Detects abnormal connection bursts using sliding-window thresholds and token-bucket rate limiting.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunSimulation}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-slate-950" />
          <span>Run Traffic Test</span>
        </button>
      </div>

      {/* Confusion Matrix Evaluation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">Detection Precision</div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {metrics.precisionPercent}%
          </div>
          <p className="text-[10px] text-slate-400">TP / (TP + FP)</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">Detection Recall</div>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {metrics.recallPercent}%
          </div>
          <p className="text-[10px] text-slate-400">TP / (TP + FN)</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">F1 Score</div>
          <div className="text-xl font-bold font-mono text-purple-400">
            {metrics.f1ScorePercent}%
          </div>
          <p className="text-[10px] text-slate-400">Harmonic mean</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">Rate Limited</div>
          <div className="text-xl font-bold font-mono text-rose-400">
            {metrics.totalRejected} reqs
          </div>
          <p className="text-[10px] text-slate-400">Token Bucket Drops</p>
        </div>
      </div>

      {/* Main Grid: Controls + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Controls (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Detection Controls
            </h3>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-slate-400">Detector Mode:</label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded border border-slate-800 text-[11px]">
                <button
                  onClick={() => setConfig({ ...config, detectorType: 'THRESHOLD' })}
                  className={`py-1 rounded font-bold transition-all ${
                    config.detectorType === 'THRESHOLD' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Threshold
                </button>
                <button
                  onClick={() => setConfig({ ...config, detectorType: 'EWMA_ANOMALY' })}
                  className={`py-1 rounded font-bold transition-all ${
                    config.detectorType === 'EWMA_ANOMALY' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  EWMA Anomaly
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Threshold (RPS):</span>
                <span className="text-cyan-400 font-bold">{config.detectionThresholdRps} RPS</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                step="5"
                value={config.detectionThresholdRps}
                onChange={(e) => setConfig({ ...config, detectionThresholdRps: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Token Bucket Cap:</span>
                <span className="text-rose-400 font-bold">{config.rateLimitMaxRps} RPS</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="5"
                value={config.rateLimitMaxRps}
                onChange={(e) => setConfig({ ...config, rateLimitMaxRps: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-rose-400"
              />
            </div>
          </div>
        </div>

        {/* Time Series Recharts Chart (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Traffic Flood Rate & Anomaly Detection Plot
            </h3>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-cyan-400 font-bold">● Request Rate (RPS)</span>
              <span className="text-rose-400 font-bold">-- Threshold ({config.detectionThresholdRps})</span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={events} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="id" stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
                <Bar dataKey="requestRateRps" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <ReferenceLine y={config.detectionThresholdRps} stroke="#ef4444" strokeDasharray="4 4" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
