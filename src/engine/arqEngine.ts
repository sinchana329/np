/**
 * @file arqEngine.ts
 * @brief Reliable Transport Protocol Lab Engine (Stop-and-Wait, Go-Back-N, Selective Repeat)
 * @project NetScope Platform - CSE Network Programming AAT Final-Year Project
 */

export type ArqProtocol = 'STOP_AND_WAIT' | 'GO_BACK_N' | 'SELECTIVE_REPEAT';

export interface ArqConfig {
  protocol: ArqProtocol;
  windowSize: number;
  totalPacketsToSend: number;
  lossProbability: number;
  propDelayMs: number;
  timeoutMs: number;
  randomSeed: number;
}

export interface ArqFrame {
  seqNum: number;
  status: 'UNSENT' | 'IN_FLIGHT' | 'ACKED' | 'NACKED' | 'TIMED_OUT';
  txCount: number;
}

export interface ArqSnapshot {
  stepIndex: number;
  timeMs: number;
  sendBase: number;
  nextSeqNum: number;
  frames: ArqFrame[];
  totalTransmissions: number;
  totalRetransmissions: number;
  totalDelivered: number;
  lastEvent: string;
}

export interface ArqMetrics {
  totalTransmissions: number;
  totalRetransmissions: number;
  totalDelivered: number;
  durationMs: number;
  throughputMbps: number;
  efficiencyPercent: number;
}

export class ArqEngine {
  private config: ArqConfig;
  private sendBase: number = 0;
  private nextSeqNum: number = 0;
  private totalTransmissions: number = 0;
  private totalRetransmissions: number = 0;
  private totalDelivered: number = 0;
  private frames: ArqFrame[] = [];
  private snapshots: ArqSnapshot[] = [];

  constructor(config: ArqConfig) {
    this.config = { ...config };
    this.reset();
  }

  public reset() {
    this.sendBase = 0;
    this.nextSeqNum = 0;
    this.totalTransmissions = 0;
    this.totalRetransmissions = 0;
    this.totalDelivered = 0;
    this.frames = Array.from({ length: this.config.totalPacketsToSend }, (_, idx) => ({
      seqNum: idx,
      status: 'UNSENT',
      txCount: 0,
    }));
    this.snapshots = [];

    this.recordSnapshot('INITIALIZED');
  }

  public step(): boolean {
    if (this.sendBase >= this.config.totalPacketsToSend) {
      return false; // Complete
    }

    const maxWindow = this.config.protocol === 'STOP_AND_WAIT' ? 1 : this.config.windowSize;

    // Send unsent frames within window
    while (
      this.nextSeqNum < this.config.totalPacketsToSend &&
      this.nextSeqNum < this.sendBase + maxWindow
    ) {
      this.frames[this.nextSeqNum].status = 'IN_FLIGHT';
      this.frames[this.nextSeqNum].txCount++;
      this.totalTransmissions++;
      this.nextSeqNum++;
    }

    // Simulate ACK delivery vs Loss
    if (this.sendBase < this.config.totalPacketsToSend) {
      const isLost = Math.random() < this.config.lossProbability;

      if (!isLost) {
        this.frames[this.sendBase].status = 'ACKED';
        this.sendBase++;
        this.totalDelivered++;
        this.recordSnapshot('ACK_RECEIVED');
      } else {
        this.frames[this.sendBase].status = 'TIMED_OUT';
        this.totalRetransmissions++;

        if (this.config.protocol === 'GO_BACK_N') {
          // Go-Back-N resets nextSeqNum back to sendBase to retransmit window
          this.nextSeqNum = this.sendBase;
          this.recordSnapshot('TIMEOUT_GBN_RESEND_WINDOW');
        } else if (this.config.protocol === 'SELECTIVE_REPEAT') {
          // Selective Repeat retransmits only the failed frame
          this.frames[this.sendBase].status = 'IN_FLIGHT';
          this.recordSnapshot('TIMEOUT_SR_RESEND_SINGLE');
        } else {
          // Stop-and-Wait
          this.recordSnapshot('TIMEOUT_STOP_AND_WAIT');
        }
      }
    }

    return this.sendBase < this.config.totalPacketsToSend;
  }

  private recordSnapshot(lastEvent: string) {
    this.snapshots.push({
      stepIndex: this.snapshots.length,
      timeMs: this.snapshots.length * this.config.propDelayMs * 2,
      sendBase: this.sendBase,
      nextSeqNum: this.nextSeqNum,
      frames: this.frames.map((f) => ({ ...f })),
      totalTransmissions: this.totalTransmissions,
      totalRetransmissions: this.totalRetransmissions,
      totalDelivered: this.totalDelivered,
      lastEvent,
    });
  }

  public runAll(): ArqSnapshot[] {
    while (this.step()) {}
    return this.snapshots;
  }

  public getSnapshots(): ArqSnapshot[] {
    return this.snapshots;
  }

  public getMetrics(): ArqMetrics {
    const durationMs = Math.max(10, this.snapshots.length * this.config.propDelayMs * 2);
    const durationSec = durationMs / 1000.0;
    const throughputMbps = (this.totalDelivered * 1024 * 8) / (durationSec * 1e6);
    const efficiencyPercent =
      this.totalTransmissions > 0
        ? (this.totalDelivered / this.totalTransmissions) * 100
        : 100;

    return {
      totalTransmissions: this.totalTransmissions,
      totalRetransmissions: this.totalRetransmissions,
      totalDelivered: this.totalDelivered,
      durationMs,
      throughputMbps: parseFloat(throughputMbps.toFixed(2)),
      efficiencyPercent: parseFloat(efficiencyPercent.toFixed(1)),
    };
  }
}
