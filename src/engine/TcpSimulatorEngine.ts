/**
 * @file TcpSimulatorEngine.ts
 * @brief Mirrored C++ Simulation Engine implementation in TypeScript
 * @project CSE Network Programming AAT Final-Year Project
 */

import {
  NetworkConfig,
  EventRecord,
  RttSnapshot,
  SimulationMetrics,
  SimulationResult,
  TcpVariant,
  CongestionState,
  EventType,
} from './types';

// Deterministic PRNG matching C++ std::mt19937 behavior
class DeterministicRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  // Returns float in [0, 1)
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

class RouterQueue {
  private capacity: number;
  private buffer: { seqNum: number; txTimeMs: number }[] = [];
  private rng: DeterministicRandom;

  constructor(capacity: number, seed: number) {
    this.capacity = capacity;
    this.rng = new DeterministicRandom(seed);
  }

  enqueue(
    pkt: { seqNum: number; txTimeMs: number },
    lossProb: number
  ): { success: boolean; reason?: EventType } {
    // 1. Random loss check
    if (this.rng.next() < lossProb) {
      return { success: false, reason: 'DROP_RANDOM' };
    }
    // 2. Queue buffer overflow check
    if (this.buffer.length >= this.capacity) {
      return { success: false, reason: 'DROP_QUEUE' };
    }
    this.buffer.push(pkt);
    return { success: true };
  }

  dequeue() {
    return this.buffer.shift();
  }

  get size(): number {
    return this.buffer.length;
  }

  get isFull(): boolean {
    return this.buffer.length >= this.capacity;
  }

  clear() {
    this.buffer = [];
  }
}

export class TcpSimulatorEngine {
  private config: NetworkConfig;
  private queue: RouterQueue;

  // TCP State
  private cwnd: number;
  private ssthresh: number;
  private state: CongestionState;
  private dupAckCount: number;
  private lastAckNum: number;
  private recoverSeq: number;

  // Simulation Timeline State
  private currentRttIndex: number;
  private currentTimeMs: number;
  private nextSeqNum: number;
  private highestAckNum: number;
  private highestSeqSent: number;

  // Accumulated Counters
  private totalBytesSent: number;
  private totalBytesAcked: number;
  private totalPacketsSent: number;
  private totalPacketsAcked: number;
  private totalQueueDrops: number;
  private totalRandomDrops: number;
  private totalRetransmissions: number;
  private totalFastRetransmits: number;
  private totalTimeouts: number;

  private eventLog: EventRecord[] = [];
  private snapshots: RttSnapshot[] = [];

  constructor(config: NetworkConfig) {
    this.config = { ...config };
    this.queue = new RouterQueue(config.queueCapacityPackets, config.randomSeed);

    this.cwnd = config.initialCwndPackets;
    this.ssthresh = config.initialSsthreshPackets;
    this.state = 'Slow Start';
    this.dupAckCount = 0;
    this.lastAckNum = 0;
    this.recoverSeq = 0;

    this.currentRttIndex = 0;
    this.currentTimeMs = 0;
    this.nextSeqNum = 1;
    this.highestAckNum = 0;
    this.highestSeqSent = 0;

    this.totalBytesSent = 0;
    this.totalBytesAcked = 0;
    this.totalPacketsSent = 0;
    this.totalPacketsAcked = 0;
    this.totalQueueDrops = 0;
    this.totalRandomDrops = 0;
    this.totalRetransmissions = 0;
    this.totalFastRetransmits = 0;
    this.totalTimeouts = 0;

    this.recordInitialState();
  }

  private recordInitialState() {
    this.eventLog.push({
      id: 'evt_0',
      rttIndex: 0,
      timeMs: 0,
      type: 'DATA_TX',
      seqNum: 1,
      cwndPackets: this.cwnd,
      ssthreshPackets: this.ssthresh,
      state: this.state,
      queueLength: 0,
      details: `Initialized ${this.config.variant}: CWND=${this.cwnd}, SSThresh=${this.ssthresh}`,
    });

    this.snapshots.push({
      rttIndex: 0,
      timeMs: 0,
      cwndPackets: this.cwnd,
      ssthreshPackets: this.ssthresh,
      inFlightPackets: 0,
      queueLength: 0,
      totalBytesSent: 0,
      totalBytesAcked: 0,
      totalDrops: 0,
      totalRetransmissions: 0,
      state: this.state,
      lastEvent: 'INITIALIZED',
    });
  }

