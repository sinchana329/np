/**
 * @file presetTopologies.ts
 * @brief Pre-configured Demo Network Topologies
 * @project CSE Network Programming AAT Final-Year Project Expansion
 */

import { TopologyPreset } from './routingTypes';

export const PRESET_TOPOLOGIES: TopologyPreset[] = [
  {
    id: 'diamond_bottleneck',
    name: '1. Diamond Bottleneck Topology',
    description: 'Sender connects to Receiver via two redundant paths through R1 and R2.',
    recommendedSrcId: 'N1',
    recommendedDstId: 'N4',
    nodes: [
      { id: 'N1', label: 'Sender A', role: 'SENDER', x: 120, y: 220 },
      { id: 'N2', label: 'Router R1 (Fast)', role: 'ROUTER', x: 380, y: 110 },
      { id: 'N3', label: 'Router R2 (Backup)', role: 'ROUTER', x: 380, y: 330 },
      { id: 'N4', label: 'Receiver B', role: 'RECEIVER', x: 640, y: 220 },
    ],
    links: [
      { id: 'L1_2', sourceId: 'N1', targetId: 'N2', bandwidthMbps: 100, propDelayMs: 10, weight: 1, queueCapacityPackets: 20, active: true },
      { id: 'L2_4', sourceId: 'N2', targetId: 'N4', bandwidthMbps: 100, propDelayMs: 15, weight: 1, queueCapacityPackets: 20, active: true },
      { id: 'L1_3', sourceId: 'N1', targetId: 'N3', bandwidthMbps: 20, propDelayMs: 40, weight: 5, queueCapacityPackets: 10, active: true },
      { id: 'L3_4', sourceId: 'N3', targetId: 'N4', bandwidthMbps: 20, propDelayMs: 40, weight: 2, queueCapacityPackets: 10, active: true },
    ],
  },
  {
    id: 'mesh_network',
    name: '2. 5-Node Redundant Mesh',
    description: 'High-availability mesh with multiple redundant paths and variable link costs.',
    recommendedSrcId: 'M1',
    recommendedDstId: 'M5',
    nodes: [
      { id: 'M1', label: 'Host S1', role: 'SENDER', x: 100, y: 220 },
      { id: 'M2', label: 'Core R1', role: 'ROUTER', x: 300, y: 100 },
      { id: 'M3', label: 'Core R2', role: 'ROUTER', x: 300, y: 340 },
      { id: 'M4', label: 'Dist R3', role: 'ROUTER', x: 500, y: 220 },
      { id: 'M5', label: 'Server D1', role: 'RECEIVER', x: 700, y: 220 },
    ],
    links: [
      { id: 'LM1_2', sourceId: 'M1', targetId: 'M2', bandwidthMbps: 50, propDelayMs: 15, weight: 2, queueCapacityPackets: 25, active: true },
      { id: 'LM1_3', sourceId: 'M1', targetId: 'M3', bandwidthMbps: 50, propDelayMs: 20, weight: 3, queueCapacityPackets: 25, active: true },
      { id: 'LM2_4', sourceId: 'M2', targetId: 'M4', bandwidthMbps: 100, propDelayMs: 10, weight: 1, queueCapacityPackets: 30, active: true },
      { id: 'LM3_4', sourceId: 'M3', targetId: 'M4', bandwidthMbps: 40, propDelayMs: 25, weight: 4, queueCapacityPackets: 15, active: true },
      { id: 'LM2_3', sourceId: 'M2', targetId: 'M3', bandwidthMbps: 100, propDelayMs: 5, weight: 1, queueCapacityPackets: 40, active: true },
      { id: 'LM4_5', sourceId: 'M4', targetId: 'M5', bandwidthMbps: 100, propDelayMs: 10, weight: 1, queueCapacityPackets: 30, active: true },
    ],
  },
  {
    id: 'ring_topology',
    name: '3. Ring Network with Failover',
    description: 'Ring topology demonstrating failover direction shift when an active link breaks.',
    recommendedSrcId: 'R1',
    recommendedDstId: 'R4',
    nodes: [
      { id: 'R1', label: 'Node A', role: 'SENDER', x: 200, y: 120 },
      { id: 'R2', label: 'Node B', role: 'ROUTER', x: 500, y: 120 },
      { id: 'R3', label: 'Node C', role: 'ROUTER', x: 500, y: 320 },
      { id: 'R4', label: 'Node D', role: 'RECEIVER', x: 200, y: 320 },
    ],
    links: [
      { id: 'LR1_2', sourceId: 'R1', targetId: 'R2', bandwidthMbps: 50, propDelayMs: 10, weight: 1, queueCapacityPackets: 20, active: true },
      { id: 'LR2_3', sourceId: 'R2', targetId: 'R3', bandwidthMbps: 50, propDelayMs: 10, weight: 1, queueCapacityPackets: 20, active: true },
      { id: 'LR3_4', sourceId: 'R3', targetId: 'R4', bandwidthMbps: 50, propDelayMs: 10, weight: 1, queueCapacityPackets: 20, active: true },
      { id: 'LR4_1', sourceId: 'R4', targetId: 'R1', bandwidthMbps: 50, propDelayMs: 10, weight: 1, queueCapacityPackets: 20, active: true },
    ],
  },
];
