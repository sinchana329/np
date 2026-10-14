/**
 * @file RoutingSimulatorPage.tsx
 * @brief Master Network Topology and Routing Simulator Page Component
 * @project CSE Network Programming AAT Final-Year Project Expansion
 */

import React, { useState, useMemo } from 'react';
import { TopologyCanvas } from './TopologyCanvas';
import { NodeLinkInspector } from './NodeLinkInspector';
import { RoutingControls } from './RoutingControls';
import { RoutingTableViewer } from './RoutingTableViewer';
import { RoutingKpiCards } from './RoutingKpiCards';
import { RoutingEventLog } from './RoutingEventLog';

import {
  TopologyNode,
  TopologyLink,
  RoutingAlgorithm,
  TopologyPreset,
  RoutedPacket,
  RoutingMetrics,
} from '../../engine/routingTypes';
import { RoutingEngine } from '../../engine/RoutingEngine';
import { PRESET_TOPOLOGIES } from '../../engine/presetTopologies';
import { NetworkConfig } from '../../engine/types';

interface RoutingSimulatorPageProps {
  onApplyBottleneckToTcp: (bottleneckConfig: Partial<NetworkConfig>) => void;
  onNavigateToTcpSim: () => void;
}

export const RoutingSimulatorPage: React.FC<RoutingSimulatorPageProps> = ({
  onApplyBottleneckToTcp,
  onNavigateToTcpSim,
}) => {
  const defaultPreset = PRESET_TOPOLOGIES[0];

  const [nodes, setNodes] = useState<TopologyNode[]>(defaultPreset.nodes);
  const [links, setLinks] = useState<TopologyLink[]>(defaultPreset.links);
  const [algorithm, setAlgorithm] = useState<RoutingAlgorithm>('DIJKSTRA');
  const [sourceNodeId, setSourceNodeId] = useState<string>(defaultPreset.recommendedSrcId);
  const [destNodeId, setDestNodeId] = useState<string>(defaultPreset.recommendedDstId);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  const [packetBurst, setPacketBurst] = useState<{
    packets: RoutedPacket[];
    metrics: RoutingMetrics;
  } | null>(null);

  const [isSimulatingPackets, setIsSimulatingPackets] = useState<boolean>(false);

  // Engine instance
  const engine = useMemo(() => {
    return new RoutingEngine(nodes, links);
  }, [nodes, links]);

  // Active path via Dijkstra
  const activePath = useMemo(() => {
    return engine.computeDijkstraShortestPath(sourceNodeId, destNodeId);
  }, [engine, sourceNodeId, destNodeId]);

  // Distance Vector Routing Tables
  const routingTables = useMemo(() => {
    return engine.computeDistanceVectorRouting();
  }, [engine]);

  // Selected entities
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedLink = links.find((l) => l.id === selectedLinkId) || null;

  // Node & Link Mutations
  const handleUpdateNodePos = (nodeId: string, x: number, y: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, x, y } : n))
    );
  };

  const handleUpdateNode = (updatedNode: TopologyNode) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === updatedNode.id ? { ...updatedNode } : n))
    );
  };

  const handleAddNode = (role: 'SENDER' | 'RECEIVER' | 'ROUTER') => {
    const id = `N${nodes.length + 1}`;
    const label = `${role === 'SENDER' ? 'Sender' : role === 'RECEIVER' ? 'Receiver' : 'Router'} ${id}`;
    const newNode: TopologyNode = {
      id,
      label,
      role,
      x: 250 + (nodes.length % 4) * 80,
      y: 180 + (nodes.length % 3) * 60,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
    setSelectedLinkId(null);
  };

  const handleConnectNodes = (srcId: string, dstId: string) => {
    const linkId = `L_${srcId}_${dstId}`;
    const newLink: TopologyLink = {
      id: linkId,
      sourceId: srcId,
      targetId: dstId,
      bandwidthMbps: 50,
      propDelayMs: 20,
      weight: 1,
      queueCapacityPackets: 20,
      active: true,
    };
    setLinks((prev) => {
      const exists = prev.some((l) => l.id === linkId);
      if (exists) return prev;
      return [...prev, newLink];
    });
    setSelectedLinkId(linkId);
  };

  const handleUpdateLinkProps = (linkId: string, props: Partial<TopologyLink>) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, ...props } : l))
    );
  };

  const handleToggleLinkStatus = (linkId: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, active: !l.active } : l))
    );
  };

  const handleRemoveSelected = () => {
    if (selectedNodeId) {
      setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
      setLinks((prev) => prev.filter((l) => l.sourceId !== selectedNodeId && l.targetId !== selectedNodeId));
      setSelectedNodeId(null);
    }
    if (selectedLinkId) {
      setLinks((prev) => prev.filter((l) => l.id !== selectedLinkId));
      setSelectedLinkId(null);
    }
  };

  const handleSelectPreset = (preset: TopologyPreset) => {
    setNodes(preset.nodes);
    setLinks(preset.links);
    setSourceNodeId(preset.recommendedSrcId);
    setDestNodeId(preset.recommendedDstId);
    setSelectedNodeId(null);
    setSelectedLinkId(null);
    setPacketBurst(null);
  };

  const handleSendPackets = () => {
    setIsSimulatingPackets(true);
    const burst = engine.simulatePacketBurst(sourceNodeId, destNodeId, 12);
    setPacketBurst(burst);

    setTimeout(() => {
      setIsSimulatingPackets(false);
    }, 2500);
  };

  const handleBridgeToTcpSim = () => {
    // Find bottleneck link along the active shortest path
    if (activePath.reachable && activePath.nodePath.length > 1) {
      let minBw = Infinity;
      let maxDelay = 0;
      let minQueue = Infinity;

      for (let i = 0; i < activePath.nodePath.length - 1; i++) {
        const u = activePath.nodePath[i];
        const v = activePath.nodePath[i + 1];
        const link = links.find(
          (l) =>
            (l.sourceId === u && l.targetId === v) ||
            (l.sourceId === v && l.targetId === u)
        );
        if (link) {
          minBw = Math.min(minBw, link.bandwidthMbps);
          maxDelay += link.propDelayMs;
          minQueue = Math.min(minQueue, link.queueCapacityPackets);
        }
      }

      onApplyBottleneckToTcp({
        linkCapacityMbps: minBw === Infinity ? 10 : minBw,
        propDelayMs: maxDelay > 0 ? maxDelay : 40,
        queueCapacityPackets: minQueue === Infinity ? 15 : minQueue,
      });

      onNavigateToTcpSim();
    }
  };

  const handleResetTopology = () => {
    handleSelectPreset(defaultPreset);
  };

  return (
    <div className="space-y-6">
      {/* Top Performance KPI Cards */}
      <RoutingKpiCards
        metrics={packetBurst ? packetBurst.metrics : null}
        activePath={activePath}
      />

      {/* Main Interactive Grid (2-Zone layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Control & Inspector Deck (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <RoutingControls
            algorithm={algorithm}
            onSelectAlgorithm={setAlgorithm}
            sourceNodeId={sourceNodeId}
            destNodeId={destNodeId}
            onSelectSource={setSourceNodeId}
            onSelectDest={setDestNodeId}
            nodes={nodes}
            onSelectPreset={handleSelectPreset}
            onSendPackets={handleSendPackets}
            onResetTopology={handleResetTopology}
            onBridgeToTcpSim={handleBridgeToTcpSim}
            isSimulating={isSimulatingPackets}
          />

          <NodeLinkInspector
            selectedNode={selectedNode}
            selectedLink={selectedLink}
            nodes={nodes}
            onUpdateNode={handleUpdateNode}
            onUpdateLinkProps={handleUpdateLinkProps}
            onToggleLinkStatus={handleToggleLinkStatus}
            onDeleteSelected={handleRemoveSelected}
          />
        </div>

        {/* Right Canvas Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <TopologyCanvas
            nodes={nodes}
            links={links}
            activePath={activePath}
            selectedNodeId={selectedNodeId}
            selectedLinkId={selectedLinkId}
            onSelectNode={(id) => {
              setSelectedNodeId(id);
              if (id) setSelectedLinkId(null);
            }}
            onSelectLink={(id) => {
              setSelectedLinkId(id);
              if (id) setSelectedNodeId(null);
            }}
            onUpdateNodePos={handleUpdateNodePos}
            onAddNode={handleAddNode}
            onConnectNodes={handleConnectNodes}
            onRemoveSelected={handleRemoveSelected}
            isSimulatingPackets={isSimulatingPackets}
          />

          <RoutingTableViewer
            routingTables={routingTables}
            nodes={nodes}
          />
        </div>
      </div>

      {/* Routing Event Log */}
      <RoutingEventLog events={engine.getEventLog()} />
    </div>
  );
};