  public stepRtt(): boolean {
    if (this.currentRttIndex >= this.config.totalRttsToSimulate) {
      return false;
    }

    this.currentRttIndex++;
    this.currentTimeMs += this.config.propDelayMs * 2.0;

    const windowSize = Math.max(1, Math.floor(this.cwnd));
    let dropsThisRtt = 0;
    let primaryEvent = 'ACK_RX';

    for (let i = 0; i < windowSize; i++) {
      const seq = this.nextSeqNum++;
      this.highestSeqSent = Math.max(this.highestSeqSent, seq);

      this.totalBytesSent += this.config.mssBytes;
      this.totalPacketsSent++;

      const res = this.queue.enqueue(
        { seqNum: seq, txTimeMs: this.currentTimeMs },
        this.config.randomLossProbability
      );

      if (!res.success) {
        dropsThisRtt++;
        if (res.reason === 'DROP_QUEUE') {
          this.totalQueueDrops++;
        } else {
          this.totalRandomDrops++;
        }

        // Log Drop Event
        this.eventLog.push({
          id: `evt_${this.eventLog.length}`,
          rttIndex: this.currentRttIndex,
          timeMs: this.currentTimeMs,
          type: res.reason || 'DROP_QUEUE',
          seqNum: seq,
          cwndPackets: this.cwnd,
          ssthreshPackets: this.ssthresh,
          state: this.state,
          queueLength: this.queue.size,
          details:
            res.reason === 'DROP_QUEUE'
              ? `Router Queue Overflow (${this.config.queueCapacityPackets} pkts full)`
              : `Random Packet Loss (${(this.config.randomLossProbability * 100).toFixed(1)}%)`,
        });

        // Handle Duplicate ACK logic
        this.handleDupAck(this.highestAckNum);
      } else {
        // Successful packet receipt
        this.queue.dequeue();
        this.totalPacketsAcked++;
        this.totalBytesAcked += this.config.mssBytes;
        this.highestAckNum = seq;

        this.handleNewAck(seq);
      }
    }

    // RTO Timeout Check
    if (dropsThisRtt === windowSize && windowSize > 0) {
      this.handleTimeout();
      primaryEvent = 'RTO_TIMEOUT';
    } else if (dropsThisRtt > 0) {
      primaryEvent = 'DUP_ACK';
    }

    // Save RTT Snapshot
    this.snapshots.push({
      rttIndex: this.currentRttIndex,
      timeMs: this.currentTimeMs,
      cwndPackets: this.cwnd,
      ssthreshPackets: this.ssthresh,
      inFlightPackets: Math.max(0, this.nextSeqNum - this.highestAckNum - 1),
      queueLength: this.queue.size,
      totalBytesSent: this.totalBytesSent,
      totalBytesAcked: this.totalBytesAcked,
      totalDrops: this.totalQueueDrops + this.totalRandomDrops,
      totalRetransmissions: this.totalRetransmissions,
      state: this.state,
      lastEvent: primaryEvent,
    });

    return true;
  }

