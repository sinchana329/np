/**
 * @file tcp_algorithms.cpp
 * @brief Implementations of TCP Tahoe, Reno, and NewReno state machines
 * @project CSE Network Programming AAT Final-Year Project
 */

#include "tcp_simulator.hpp"

namespace tcpsim {

// ============================================================================
// TCP TAHOE IMPLEMENTATION
// ============================================================================
class TcpTahoe : public TcpAlgorithm {
public:
    TcpTahoe(int initCwnd, int initSsthresh)
        : TcpAlgorithm(initCwnd, initSsthresh) {}

    void onNewAck(uint32_t ackNum, uint32_t maxSeqSent, EventRecord& record) override {
        (void)maxSeqSent;
        dupAckCount = 0;
        lastAckNum = ackNum;

        if (cwnd < ssthresh) {
            // Slow Start Phase: Exponential growth (+1 segment per ACK)
            cwnd += 1.0;
            state = CongestionState::SLOW_START;
            record.details = "Slow Start: cwnd increased by 1";
        } else {
            // Congestion Avoidance Phase: Linear growth (+1/cwnd per ACK = +1 segment per RTT)
            cwnd += (1.0 / std::max(1.0, std::floor(cwnd)));
            state = CongestionState::CONGESTION_AVOIDANCE;
            record.details = "Congestion Avoidance: cwnd increased by 1/cwnd";
        }
    }

    void onDupAck(uint32_t ackNum, EventRecord& record) override {
        (void)ackNum;
        dupAckCount++;
        if (dupAckCount == 3) {
            // Tahoe Fast Retransmit: Reset cwnd to 1 and re-enter Slow Start
            ssthresh = std::max(2.0, std::floor(cwnd / 2.0));
            cwnd = 1.0;
            state = CongestionState::SLOW_START;
            record.type = EventType::FAST_RETRANSMIT;
            record.details = "3 DupACKs -> Tahoe Fast Retransmit: ssthresh=" + 
                             std::to_string(static_cast<int>(ssthresh)) + ", cwnd reset to 1";
        } else {
            record.type = EventType::DUP_ACK_RX;
            record.details = "Duplicate ACK #" + std::to_string(dupAckCount) + " received";
        }
    }

    void onTimeout(uint32_t highestAcked, EventRecord& record) override {
        (void)highestAcked;
        dupAckCount = 0;
        ssthresh = std::max(2.0, std::floor(cwnd / 2.0));
        cwnd = 1.0;
        state = CongestionState::SLOW_START;
        record.type = EventType::TIMEOUT_RETRANSMIT;
        record.details = "RTO Timeout -> ssthresh=" + std::to_string(static_cast<int>(ssthresh)) + 
                         ", cwnd reset to 1 (Slow Start)";
    }
};

// ============================================================================
// TCP RENO IMPLEMENTATION
// ============================================================================
class TcpReno : public TcpAlgorithm {
public:
    TcpReno(int initCwnd, int initSsthresh)
        : TcpAlgorithm(initCwnd, initSsthresh) {}

    void onNewAck(uint32_t ackNum, uint32_t maxSeqSent, EventRecord& record) override {
        (void)maxSeqSent;
        lastAckNum = ackNum;

        if (state == CongestionState::FAST_RECOVERY) {
            // Exit Fast Recovery on new ACK: deflates window back to ssthresh
            cwnd = ssthresh;
            state = CongestionState::CONGESTION_AVOIDANCE;
            dupAckCount = 0;
            record.details = "New ACK received -> Exit Fast Recovery: cwnd set to ssthresh (" + 
                             std::to_string(static_cast<int>(cwnd)) + ")";
            return;
        }

        dupAckCount = 0;
        if (cwnd < ssthresh) {
            cwnd += 1.0;
            state = CongestionState::SLOW_START;
            record.details = "Slow Start: cwnd increased by 1";
        } else {
            cwnd += (1.0 / std::max(1.0, std::floor(cwnd)));
            state = CongestionState::CONGESTION_AVOIDANCE;
            record.details = "Congestion Avoidance: cwnd increased by 1/cwnd";
        }
    }

    void onDupAck(uint32_t ackNum, EventRecord& record) override {
        (void)ackNum;
        dupAckCount++;

        if (dupAckCount == 3) {
            // Reno Fast Retransmit & Fast Recovery: Inflate window by +3 for the 3 dupACKs buffered
            ssthresh = std::max(2.0, std::floor(cwnd / 2.0));
            cwnd = ssthresh + 3.0;
            state = CongestionState::FAST_RECOVERY;
            record.type = EventType::FAST_RETRANSMIT;
            record.details = "3 DupACKs -> Reno Fast Retransmit: ssthresh=" + 
                             std::to_string(static_cast<int>(ssthresh)) + ", Fast Recovery cwnd=" + 
                             std::to_string(static_cast<int>(cwnd));
        } else if (dupAckCount > 3 && state == CongestionState::FAST_RECOVERY) {
            // Inflate cwnd for each additional dupACK received during Fast Recovery
            cwnd += 1.0;
            record.type = EventType::DUP_ACK_RX;
            record.details = "Fast Recovery DupACK #" + std::to_string(dupAckCount) + ": cwnd inflated to " + 
                             std::to_string(static_cast<int>(cwnd));
        } else {
            record.type = EventType::DUP_ACK_RX;
            record.details = "Duplicate ACK #" + std::to_string(dupAckCount) + " received";
        }
    }

