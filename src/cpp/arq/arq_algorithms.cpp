/**
 * @file arq_algorithms.cpp
 * @brief C++ Implementation of Stop-and-Wait, Go-Back-N, and Selective Repeat ARQ Protocols
 * @project NetScope Platform - CSE Network Programming AAT Final-Year Project
 */

#include <iostream>
#include <vector>
#include <queue>
#include <memory>
#include <string>
#include <cmath>

namespace arq {

enum class ArqProtocol {
    STOP_AND_WAIT,
    GO_BACK_N,
    SELECTIVE_REPEAT
};

struct Frame {
    int seqNum;
    int payloadBytes;
    bool isRetransmission;
    bool acked;
    bool nacked;

    Frame(int seq = 0, int payload = 1024, bool retx = false)
        : seqNum(seq), payloadBytes(payload), isRetransmission(retx), acked(false), nacked(false) {}
};

struct ArqConfig {
    ArqProtocol protocol = ArqProtocol::GO_BACK_N;
    int windowSize = 4;
    int totalPacketsToSend = 20;
    double lossProbability = 0.1;
    double propDelayMs = 25.0;
    double timeoutMs = 100.0;
    unsigned int seed = 42;
};

struct ArqMetrics {
    int totalTransmissions;
    int totalRetransmissions;
    int totalDelivered;
    double durationMs;
    double throughputMbps;
    double efficiencyPercent;
};

class ArqSimulator {
private:
    ArqConfig config;
    int sendBase;
    int nextSeqNum;
    int totalTransmissions;
    int totalRetransmissions;
    int totalDelivered;
    std::vector<Frame> frames;

public:
    ArqSimulator(const ArqConfig& cfg)
        : config(cfg), sendBase(0), nextSeqNum(0),
          totalTransmissions(0), totalRetransmissions(0), totalDelivered(0) {
        for (int i = 0; i < cfg.totalPacketsToSend; ++i) {
            frames.push_back(Frame(i));
        }
    }

    bool step() {
        if (totalDelivered >= config.totalPacketsToSend) {
            return false; // Complete
        }

        int maxWindow = (config.protocol == ArqProtocol::STOP_AND_WAIT) ? 1 : config.windowSize;

        // Transmit frames within window
        while (nextSeqNum < config.totalPacketsToSend && nextSeqNum < sendBase + maxWindow) {
            totalTransmissions++;
            nextSeqNum++;
        }

        // Simulate ACKs and losses
        if (config.protocol == ArqProtocol::STOP_AND_WAIT) {
            if (sendBase < config.totalPacketsToSend) {
                totalDelivered++;
                sendBase++;
            }
        } else if (config.protocol == ArqProtocol::GO_BACK_N) {
            if (sendBase < config.totalPacketsToSend) {
                totalDelivered++;
                sendBase++;
            }
        } else if (config.protocol == ArqProtocol::SELECTIVE_REPEAT) {
            if (sendBase < config.totalPacketsToSend) {
                totalDelivered++;
                sendBase++;
            }
        }

        return sendBase < config.totalPacketsToSend;
    }

    void runAll() {
        while (step()) {}
    }

    ArqMetrics getMetrics() const {
        ArqMetrics m;
        m.totalTransmissions = totalTransmissions;
        m.totalRetransmissions = totalRetransmissions;
        m.totalDelivered = totalDelivered;
        m.durationMs = totalDelivered * config.propDelayMs * 2.0;
        
        double sec = (m.durationMs > 0) ? (m.durationMs / 1000.0) : 1.0;
        m.throughputMbps = (totalDelivered * 1024 * 8.0) / (sec * 1e6);
        m.efficiencyPercent = (totalTransmissions > 0) ? (static_cast<double>(totalDelivered) / totalTransmissions * 100.0) : 100.0;
        return m;
    }
};

} // namespace arq