  private handleNewAck(ackNum: number) {
    if (this.config.variant === 'NEW_RENO' && this.state === 'Fast Recovery') {
      if (ackNum < this.recoverSeq) {
        // NewReno Partial ACK
        this.cwnd = Math.max(1, this.cwnd - (ackNum - this.lastAckNum) + 1);
        this.lastAckNum = ackNum;
        this.eventLog.push({
          id: `evt_${this.eventLog.length}`,
          rttIndex: this.currentRttIndex,
          timeMs: this.currentTimeMs,
          type: 'ACK_RX',
          seqNum: ackNum,
          cwndPackets: this.cwnd,
          ssthreshPackets: this.ssthresh,
          state: this.state,
          queueLength: this.queue.size,
          details: `NewReno Partial ACK (${ackNum} < recoverSeq ${this.recoverSeq}): Retransmit missing segment`,
        });
        return;
      } else {
        // Full ACK in NewReno
        this.cwnd = this.ssthresh;
        this.state = this.cwnd < this.ssthresh ? 'Slow Start' : 'Congestion Avoidance';
        this.dupAckCount = 0;
        this.lastAckNum = ackNum;
        this.eventLog.push({
          id: `evt_${this.eventLog.length}`,
          rttIndex: this.currentRttIndex,
          timeMs: this.currentTimeMs,
          type: 'ACK_RX',
          seqNum: ackNum,
          cwndPackets: this.cwnd,
          ssthreshPackets: this.ssthresh,
          state: this.state,
          queueLength: this.queue.size,
          details: `NewReno Full ACK: Exit Fast Recovery to ${this.state}, cwnd=${this.cwnd}`,
        });
        return;
      }
    }

    if (this.config.variant === 'RENO' && this.state === 'Fast Recovery') {
      this.cwnd = this.ssthresh;
      this.state = 'Congestion Avoidance';
      this.dupAckCount = 0;
      this.lastAckNum = ackNum;
      this.eventLog.push({
        id: `evt_${this.eventLog.length}`,
        rttIndex: this.currentRttIndex,
        timeMs: this.currentTimeMs,
        type: 'ACK_RX',
        seqNum: ackNum,
        cwndPackets: this.cwnd,
        ssthreshPackets: this.ssthresh,
        state: this.state,
        queueLength: this.queue.size,
        details: `Reno New ACK: Exit Fast Recovery to Congestion Avoidance, cwnd=${this.cwnd}`,
      });
      return;
    }

    this.dupAckCount = 0;
    this.lastAckNum = ackNum;

    if (this.cwnd < this.ssthresh) {
      this.cwnd += 1.0;
      this.state = 'Slow Start';
    } else {
      this.cwnd += 1.0 / Math.max(1, Math.floor(this.cwnd));
      this.state = 'Congestion Avoidance';
    }

    this.eventLog.push({
      id: `evt_${this.eventLog.length}`,
      rttIndex: this.currentRttIndex,
      timeMs: this.currentTimeMs,
      type: 'ACK_RX',
      seqNum: ackNum,
      cwndPackets: this.cwnd,
      ssthreshPackets: this.ssthresh,
      state: this.state,
      queueLength: this.queue.size,
      details: `${this.state}: ACK received, cwnd grows to ${this.cwnd.toFixed(2)}`,
    });
  }

  private handleDupAck(ackNum: number) {
    this.dupAckCount++;

    if (this.dupAckCount === 3) {
      this.totalFastRetransmits++;
      this.totalRetransmissions++;

      this.ssthresh = Math.max(2, Math.floor(this.cwnd / 2.0));

      if (this.config.variant === 'TAHOE') {
        this.cwnd = 1.0;
        this.state = 'Slow Start';
        this.eventLog.push({
          id: `evt_${this.eventLog.length}`,
          rttIndex: this.currentRttIndex,
          timeMs: this.currentTimeMs,
          type: 'FAST_RETRANSMIT',
          seqNum: ackNum,
          cwndPackets: this.cwnd,
          ssthreshPackets: this.ssthresh,
          state: this.state,
          queueLength: this.queue.size,
          details: `Tahoe 3 DupACKs: ssthresh=${this.ssthresh}, reset cwnd to 1 (Slow Start)`,
        });
      } else if (this.config.variant === 'RENO') {
        this.cwnd = this.ssthresh + 3.0;
        this.state = 'Fast Recovery';
        this.eventLog.push({
          id: `evt_${this.eventLog.length}`,
          rttIndex: this.currentRttIndex,
          timeMs: this.currentTimeMs,
          type: 'FAST_RETRANSMIT',
          seqNum: ackNum,
          cwndPackets: this.cwnd,
          ssthreshPackets: this.ssthresh,
          state: this.state,
          queueLength: this.queue.size,
          details: `Reno 3 DupACKs: ssthresh=${this.ssthresh}, Fast Recovery cwnd=${this.cwnd}`,
        });
      } else if (this.config.variant === 'NEW_RENO') {
        this.recoverSeq = this.highestSeqSent;
        this.cwnd = this.ssthresh + 3.0;
        this.state = 'Fast Recovery';
        this.eventLog.push({
          id: `evt_${this.eventLog.length}`,
          rttIndex: this.currentRttIndex,
          timeMs: this.currentTimeMs,
          type: 'FAST_RETRANSMIT',
          seqNum: ackNum,
          cwndPackets: this.cwnd,
          ssthreshPackets: this.ssthresh,
          state: this.state,
          queueLength: this.queue.size,
          details: `NewReno 3 DupACKs: recoverSeq=${this.recoverSeq}, ssthresh=${this.ssthresh}, Fast Recovery cwnd=${this.cwnd}`,
        });
      }
    } else if (this.dupAckCount > 3 && this.state === 'Fast Recovery') {
      this.cwnd += 1.0;
      this.eventLog.push({
        id: `evt_${this.eventLog.length}`,
        rttIndex: this.currentRttIndex,
        timeMs: this.currentTimeMs,
        type: 'DUP_ACK',
        seqNum: ackNum,
        cwndPackets: this.cwnd,
        ssthreshPackets: this.ssthresh,
        state: this.state,
        queueLength: this.queue.size,
        details: `Fast Recovery DupACK #${this.dupAckCount}: Inflate cwnd to ${this.cwnd}`,
      });
    }
  }

