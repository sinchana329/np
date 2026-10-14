/**
 * @file tcp_simulator.cpp
 * @brief Main discrete-event TCPSimulator loop and metric processing
 * @project CSE Network Programming AAT Final-Year Project
 */

#include "tcp_simulator.hpp"

namespace tcpsim {

TCPSimulator::TCPSimulator(const NetworkConfig& cfg)
    : config(cfg), queue(cfg.queueCapacityPackets, cfg.randomSeed),
      currentRttIndex(0), currentTimeMs(0.0), nextSeqNum(1),
      highestAckNum(0), highestSeqSent(0), totalBytesSent(0),
      totalBytesAcked(0), totalPacketsSent(0), totalPacketsAcked(0),
      totalQueueDrops(0), totalRandomDrops(0), totalRetransmissions(0),
      totalFastRetransmits(0), totalTimeouts(0) {
    initializeAlgorithm();
    reset();
}

void TCPSimulator::reset() {
    currentRttIndex = 0;
    currentTimeMs = 0.0;
    nextSeqNum = 1;
    highestAckNum = 0;
    highestSeqSent = 0;
    totalBytesSent = 0;
    totalBytesAcked = 0;
    totalPacketsSent = 0;
    totalPacketsAcked = 0;
    totalQueueDrops = 0;
    totalRandomDrops = 0;
    totalRetransmissions = 0;
    totalFastRetransmits = 0;
    totalTimeouts = 0;

    queue.clear();
    eventLog.clear();
    snapshots.clear();

    initializeAlgorithm();

    // Initial event record
    EventRecord initRec;
    initRec.rttIndex = 0;
    initRec.timeMs = 0.0;
    initRec.type = EventType::DATA_TX;
    initRec.seqNum = 1;
    initRec.cwndPackets = tcpAlgo->getCwnd();
    initRec.ssthreshPackets = tcpAlgo->getSsthresh();
    initRec.state = tcpAlgo->getState();
    initRec.queueLength = 0;
    initRec.details = "Simulation Initialized: " + variantToString(config.variant) + 
                       " | CWND=" + std::to_string(static_cast<int>(tcpAlgo->getCwnd())) + 
                       " | SSThresh=" + std::to_string(static_cast<int>(tcpAlgo->getSsthresh()));
    eventLog.push_back(initRec);

    // Initial snapshot
    RttSnapshot initSnap;
    initSnap.rttIndex = 0;
    initSnap.timeMs = 0.0;
    initSnap.cwndPackets = tcpAlgo->getCwnd();
    initSnap.ssthreshPackets = tcpAlgo->getSsthresh();
    initSnap.inFlightPackets = 0;
    initSnap.queueLength = 0;
    initSnap.totalBytesSent = 0;
    initSnap.totalBytesAcked = 0;
    initSnap.totalDrops = 0;
    initSnap.totalRetransmissions = 0;
    initSnap.state = tcpAlgo->getState();
    initSnap.lastEvent = "INITIALIZED";
    snapshots.push_back(initSnap);
}

bool TCPSimulator::stepRtt() {
    if (currentRttIndex >= config.totalRttsToSimulate) {
        return false;
    }

    currentRttIndex++;
    currentTimeMs += config.propDelayMs * 2.0; // 1 RTT time

    int windowSizeToTransmit = static_cast<int>(std::floor(tcpAlgo->getCwnd()));
    if (windowSizeToTransmit < 1) windowSizeToTransmit = 1;

    int packetsDeliveredThisRtt = 0;
    int dropsThisRtt = 0;
    std::string primaryEventThisRtt = "ACK_RX";

    for (int i = 0; i < windowSizeToTransmit; ++i) {
        uint32_t seq = nextSeqNum++;
        highestSeqSent = std::max(highestSeqSent, seq);
        Packet pkt(seq, config.mssBytes, currentTimeMs, false);

        totalBytesSent += config.mssBytes;
        totalPacketsSent++;

        EventType dropReason;
        bool enqueued = queue.enqueue(pkt, config.randomLossProbability, dropReason);

        if (!enqueued) {
            dropsThisRtt++;
            if (dropReason == EventType::DROP_QUEUE_OVERFLOW) {
                totalQueueDrops++;
            } else {
                totalRandomDrops++;
            }

            // Log Packet Drop
            EventRecord dropRec;
            dropRec.rttIndex = currentRttIndex;
            dropRec.timeMs = currentTimeMs;
            dropRec.type = dropReason;
            dropRec.seqNum = seq;
            dropRec.cwndPackets = tcpAlgo->getCwnd();
            dropRec.ssthreshPackets = tcpAlgo->getSsthresh();
            dropRec.state = tcpAlgo->getState();
            dropRec.queueLength = queue.size();
            dropRec.details = (dropReason == EventType::DROP_QUEUE_OVERFLOW)
                              ? "Router Queue Overflow (Buffer Full: " + std::to_string(config.queueCapacityPackets) + " pkts)"
                              : "Random Link Loss / Bit Error (Probability: " + std::to_string(config.randomLossProbability * 100.0) + "%)";
            eventLog.push_back(dropRec);

            // Trigger Duplicate ACK or Timeout event
            EventRecord ackEventRec;
            ackEventRec.rttIndex = currentRttIndex;
            ackEventRec.timeMs = currentTimeMs;
            ackEventRec.type = EventType::DUP_ACK_RX;
            ackEventRec.seqNum = highestAckNum;
            ackEventRec.cwndPackets = tcpAlgo->getCwnd();
            ackEventRec.ssthreshPackets = tcpAlgo->getSsthresh();
            ackEventRec.state = tcpAlgo->getState();
            ackEventRec.queueLength = queue.size();

            tcpAlgo->onDupAck(highestAckNum, ackEventRec);
            eventLog.push_back(ackEventRec);

            if (ackEventRec.type == EventType::FAST_RETRANSMIT) {
                totalFastRetransmits++;
                totalRetransmissions++;
                primaryEventThisRtt = "FAST_RETRANSMIT";
            } else {
                primaryEventThisRtt = "DUP_ACK";
            }
        } else {
            // Packet passed queue successfully and arrived at Receiver
            Packet recvPkt;
            queue.dequeue(recvPkt);
            packetsDeliveredThisRtt++;
            totalPacketsAcked++;
            totalBytesAcked += config.mssBytes;
            highestAckNum = seq;

            EventRecord ackRec;
            ackRec.rttIndex = currentRttIndex;
            ackRec.timeMs = currentTimeMs;
            ackRec.type = EventType::ACK_RX;
            ackRec.seqNum = highestAckNum;
            ackRec.cwndPackets = tcpAlgo->getCwnd();
            ackRec.ssthreshPackets = tcpAlgo->getSsthresh();
            ackRec.state = tcpAlgo->getState();
            ackRec.queueLength = queue.size();

            tcpAlgo->onNewAck(highestAckNum, highestSeqSent, ackRec);
            eventLog.push_back(ackRec);
        }
    }

    // Check for RTO Timeout if consecutive drops occur without dupACK recovery
    if (dropsThisRtt == windowSizeToTransmit && windowSizeToTransmit > 0) {
        totalTimeouts++;
        totalRetransmissions++;
        primaryEventThisRtt = "RTO_TIMEOUT";

        EventRecord timeoutRec;
        timeoutRec.rttIndex = currentRttIndex;
        timeoutRec.timeMs = currentTimeMs;
        timeoutRec.type = EventType::TIMEOUT_RETRANSMIT;
        timeoutRec.seqNum = highestAckNum;
        timeoutRec.cwndPackets = tcpAlgo->getCwnd();
        timeoutRec.ssthreshPackets = tcpAlgo->getSsthresh();
        timeoutRec.state = tcpAlgo->getState();
        timeoutRec.queueLength = queue.size();

        tcpAlgo->onTimeout(highestAckNum, timeoutRec);
        eventLog.push_back(timeoutRec);
    }

    // Capture RTT Snapshot
    RttSnapshot snap;
    snap.rttIndex = currentRttIndex;
    snap.timeMs = currentTimeMs;
    snap.cwndPackets = tcpAlgo->getCwnd();
    snap.ssthreshPackets = tcpAlgo->getSsthresh();
    snap.inFlightPackets = std::max(0, static_cast<int>(nextSeqNum - highestAckNum - 1));
    snap.queueLength = queue.size();
    snap.totalBytesSent = totalBytesSent;
    snap.totalBytesAcked = totalBytesAcked;
    snap.totalDrops = totalQueueDrops + totalRandomDrops;
    snap.totalRetransmissions = totalRetransmissions;
    snap.state = tcpAlgo->getState();
    snap.lastEvent = primaryEventThisRtt;
    snapshots.push_back(snap);

    return true;
}

void TCPSimulator::runAll() {
    while (stepRtt()) {
        // Runs until totalRttsToSimulate reached
    }
}

SimulationMetrics TCPSimulator::calculateMetrics() const {
    SimulationMetrics m;
    m.durationMs = currentTimeMs;

    double durationSec = (currentTimeMs > 0.0) ? (currentTimeMs / 1000.0) : 1.0;
    
    // Offered Throughput (Mbps) = (Total Bytes Transmitted * 8) / (Time * 1e6)
    m.offeredThroughputMbps = (totalBytesSent * 8.0) / (durationSec * 1e6);
    
    // Receiver Goodput (Mbps) = (Unique ACKed Bytes * 8) / (Time * 1e6)
    m.goodputMbps = (totalBytesAcked * 8.0) / (durationSec * 1e6);

    // Latency & Queueing metrics
    double avgRtt = config.propDelayMs * 2.0;
    m.avgRttMs = avgRtt;
    m.avgQueueingDelayMs = (queue.getCapacity() > 0)
                           ? (avgRtt * 0.15)
                           : 0.0;

    m.totalPacketsSent = totalPacketsSent;
    m.totalPacketsAcked = totalPacketsAcked;
    m.totalQueueDrops = totalQueueDrops;
    m.totalRandomDrops = totalRandomDrops;
    m.totalRetransmissions = totalRetransmissions;
    m.totalFastRetransmits = totalFastRetransmits;
    m.totalTimeouts = totalTimeouts;

    int totalDrops = totalQueueDrops + totalRandomDrops;
    m.lossRatePercent = (totalPacketsSent > 0)
                        ? (static_cast<double>(totalDrops) / totalPacketsSent * 100.0)
                        : 0.0;

    m.retransmissionPercent = (totalPacketsSent > 0)
                              ? (static_cast<double>(totalRetransmissions) / totalPacketsSent * 100.0)
                              : 0.0;

    m.efficiencyRatio = (totalBytesSent > 0)
                        ? (static_cast<double>(totalBytesAcked) / totalBytesSent)
                        : 1.0;

    return m;
}

} // namespace tcpsim
