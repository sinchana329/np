/**
 * @file tcp_simulator.hpp
 * @brief Discrete-Event TCP Congestion Control Simulator Core Header
 * @project CSE Network Programming AAT Final-Year Project
 * 
 * Defines data structures and C++ classes for TCP Tahoe, TCP Reno, and TCP NewReno
 * algorithms, bottleneck router queues, network parameters, and discrete event logs.
 */

#ifndef TCP_SIMULATOR_HPP
#define TCP_SIMULATOR_HPP

#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <memory>
#include <random>
#include <algorithm>
#include <cmath>
#include <sstream>
#include <iomanip>

namespace tcpsim {

// TCP Variant Types
enum class TcpVariant {
    TAHOE,
    RENO,
    NEW_RENO
};

inline std::string variantToString(TcpVariant v) {
    switch (v) {
        case TcpVariant::TAHOE: return "TCP Tahoe";
        case TcpVariant::RENO: return "TCP Reno";
        case TcpVariant::NEW_RENO: return "TCP NewReno";
    }
    return "Unknown";
}

// Congestion Control State Phase
enum class CongestionState {
    SLOW_START,
    CONGESTION_AVOIDANCE,
    FAST_RECOVERY
};

inline std::string stateToString(CongestionState s) {
    switch (s) {
        case CongestionState::SLOW_START: return "Slow Start";
        case CongestionState::CONGESTION_AVOIDANCE: return "Congestion Avoidance";
        case CongestionState::FAST_RECOVERY: return "Fast Recovery";
    }
    return "Unknown";
}

// Event Classification
enum class EventType {
    DATA_TX,           // Packet transmitted by sender
    ACK_RX,            // Cumulative or new ACK received
    DUP_ACK_RX,        // Duplicate ACK received
    DROP_QUEUE_OVERFLOW, // Dropped due to bottleneck buffer exhaustion
    DROP_RANDOM_LOSS,  // Dropped due to random link loss/corruption
    FAST_RETRANSMIT,   // Fast retransmit triggered on 3 DupACKs
    TIMEOUT_RETRANSMIT // Retransmission Timeout (RTO) triggered
};

inline std::string eventTypeToString(EventType e) {
    switch (e) {
        case EventType::DATA_TX: return "DATA_TX";
        case EventType::ACK_RX: return "ACK_RX";
        case EventType::DUP_ACK_RX: return "DUP_ACK";
        case EventType::DROP_QUEUE_OVERFLOW: return "DROP_QUEUE";
        case EventType::DROP_RANDOM_LOSS: return "DROP_RANDOM";
        case EventType::FAST_RETRANSMIT: return "FAST_RETRANSMIT";
        case EventType::TIMEOUT_RETRANSMIT: return "RTO_TIMEOUT";
    }
    return "UNKNOWN";
}

// Network Configuration Parameters
struct NetworkConfig {
    TcpVariant variant = TcpVariant::RENO;
    double linkCapacityMbps = 10.0;    // Link bandwidth in Mbps
    double propDelayMs = 50.0;          // One-way propagation delay in ms
    int mssBytes = 1460;                // Maximum Segment Size in Bytes
    int initialCwndPackets = 1;         // Initial CWND in packets
    int initialSsthreshPackets = 64;    // Initial SSThresh in packets
    int queueCapacityPackets = 20;      // Bottleneck router queue capacity
    double randomLossProbability = 0.02;// Random packet drop rate (0.0 to 1.0)
    int totalRttsToSimulate = 100;      // Simulation duration in RTT units
    unsigned int randomSeed = 42;       // Seed for reproducible simulations
};

// Packet Structure
struct Packet {
    uint32_t seqNum;
    int sizeBytes;
    double txTimeMs;
    bool isRetransmission;
    
