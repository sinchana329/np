/**
 * @file types.ts
 * @brief TypeScript Type Definitions for TCP Simulator
 * @project CSE Network Programming AAT Final-Year Project
 */

export type TcpVariant = 'TAHOE' | 'RENO' | 'NEW_RENO';

export type CongestionState = 'Slow Start' | 'Congestion Avoidance' | 'Fast Recovery';

export type EventType = 
  | 'DATA_TX' 
  | 'ACK_RX' 
  | 'DUP_ACK' 
  | 'DROP_QUEUE' 
  | 'DROP_RANDOM' 
  | 'FAST_RETRANSMIT' 
  | 'RTO_TIMEOUT';

export interface NetworkConfig {
  variant: TcpVariant;
  linkCapacityMbps: number;    // Bandwidth in Mbps
  propDelayMs: number;          // One-way propagation delay (ms)
  mssBytes: number;             // Maximum Segment Size (Bytes)
  initialCwndPackets: number;   // Initial CWND in packets
  initialSsthreshPackets: number;// Initial SSThresh in packets
  queueCapacityPackets: number; // Bottleneck buffer capacity
  randomLossProbability: number;// Packet drop rate (0.0 - 0.5)
  totalRttsToSimulate: number;  // Simulation duration in RTTs
  randomSeed: number;           // Seed for reproducibility
}

export interface EventRecord {
  id: string;
  rttIndex: number;
  timeMs: number;
  type: EventType;
  seqNum: number;
  cwndPackets: number;
  ssthreshPackets: number;
  state: CongestionState;
  queueLength: number;
  details: string;
}

export interface RttSnapshot {
  rttIndex: number;
  timeMs: number;
  cwndPackets: number;
  ssthreshPackets: number;
  inFlightPackets: number;
  queueLength: number;
  totalBytesSent: number;
  totalBytesAcked: number;
  totalDrops: number;
  totalRetransmissions: number;
  state: CongestionState;
  lastEvent: string;
}

export interface SimulationMetrics {
  durationMs: number;
  offeredThroughputMbps: number;
  goodputMbps: number;
  avgRttMs: number;
  avgQueueingDelayMs: number;
  totalPacketsSent: number;
  totalPacketsAcked: number;
  totalQueueDrops: number;
  totalRandomDrops: number;
  totalRetransmissions: number;
  totalFastRetransmits: number;
  totalTimeouts: number;
  lossRatePercent: number;
  retransmissionPercent: number;
  efficiencyRatio: number; // Goodput / Offered
}

export interface SimulationResult {
  config: NetworkConfig;
  metrics: SimulationMetrics;
  snapshots: RttSnapshot[];
  eventLog: EventRecord[];
}

export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  badge: string;
  config: NetworkConfig;
}
