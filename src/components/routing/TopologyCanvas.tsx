/**
 * @file TopologyCanvas.tsx
 * @brief Interactive Graph Canvas with Drag-and-Drop Nodes & Active Route Highlighting
 * @project CSE Network Programming AAT Final-Year Project Expansion
 */

import React, { useState, useRef } from 'react';
import { TopologyNode, TopologyLink, PathResult } from '../../engine/routingTypes';
import { Server, HardDrive, ShieldAlert, Zap, Plus, Trash2, Link as LinkIcon, Move } from 'lucide-react';

interface TopologyCanvasProps {
  nodes: TopologyNode[];
  links: TopologyLink[];
  activePath?: PathResult;
  selectedNodeId: string | null;
  selectedLinkId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onSelectLink: (linkId: string | null) => void;
  onUpdateNodePos: (nodeId: string, x: number, y: number) => void;
  onAddNode: (role: 'SENDER' | 'RECEIVER' | 'ROUTER') => void;
  onConnectNodes: (srcId: string, dstId: string) => void;
  onRemoveSelected: () => void;
  isSimulatingPackets: boolean;
}

export const TopologyCanvas: React.FC<TopologyCanvasProps> = ({
  nodes,
  links,
  activePath,
  selectedNodeId,
  selectedLinkId,
  onSelectNode,
  onSelectLink,
  onUpdateNodePos,
  onAddNode,
  onConnectNodes,
  onRemoveSelected,
  isSimulatingPackets,
}) => {
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const canvasRef = useRef<SVGSVGElement | null>(null);

  // Active path link IDs for edge glow highlighting
  const activePathNodePairs = new Set<string>();
  if (activePath && activePath.reachable && activePath.nodePath.length > 1) {
    for (let i = 0; i < activePath.nodePath.length - 1; i++) {
      const u = activePath.nodePath[i];
      const v = activePath.nodePath[i + 1];
      activePathNodePairs.add(`${u}_${v}`);
      activePathNodePairs.add(`${v}_${u}`);
    }
  }

  // Handle Dragging Nodes
  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectSourceId) {
      if (connectSourceId !== nodeId) {
        onConnectNodes(connectSourceId, nodeId);
      }
      setConnectSourceId(null);
    } else {
      setDraggedNodeId(nodeId);
      onSelectNode(nodeId);
      onSelectLink(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNodeId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(40, Math.min(rect.width - 40, e.clientX - rect.left));
    const y = Math.max(40, Math.min(rect.height - 40, e.clientY - rect.top));
    onUpdateNodePos(draggedNodeId, Math.round(x), Math.round(y));
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Workspace Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            Interactive Network Graph Canvas
          </h2>
          <span className="text-xs font-mono text-slate-400">
            ({nodes.length} nodes, {links.length} links)
          </span>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onAddNode('ROUTER')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Add Router</span>
          </button>

          <button
            onClick={() => onAddNode('SENDER')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Add Sender</span>
          </button>

          <button
            onClick={() => onAddNode('RECEIVER')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>+ Add Receiver</span>
          </button>

          <button
            onClick={() => {
              if (selectedNodeId) {
                setConnectSourceId(connectSourceId ? null : selectedNodeId);
              }
            }}
            disabled={!selectedNodeId}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all border ${
              connectSourceId
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/60 disabled:opacity-40'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>{connectSourceId ? 'Click Target Node...' : 'Connect Link'}</span>
          </button>

          {(selectedNodeId || selectedLinkId) && (
            <button
              onClick={onRemoveSelected}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/80 hover:bg-rose-900/80 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden h-[380px] select-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        <svg
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={() => {
            onSelectNode(null);
            onSelectLink(null);
            setConnectSourceId(null);
          }}
        >
          {/* Render Links / Edges */}
          {links.map((link) => {
            const src = nodes.find((n) => n.id === link.sourceId);
            const dst = nodes.find((n) => n.id === link.targetId);
            if (!src || !dst) return null;

            const isSelected = selectedLinkId === link.id;
            const isPathLink =
              link.active && activePathNodePairs.has(`${link.sourceId}_${link.targetId}`);

            const midX = (src.x + dst.x) / 2;
            const midY = (src.y + dst.y) / 2;

            return (
              <g key={link.id} className="group cursor-pointer">
                {/* Highlight Glow Edge */}
                {isPathLink && (
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={dst.x}
                    y2={dst.y}
                    stroke="#22d3ee"
                    strokeWidth={8}
                    strokeOpacity={0.4}
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                )}

                {/* Main Link Line */}
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  stroke={
                    !link.active
                      ? '#f43f5e'
                      : isSelected
                      ? '#38bdf8'
                      : isPathLink
                      ? '#22d3ee'
                      : '#334155'
                  }
                  strokeWidth={isPathLink ? 3.5 : isSelected ? 3 : 2}
                  strokeDasharray={!link.active ? '6 6' : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLink(link.id);
                    onSelectNode(null);
                  }}
                />

                {/* Link Label Badge (Cost / Bandwidth) */}
                <g
                  transform={`translate(${midX}, ${midY})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLink(link.id);
                    onSelectNode(null);
                  }}
                >
                  <rect
                    x={-28}
                    y={-10}
                    width={56}
                    height={20}
                    rx={4}
                    fill="#020617"
                    stroke={!link.active ? '#ef4444' : isPathLink ? '#0891b2' : '#1e293b'}
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fill={!link.active ? '#fca5a5' : isPathLink ? '#38bdf8' : '#94a3b8'}
                    fontSize={9}
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {!link.active ? 'FAILED' : `c:${link.weight} | ${link.bandwidthMbps}M`}
                  </text>
                </g>

                {/* Animated Moving Packet Pulses */}
                {isSimulatingPackets && isPathLink && link.active && (
                  <circle r={5} fill="#34d399">
                    <animateMotion
                      path={`M${src.x},${src.y} L${dst.x},${dst.y}`}
                      dur={`${Math.max(0.5, link.propDelayMs / 10)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isConnectSource = connectSourceId === node.id;
            const isPathNode = activePath?.nodePath.includes(node.id);

            const nodeColor =
              node.role === 'SENDER'
                ? '#10b981'
                : node.role === 'RECEIVER'
                ? '#a855f7'
                : '#0284c7';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                className="cursor-grab active:cursor-grabbing"
              >
                {/* Node Ring Highlight */}
                <circle
                  r={22}
                  fill="#020617"
                  stroke={
                    isConnectSource
                      ? '#f59e0b'
                      : isSelected
                      ? '#38bdf8'
                      : isPathNode
                      ? '#22d3ee'
                      : nodeColor
                  }
                  strokeWidth={isSelected || isConnectSource ? 3 : isPathNode ? 2.5 : 2}
                  className={isConnectSource ? 'animate-pulse' : undefined}
                />

                {/* Node Icon */}
                <foreignObject x={-10} y={-10} width={20} height={20} className="pointer-events-none">
                  <div className="flex items-center justify-center w-full h-full text-white">
                    {node.role === 'SENDER' ? (
                      <Server className="w-4 h-4 text-emerald-400" />
                    ) : node.role === 'RECEIVER' ? (
                      <Server className="w-4 h-4 text-purple-400" />
                    ) : (
                      <HardDrive className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                </foreignObject>

                {/* Node Text Label */}
                <text
                  y={34}
                  textAnchor="middle"
                  fill={isSelected ? '#38bdf8' : '#f8fafc'}
                  fontSize={10}
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