    Packet(uint32_t seq = 0, int size = 1460, double txTime = 0.0, bool retx = false)
        : seqNum(seq), sizeBytes(size), txTimeMs(txTime), isRetransmission(retx) {}
};

// Event Log Record
struct EventRecord {
    int rttIndex;
    double timeMs;
    EventType type;
    uint32_t seqNum;
    double cwndPackets;
    double ssthreshPackets;
    CongestionState state;
    int queueLength;
    std::string details;
};

// Snapshot per RTT step for charting and KPI calculation
struct RttSnapshot {
    int rttIndex;
    double timeMs;
    double cwndPackets;
    double ssthreshPackets;
    int inFlightPackets;
    int queueLength;
    long long totalBytesSent;
    long long totalBytesAcked;
    int totalDrops;
    int totalRetransmissions;
    CongestionState state;
    std::string lastEvent;
};

// Overall Simulation Summary Metrics
struct SimulationMetrics {
    double durationMs;
    double offeredThroughputMbps; // Includes initial transmissions & retransmissions
    double goodputMbps;          // Unique delivered user payload throughput
    double avgRttMs;
    double avgQueueingDelayMs;
    int totalPacketsSent;
    int totalPacketsAcked;
    int totalQueueDrops;
    int totalRandomDrops;
    int totalRetransmissions;
    int totalFastRetransmits;
    int totalTimeouts;
    double lossRatePercent;
    double retransmissionPercent;
    double efficiencyRatio;      // Goodput / Offered Throughput
};

// Abstract TCP Congestion Control Algorithm Base Class
class TcpAlgorithm {
protected:
    double cwnd;      // Congestion Window in packets
    double ssthresh;  // Slow Start Threshold in packets
    CongestionState state;
    int dupAckCount;
    uint32_t lastAckNum;
    uint32_t recoverSeq; // Used in NewReno for partial ACK handling

public:
    TcpAlgorithm(int initCwnd, int initSsthresh)
        : cwnd(initCwnd), ssthresh(initSsthresh), state(CongestionState::SLOW_START),
          dupAckCount(0), lastAckNum(0), recoverSeq(0) {}

    virtual ~TcpAlgorithm() = default;

    double getCwnd() const { return cwnd; }
    double getSsthresh() const { return ssthresh; }
    CongestionState getState() const { return state; }
    int getDupAckCount() const { return dupAckCount; }

    virtual void onNewAck(uint32_t ackNum, uint32_t maxSeqSent, EventRecord& record) = 0;
    virtual void onDupAck(uint32_t ackNum, EventRecord& record) = 0;
    virtual void onTimeout(uint32_t highestAcked, EventRecord& record) = 0;
};

// Router Queue Class
class RouterQueue {
private:
    int capacity;
    std::queue<Packet> buffer;
    std::mt19937 rng;
    std::uniform_real_distribution<double> dist;

public:
    RouterQueue(int cap, unsigned int seed)
        : capacity(cap), rng(seed), dist(0.0, 1.0) {}

    bool enqueue(const Packet& pkt, double lossProb, EventType& dropReason) {
        // First check random independent packet loss
        if (dist(rng) < lossProb) {
            dropReason = EventType::DROP_RANDOM_LOSS;
            return false;
        }
        // Then check queue capacity overflow
        if (static_cast<int>(buffer.size()) >= capacity) {
            dropReason = EventType::DROP_QUEUE_OVERFLOW;
            return false;
        }
        buffer.push(pkt);
        return true;
    }

    bool dequeue(Packet& pkt) {
        if (buffer.empty()) return false;
        pkt = buffer.front();
        buffer.pop();
        return true;
    }

    int size() const { return static_cast<int>(buffer.size()); }
    int getCapacity() const { return capacity; }
    bool isFull() const { return static_cast<int>(buffer.size()) >= capacity; }
    void clear() { std::queue<Packet> empty; std::swap(buffer, empty); }
};

// Main Simulator Engine
class TCPSimulator {
private:
    NetworkConfig config;
    std::unique_ptr<TcpAlgorithm> tcpAlgo;
    RouterQueue queue;
    
    // State tracking
    int currentRttIndex;
    double currentTimeMs;
    uint32_t nextSeqNum;
    uint32_t highestAckNum;
    uint32_t highestSeqSent;
    
    std::vector<EventRecord> eventLog;
    std::vector<RttSnapshot> snapshots;
    
    // Aggregated statistics
    long long totalBytesSent;
    long long totalBytesAcked;
    int totalPacketsSent;
    int totalPacketsAcked;
    int totalQueueDrops;
    int totalRandomDrops;
    int totalRetransmissions;
    int totalFastRetransmits;
    int totalTimeouts;

    void initializeAlgorithm();

public:
    TCPSimulator(const NetworkConfig& cfg);
    
    void reset();
    bool stepRtt();
    void runAll();
    
    const std::vector<RttSnapshot>& getSnapshots() const { return snapshots; }
    const std::vector<EventRecord>& getEventLog() const { return eventLog; }
    SimulationMetrics calculateMetrics() const;
    const NetworkConfig& getConfig() const { return config; }
};

} // namespace tcpsim

#endif // TCP_SIMULATOR_HPP
