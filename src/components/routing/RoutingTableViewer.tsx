/**
 * @file RoutingTableViewer.tsx
 * @brief Live Routing Table Inspector Matrix Component
 * @project CSE Network Programming AAT Final-Year Project Expansion
 */

import React, { useState } from 'react';
import { RoutingTableEntry, TopologyNode } from '../../engine/routingTypes';
import { Table, HardDrive } from 'lucide-react';

interface RoutingTableViewerProps {
  routingTables: Map<string, RoutingTableEntry[]>;
  nodes: TopologyNode[];
}

export const RoutingTableViewer: React.FC<RoutingTableViewerProps> = ({
  routingTables,
  nodes,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    nodes[0]?.id || ''
  );

  const activeNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const currentTable = routingTables.get(selectedNodeId) || [];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            Live Node Routing Table Matrix
          </h2>
        </div>

        {/* Node Switcher Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
          {nodes.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedNodeId(n.id)}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                selectedNodeId === n.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Display */}
      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Destination Node</th>
              <th className="py-2.5 px-3">Next Hop Router</th>
              <th className="py-2.5 px-3">Path Metric / Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300 bg-slate-950/40">
            {currentTable.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-slate-400">
                  No reachable destination routes logged for node {activeNode?.label || selectedNodeId}.
                </td>
              </tr>
            ) : (
              currentTable.map((e) => {
                const destNode = nodes.find((n) => n.id === e.destNodeId);
                const nextHopNode = nodes.find((n) => n.id === e.nextHopId);

                return (
                  <tr key={e.destNodeId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">
                      {destNode ? destNode.label : e.destNodeId} ({e.destNodeId})
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">
                      {nextHopNode ? nextHopNode.label : e.nextHopId} ({e.nextHopId})
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-bold">{e.cost}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
