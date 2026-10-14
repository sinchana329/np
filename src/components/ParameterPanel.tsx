/**
 * @file ParameterPanel.tsx
 * @brief Interactive Network Configuration and Simulation Execution Deck
 * @project CSE Network Programming AAT Final-Year Project
 */

import React from 'react';
import { Play, Pause, SkipForward, RotateCcw, Sliders, Zap, Shuffle } from 'lucide-react';
import { NetworkConfig, PresetScenario, TcpVariant } from '../engine/types';
import { PRESET_SCENARIOS } from '../engine/TcpEngineBridge';

interface ParameterPanelProps {
  config: NetworkConfig;
  onChangeConfig: (newConfig: NetworkConfig) => void;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  currentRtt: number;
  totalRtts: number;
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({
  config,
  onChangeConfig,
  isRunning,
  onStart,
  onPause,
  onStep,
  onReset,
  playbackSpeed,
  setPlaybackSpeed,
  currentRtt,
  totalRtts,
}) => {
  const handleVariantChange = (variant: TcpVariant) => {
    onChangeConfig({ ...config, variant });
  };

  const handleSliderChange = (key: keyof NetworkConfig, value: number) => {
    onChangeConfig({ ...config, [key]: value });
  };

  const handleSelectPreset = (preset: PresetScenario) => {
    onChangeConfig({ ...preset.config });
  };

  const generateNewSeed = () => {
    const randomSeed = Math.floor(Math.random() * 90000) + 10000;
    onChangeConfig({ ...config, randomSeed });
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-6 flex flex-col justify-between h-full">
      {/* Header & Algorithm Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white tracking-wide">
              TCP Algorithm Selector
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            C++ Engine v1.0
          </span>
        </div>

        {/* Algorithm Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
          {(['TAHOE', 'RENO', 'NEW_RENO'] as TcpVariant[]).map((v) => (
            <button
              key={v}
              onClick={() => handleVariantChange(v)}
              className={`py-2 px-2 text-xs font-medium rounded-md transition-all whitespace-nowrap text-center ${
                config.variant === v
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {v === 'TAHOE' ? 'TCP Tahoe' : v === 'RENO' ? 'TCP Reno' : 'TCP NewReno'}
            </button>
          ))}
        </div>

        {/* Preset Scenarios Selector */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Preset Network Scenarios
            </span>
          </label>
          <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto pr-1">
            {PRESET_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleSelectPreset(scenario)}
                className="flex items-center justify-between p-2 rounded-lg border border-slate-800/80 bg-slate-950/50 hover:bg-slate-800/60 transition-all text-left group"
              >
                <div>
                  <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">
                    {scenario.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                    {scenario.description}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50">
                  {scenario.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Network Topography Sliders */}
        <div className="space-y-4 pt-2 border-t border-slate-800/80">
          <h3 className="text-xs font-semibold text-slate-300 tracking-wide uppercase font-mono text-[11px]">
            Network Parameters
          </h3>

          {/* Link Bandwidth */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Link Bandwidth:</span>
              <span className="text-cyan-400 font-semibold">{config.linkCapacityMbps} Mbps</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={config.linkCapacityMbps}
              onChange={(e) => handleSliderChange('linkCapacityMbps', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Propagation Delay */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Propagation Delay (One-Way):</span>
              <span className="text-cyan-400 font-semibold">{config.propDelayMs} ms</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={config.propDelayMs}
              onChange={(e) => handleSliderChange('propDelayMs', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="text-[10px] font-mono text-slate-400 text-right">
              Round Trip Time (RTT) = {config.propDelayMs * 2} ms
            </div>
          </div>

          {/* Router Queue Capacity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Bottleneck Buffer Size:</span>
              <span className="text-cyan-400 font-semibold">{config.queueCapacityPackets} Packets</span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              step="1"
              value={config.queueCapacityPackets}
              onChange={(e) => handleSliderChange('queueCapacityPackets', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Random Packet Loss Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Random Packet Drop Rate:</span>
              <span className="text-amber-400 font-semibold">
                {(config.randomLossProbability * 100).toFixed(1)} %
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.15"
              step="0.005"
              value={config.randomLossProbability}
              onChange={(e) => handleSliderChange('randomLossProbability', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Seed & Simulation Duration */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>PRNG Seed:</span>
                <button
                  onClick={generateNewSeed}
                  className="text-cyan-400 hover:underline flex items-center gap-0.5"
                  title="Generate new deterministic seed"
                >
                  <Shuffle className="w-2.5 h-2.5" />
                  <span>Random</span>
                </button>
              </div>
              <input
                type="number"
                value={config.randomSeed}
                onChange={(e) => handleSliderChange('randomSeed', parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200 text-center"
              />
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono text-slate-400">
                Duration (RTTs):
              </div>
              <input
                type="number"
                min="20"
                max="200"
                value={config.totalRttsToSimulate}
                onChange={(e) => handleSliderChange('totalRttsToSimulate', parseInt(e.target.value) || 30)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200 text-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Execution Controls & Playback Controls */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Playback Progress:</span>
          <span className="text-white font-semibold">
            RTT {currentRtt} / {totalRtts}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, (currentRtt / totalRtts) * 100)}%` }}
          />
        </div>

        {/* Playback Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {!isRunning ? (
            <button
              onClick={onStart}
              className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Run / Resume</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all active:scale-95 shadow-md shadow-amber-500/20"
            >
              <Pause className="w-4 h-4 fill-slate-950" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={onStep}
            disabled={isRunning || currentRtt >= totalRtts}
            className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-all active:scale-95"
            title="Step forward 1 RTT tick"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-95"
            title="Reset simulation to RTT 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-400 font-mono text-[11px]">Speed:</span>
          <div className="flex items-center gap-1">
            {[0.5, 1.0, 2.0, 4.0].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  playbackSpeed === s
                    ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-950/60'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
