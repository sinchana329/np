/**
 * @file routingTypes.ts
 * @brief TypeScript Interfaces for Network Topology and Routing Engine
 * @project CSE Network Programming AAT Final-Year Project Expansion
 */

export type NodeRole = 'SENDER' | 'RECEIVER' | 'ROUTER';

export type RoutingAlgorithm = 'DIJKSTRA' | 'DISTANCE_VECTOR';

export interface TopologyNode {
  id: string;
  label: string;
  role: NodeRole;
  x: number;
  y: number;
}

export interface TopologyLink {
  id: string;
  sourceId: string;
  targetId: string;
  bandwidthMbps: number;
  propDelayMs: number;
  weight: number;          // Routing cost metric
  queueCapacityPackets: number;
  active: boolean;         // true = active link, false = failed link
}

export interface PathResult {
  reachable: boolean;
  nodePath: string[];
  totalWeight: number;
  totalDelayMs: number;
  minBandwidthMbps: number;
  algorithm: string;
}

export interface RoutingTableEntry {
  destNodeId: string;
  nextHopId: string;
  cost: number;
}

export interface RoutedPacket {
  id: string;
  packetNum: number;
  srcId: string;
  dstId: string;
  currentNodeId: string;
  nextHopId: string;
  hopIndex: number;
  path: string[];
  creationTimeMs: number;
  deliveryTimeMs?: number;
  status: 'IN_FLIGHT' | 'DELIVERED' | 'DROPPED_QUEUE' | 'DROPPED_LINK_FAILURE';
  dropReason?: string;
  progressPct: number; // 0 to 100 along current edge
}

export interface RoutingMetrics {
  totalPacketsGenerated: number;
  totalPacketsDelivered: number;
  totalPacketsDropped: number;
  deliveryRatioPercent: number;
  avgEndToEndDelayMs: number;
  estimatedThroughputMbps: number;
  totalRouteChanges: number;
  durationMs: number;
}

export interface RoutingEventRecord {
  id: string;
  timestampMs: number;
  eventType: 'LINK_FAILURE' | 'LINK_RESTORE' | 'ROUTE_RECALC' | 'PACKET_TX' | 'PACKET_DELIVERED' | 'PACKET_DROP';
  details: string;
}

export interface TopologyPreset {
  id: string;
  name: string;
  description: string;
  nodes: TopologyNode[];
  links: TopologyLink[];
  recommendedSrcId: string;
  recommendedDstId: string;
}