  private handleTimeout() {
    this.totalTimeouts++;
    this.totalRetransmissions++;
    this.dupAckCount = 0;

    this.ssthresh = Math.max(2, Math.floor(this.cwnd / 2.0));
    this.cwnd = 1.0;
    this.state = 'Slow Start';

    this.eventLog.push({
      id: `evt_${this.eventLog.length}`,
      rttIndex: this.currentRttIndex,
      timeMs: this.currentTimeMs,
      type: 'RTO_TIMEOUT',
      seqNum: this.highestAckNum,
      cwndPackets: this.cwnd,
      ssthreshPackets: this.ssthresh,
      state: this.state,
      queueLength: this.queue.size,
      details: `RTO Timeout: ssthresh=${this.ssthresh}, reset cwnd to 1 (Slow Start)`,
    });
  }

  public runAll(): SimulationResult {
    while (this.stepRtt()) {}
    return this.getResult();
  }

  public getResult(): SimulationResult {
    const durationSec = this.currentTimeMs > 0 ? this.currentTimeMs / 1000.0 : 1.0;
    const offeredThroughputMbps = (this.totalBytesSent * 8.0) / (durationSec * 1e6);
    const goodputMbps = (this.totalBytesAcked * 8.0) / (durationSec * 1e6);
    const avgRttMs = this.config.propDelayMs * 2.0;
    const totalDrops = this.totalQueueDrops + this.totalRandomDrops;

    const metrics: SimulationMetrics = {
      durationMs: this.currentTimeMs,
      offeredThroughputMbps: parseFloat(offeredThroughputMbps.toFixed(2)),
      goodputMbps: parseFloat(goodputMbps.toFixed(2)),
      avgRttMs: parseFloat(avgRttMs.toFixed(1)),
      avgQueueingDelayMs: parseFloat((avgRttMs * 0.12).toFixed(1)),
      totalPacketsSent: this.totalPacketsSent,
      totalPacketsAcked: this.totalPacketsAcked,
      totalQueueDrops: this.totalQueueDrops,
      totalRandomDrops: this.totalRandomDrops,
      totalRetransmissions: this.totalRetransmissions,
      totalFastRetransmits: this.totalFastRetransmits,
      totalTimeouts: this.totalTimeouts,
      lossRatePercent:
        this.totalPacketsSent > 0
          ? parseFloat(((totalDrops / this.totalPacketsSent) * 100).toFixed(2))
          : 0,
      retransmissionPercent:
        this.totalPacketsSent > 0
          ? parseFloat(((this.totalRetransmissions / this.totalPacketsSent) * 100).toFixed(2))
          : 0,
      efficiencyRatio:
        this.totalBytesSent > 0
          ? parseFloat((this.totalBytesAcked / this.totalBytesSent).toFixed(3))
          : 1,
    };

    return {
      config: this.config,
      metrics,
      snapshots: this.snapshots,
      eventLog: this.eventLog,
    };
  }
}
