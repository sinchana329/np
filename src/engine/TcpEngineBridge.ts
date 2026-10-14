/**
 * @file TcpEngineBridge.ts
 * @brief High-level orchestration, preset scenarios, and CSV exporter
 * @project CSE Network Programming AAT Final-Year Project
 */

import { NetworkConfig, PresetScenario, SimulationResult, TcpVariant } from './types';
import { TcpSimulatorEngine } from './TcpSimulatorEngine';

export const DEFAULT_CONFIG: NetworkConfig = {
  variant: 'RENO',
  linkCapacityMbps: 10.0,
  propDelayMs: 40.0,
  mssBytes: 1460,
  initialCwndPackets: 1,
  initialSsthreshPackets: 32,
  queueCapacityPackets: 15,
  randomLossProbability: 0.01,
  totalRttsToSimulate: 60,
  randomSeed: 42,
};

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'baseline',
    name: '1. Baseline Fiber Link',
    description: 'Low loss, high capacity fiber link with balanced queue size.',
    badge: 'Standard',
    config: {
      ...DEFAULT_CONFIG,
      linkCapacityMbps: 100.0,
      propDelayMs: 20.0,
      queueCapacityPackets: 30,
      randomLossProbability: 0.001,
      totalRttsToSimulate: 60,
    },
  },
  {
    id: 'wireless_high_loss',
    name: '2. High Loss Wireless / 5G',
    description: 'Independent random packet loss due to wireless interference.',
    badge: 'High Loss',
    config: {
      ...DEFAULT_CONFIG,
      linkCapacityMbps: 20.0,
      propDelayMs: 35.0,
      queueCapacityPackets: 20,
      randomLossProbability: 0.06, // 6% loss
      totalRttsToSimulate: 60,
    },
  },
  {
    id: 'bufferbloat',
    name: '3. Bufferbloat Queue Bottleneck',
    description: 'Overly large router queue creating heavy queueing delay and burst drops.',
    badge: 'Bufferbloat',
    config: {
      ...DEFAULT_CONFIG,
      linkCapacityMbps: 5.0,
      propDelayMs: 50.0,
      queueCapacityPackets: 60, // Large queue
      randomLossProbability: 0.005,
      totalRttsToSimulate: 80,
    },
  },
  {
    id: 'long_rtt_satellite',
    name: '4. High RTT Satellite Link',
    description: 'Geostationary satellite link with 250ms propagation delay.',
    badge: 'High Latency',
    config: {
      ...DEFAULT_CONFIG,
      linkCapacityMbps: 15.0,
      propDelayMs: 250.0,
      queueCapacityPackets: 25,
      randomLossProbability: 0.02,
      totalRttsToSimulate: 50,
    },
  },
  {
    id: 'shallow_buffer',
    name: '5. Constrained Switch Buffer',
    description: 'Tiny queue buffer causing immediate tail-drop congestion.',
    badge: 'Queue Drop',
    config: {
      ...DEFAULT_CONFIG,
      linkCapacityMbps: 10.0,
      propDelayMs: 30.0,
      queueCapacityPackets: 4, // Very small queue
      randomLossProbability: 0.0,
      totalRttsToSimulate: 60,
    },
  },
];

export class TcpEngineBridge {
  public static runSimulation(config: NetworkConfig): SimulationResult {
    const engine = new TcpSimulatorEngine(config);
    return engine.runAll();
  }

  public static runComparison(
    baseConfig: Omit<NetworkConfig, 'variant'>
  ): { TAHOE: SimulationResult; RENO: SimulationResult; NEW_RENO: SimulationResult } {
    const variants: TcpVariant[] = ['TAHOE', 'RENO', 'NEW_RENO'];
    const results: any = {};

    variants.forEach((v) => {
      const cfg: NetworkConfig = { ...baseConfig, variant: v };
      const engine = new TcpSimulatorEngine(cfg);
      results[v] = engine.runAll();
    });

    return results;
  }

  public static generateCsvData(result: SimulationResult): string {
    const lines: string[] = [];
    lines.push(`# TCP Congestion Control Simulation Raw Data Export`);
    lines.push(`# Algorithm: ${result.config.variant}`);
    lines.push(`# Bandwidth: ${result.config.linkCapacityMbps} Mbps | RTT: ${result.config.propDelayMs * 2} ms | Queue: ${result.config.queueCapacityPackets} pkts | Seed: ${result.config.randomSeed}`);
    lines.push(``);
    lines.push(`RTT_Index,Time_ms,CWND_Packets,SSThresh_Packets,InFlight_Packets,Queue_Length,Total_Sent_Bytes,Total_Acked_Bytes,Total_Drops,Total_Retransmissions,State,Last_Event`);

    result.snapshots.forEach((s) => {
      lines.push(
        `${s.rttIndex},${s.timeMs.toFixed(1)},${s.cwndPackets.toFixed(2)},${s.ssthreshPackets.toFixed(2)},${s.inFlightPackets},${s.queueLength},${s.totalBytesSent},${s.totalBytesAcked},${s.totalDrops},${s.totalRetransmissions},"${s.state}","${s.lastEvent}"`
      );
    });

    lines.push(``);
    lines.push(`# SUMMARY METRICS`);
    lines.push(`Offered_Throughput_Mbps,Goodput_Mbps,Loss_Rate_Percent,Retransmissions_Percent,Efficiency_Ratio`);
    lines.push(
      `${result.metrics.offeredThroughputMbps},${result.metrics.goodputMbps},${result.metrics.lossRatePercent}%,${result.metrics.retransmissionPercent}%,${(result.metrics.efficiencyRatio * 100).toFixed(1)}%`
    );

    return lines.join('\n');
  }

  public static downloadCsv(result: SimulationResult) {
    const csvContent = this.generateCsvData(result);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tcp_${result.config.variant.toLowerCase()}_simulation_seed${result.config.randomSeed}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
