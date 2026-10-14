/**
 * @file RoutingControls.tsx
 * @brief Routing Controls, Algorithm Picker, and TCP Simulator Bridge Trigger
 * @project CSE Network Programming AAT Final-Year Project Expansion
 */

import React from 'react';
import { RoutingAlgorithm, TopologyNode, TopologyPreset } from '../../engine/routingTypes';
import { PRESET_TOPOLOGIES } from '../../engine/presetTopologies';
import { Cpu, Send, Zap, RotateCcw, Share2, Play } from 'lucide-react';

interface RoutingControlsProps {
  algorithm: RoutingAlgorithm;
  onSelectAlgorithm: (algo: RoutingAlgorithm) => void;
  sourceNodeId: string;
  destNodeId: string;
  onSelectSource: (id: string) => void;
  onSelectDest: (id: string) => void;
  nodes: TopologyNode[];
  onSelectPreset: (preset: TopologyPreset) => void;
  onSendPackets: () => void;
  onResetTopology: () => void;
  onBridgeToTcpSim: () => void;
  isSimulating: boolean;
}

export const RoutingControls: React.FC<RoutingControlsProps> = ({
  algorithm,
  onSelectAlgorithm,
  sourceNodeId,
  destNodeId,
  onSelectSource,
  onSelectDest,
  nodes,
  onSelectPreset,
  onSendPackets,
  onResetTopology,
  onBridgeToTcpSim,
  isSimulating,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-5">
      {/* Title & Algorithm Mode Selection */}
      <div className="space-y-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            Routing Protocol & Path Controls
          </h2>
        </div>

        {/* Algorithm Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => onSelectAlgorithm('DIJKSTRA')}
            className={`py-2 px-2 text-xs font-bold rounded-md transition-all ${
              algorithm === 'DIJKSTRA'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dijkstra Shortest Path
          </button>
          <button
            onClick={() => onSelectAlgorithm('DISTANCE_VECTOR')}
            className={`py-2 px-2 text-xs font-bold rounded-md transition-all ${
              algorithm === 'DISTANCE_VECTOR'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Distance Vector (Bellman-Ford)
          </button>
        </div>
      </div>

      {/* Source & Destination Selectors */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="space-y-1">
          <label className="text-slate-400">Source Node:</label>
          <select
            value={sourceNodeId}
            onChange={(e) => onSelectSource(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label} ({n.id})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-slate-400">Destination Node:</label>
          <select
            value={destNodeId}
            onChange={(e) => onSelectDest(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label} ({n.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Topologies Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Demo Topologies</span>
        </label>

        <div className="grid grid-cols-1 gap-1.5">
          {PRESET_TOPOLOGIES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 text-left transition-all group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                {preset.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[220px]">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <button
          onClick={onSendPackets}
          disabled={isSimulating}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-all shadow-md active:scale-95"
        >
          <Send className="w-4 h-4 fill-slate-950" />
          <span>Simulate Packet Burst along Path</span>
        </button>

        <button
          onClick={onBridgeToTcpSim}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Apply Bottleneck Link to TCP Simulator</span>
        </button>

        <button
          onClick={onResetTopology}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Topology</span>
        </button>
      </div>
    </div>
  );
};
