/**
 * @file NodeLinkInspector.tsx
 * @brief Inspector Side Panel for Editing Selected Topology Nodes and Links
 * @project CSE Network Programming AAT Final-Year Project Expansion
 */

import React from 'react';
import { TopologyNode, TopologyLink, NodeRole } from '../../engine/routingTypes';
import { Sliders, ShieldAlert, CheckCircle2, Trash2 } from 'lucide-react';

interface NodeLinkInspectorProps {
  selectedNode: TopologyNode | null;
  selectedLink: TopologyLink | null;
  nodes: TopologyNode[];
  onUpdateNode: (node: TopologyNode) => void;
  onUpdateLinkProps: (linkId: string, props: Partial<TopologyLink>) => void;
  onToggleLinkStatus: (linkId: string) => void;
  onDeleteSelected: () => void;
}

export const NodeLinkInspector: React.FC<NodeLinkInspectorProps> = ({
  selectedNode,
  selectedLink,
  nodes,
  onUpdateNode,
  onUpdateLinkProps,
  onToggleLinkStatus,
  onDeleteSelected,
}) => {
  if (!selectedNode && !selectedLink) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Inspector Panel
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Click any Node or Link on the graph canvas to inspect and edit its properties.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            {selectedNode ? `Node Inspector (${selectedNode.id})` : `Link Inspector (${selectedLink?.id})`}
          </h3>
        </div>

        <button
          onClick={onDeleteSelected}
          className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
          title="Delete selected item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* NODE INSPECTOR */}
      {selectedNode && (
        <div className="space-y-4 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-slate-400">Node Label:</label>
            <input
              type="text"
              value={selectedNode.label}
              onChange={(e) => onUpdateNode({ ...selectedNode, label: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">Node Role:</label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded border border-slate-800">
              {(['SENDER', 'ROUTER', 'RECEIVER'] as NodeRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onUpdateNode({ ...selectedNode, role: r })}
                  className={`py-1 text-[10px] rounded font-bold transition-all ${
                    selectedNode.role === r
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LINK INSPECTOR */}
      {selectedLink && (
        <div className="space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Link Status:</span>
            <button
              onClick={() => onToggleLinkStatus(selectedLink.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                selectedLink.active
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-800'
              }`}
            >
              {selectedLink.active ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ACTIVE (Click to Fail)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>FAILED (Click to Restore)</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Routing Cost Weight:</span>
              <span className="text-cyan-400 font-bold">{selectedLink.weight}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={selectedLink.weight}
              onChange={(e) => onUpdateLinkProps(selectedLink.id, { weight: parseInt(e.target.value) || 1 })}
              className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Link Bandwidth:</span>
              <span className="text-cyan-400 font-bold">{selectedLink.bandwidthMbps} Mbps</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={selectedLink.bandwidthMbps}
              onChange={(e) => onUpdateLinkProps(selectedLink.id, { bandwidthMbps: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Propagation Delay:</span>
              <span className="text-cyan-400 font-bold">{selectedLink.propDelayMs} ms</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={selectedLink.propDelayMs}
              onChange={(e) => onUpdateLinkProps(selectedLink.id, { propDelayMs: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Queue Capacity:</span>
              <span className="text-cyan-400 font-bold">{selectedLink.queueCapacityPackets} pkts</span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              step="1"
              value={selectedLink.queueCapacityPackets}
              onChange={(e) => onUpdateLinkProps(selectedLink.id, { queueCapacityPackets: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-cyan-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};