    void onTimeout(uint32_t highestAcked, EventRecord& record) override {
        (void)highestAcked;
        dupAckCount = 0;
        ssthresh = std::max(2.0, std::floor(cwnd / 2.0));
        cwnd = 1.0;
        state = CongestionState::SLOW_START;
        record.type = EventType::TIMEOUT_RETRANSMIT;
        record.details = "RTO Timeout -> ssthresh=" + std::to_string(static_cast<int>(ssthresh)) + 
                         ", cwnd reset to 1 (Slow Start)";
    }
};

// ============================================================================
// TCP NEWRENO IMPLEMENTATION
// ============================================================================
class TcpNewReno : public TcpAlgorithm {
public:
    TcpNewReno(int initCwnd, int initSsthresh)
        : TcpAlgorithm(initCwnd, initSsthresh) {}

    void onNewAck(uint32_t ackNum, uint32_t maxSeqSent, EventRecord& record) override {
        if (state == CongestionState::FAST_RECOVERY) {
            if (ackNum < recoverSeq) {
                // Partial ACK: Acknowledges some but NOT all packets in flight when loss occurred
                cwnd = cwnd - static_cast<double>(ackNum - lastAckNum) + 1.0;
                if (cwnd < 1.0) cwnd = 1.0;
                lastAckNum = ackNum;
                record.details = "NewReno Partial ACK received (" + std::to_string(ackNum) + 
                                 " < recover " + std::to_string(recoverSeq) + 
                                 "): Fast Retransmit next missing segment, stay in Fast Recovery";
                return;
            } else {
                // Full ACK: Acknowledges all data in flight up to recoverSeq
                cwnd = ssthresh;
                state = (cwnd < ssthresh) ? CongestionState::SLOW_START : CongestionState::CONGESTION_AVOIDANCE;
                dupAckCount = 0;
                lastAckNum = ackNum;
                record.details = "NewReno Full ACK received: Exit Fast Recovery to " + 
                                 stateToString(state) + ", cwnd=" + std::to_string(static_cast<int>(cwnd));
                return;
            }
        }

        dupAckCount = 0;
        lastAckNum = ackNum;
        if (cwnd < ssthresh) {
            cwnd += 1.0;
            state = CongestionState::SLOW_START;
            record.details = "Slow Start: cwnd increased by 1";
        } else {
            cwnd += (1.0 / std::max(1.0, std::floor(cwnd)));
            state = CongestionState::CONGESTION_AVOIDANCE;
            record.details = "Congestion Avoidance: cwnd increased by 1/cwnd";
        }
    }

    void onDupAck(uint32_t ackNum, EventRecord& record) override {
        (void)ackNum;
        dupAckCount++;

        if (dupAckCount == 3) {
            // NewReno Fast Retransmit: Record recoverSeq to track recovery phase
            recoverSeq = lastAckNum + static_cast<uint32_t>(cwnd);
            ssthresh = std::max(2.0, std::floor(cwnd / 2.0));
            cwnd = ssthresh + 3.0;
            state = CongestionState::FAST_RECOVERY;
            record.type = EventType::FAST_RETRANSMIT;
            record.details = "3 DupACKs -> NewReno Fast Retransmit: recoverSeq=" + 
                             std::to_string(recoverSeq) + ", ssthresh=" + 
                             std::to_string(static_cast<int>(ssthresh)) + 
                             ", Fast Recovery cwnd=" + std::to_string(static_cast<int>(cwnd));
        } else if (dupAckCount > 3 && state == CongestionState::FAST_RECOVERY) {
            cwnd += 1.0;
            record.type = EventType::DUP_ACK_RX;
            record.details = "Fast Recovery DupACK #" + std::to_string(dupAckCount) + ": cwnd inflated to " + 
                             std::to_string(static_cast<int>(cwnd));
        } else {
            record.type = EventType::DUP_ACK_RX;
            record.details = "Duplicate ACK #" + std::to_string(dupAckCount) + " received";
        }
    }

    void onTimeout(uint32_t highestAcked, EventRecord& record) override {
        (void)highestAcked;
        dupAckCount = 0;
        ssthresh = std::max(2.0, std::floor(cwnd / 2.0));
        cwnd = 1.0;
        state = CongestionState::SLOW_START;
        record.type = EventType::TIMEOUT_RETRANSMIT;
        record.details = "RTO Timeout -> ssthresh=" + std::to_string(static_cast<int>(ssthresh)) + 
                         ", cwnd reset to 1 (Slow Start)";
    }
};

// Algorithm Factory implementation inside TCPSimulator
void TCPSimulator::initializeAlgorithm() {
    switch (config.variant) {
        case TcpVariant::TAHOE:
            tcpAlgo = std::make_unique<TcpTahoe>(config.initialCwndPackets, config.initialSsthreshPackets);
            break;
        case TcpVariant::RENO:
            tcpAlgo = std::make_unique<TcpReno>(config.initialCwndPackets, config.initialSsthreshPackets);
            break;
        case TcpVariant::NEW_RENO:
            tcpAlgo = std::make_unique<TcpNewReno>(config.initialCwndPackets, config.initialSsthreshPackets);
            break;
    }
}

} // namespace tcpsim
