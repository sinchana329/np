/**
 * @file test_tcp.cpp
 * @brief Unit tests for TCP Tahoe, Reno, and NewReno algorithm transitions
 * @project CSE Network Programming AAT Final-Year Project
 */

#include "../tcp_simulator.hpp"
#include <cassert>

void testSlowStartGrowth() {
    std::cout << "[TEST 1] Testing Slow Start CWND Exponential Growth... ";
    tcpsim::NetworkConfig cfg;
    cfg.variant = tcpsim::TcpVariant::RENO;
    cfg.initialCwndPackets = 1;
    cfg.initialSsthreshPackets = 16;
    cfg.randomLossProbability = 0.0; // Zero loss
    cfg.totalRttsToSimulate = 4;

    tcpsim::TCPSimulator sim(cfg);
    sim.stepRtt(); // RTT 1: CWND 1 -> 2
    sim.stepRtt(); // RTT 2: CWND 2 -> 4
    
    auto snapshots = sim.getSnapshots();
    assert(snapshots.size() >= 3);
    assert(snapshots[1].cwndPackets == 2.0);
    assert(snapshots[2].cwndPackets == 4.0);
    std::cout << "PASSED (CWND grew 1 -> 2 -> 4)\n";
}

void testTahoeFastRetransmit() {
    std::cout << "[TEST 2] Testing TCP Tahoe 3 DupACK Reset to Slow Start... ";
    tcpsim::NetworkConfig cfg;
    cfg.variant = tcpsim::TcpVariant::TAHOE;
    cfg.initialCwndPackets = 8;
    cfg.initialSsthreshPackets = 16;
    cfg.randomLossProbability = 1.0; // Force drops
    cfg.totalRttsToSimulate = 2;

    tcpsim::TCPSimulator sim(cfg);
    sim.stepRtt(); // Triggers drops and dupACKs

    auto snapshots = sim.getSnapshots();
    assert(snapshots.back().cwndPackets == 1.0); // Reset to 1 on Tahoe
    assert(snapshots.back().state == tcpsim::CongestionState::SLOW_START);
    std::cout << "PASSED (Tahoe reset CWND to 1)\n";
}

void testRenoFastRecovery() {
    std::cout << "[TEST 3] Testing TCP Reno Fast Recovery Transition... ";
    tcpsim::NetworkConfig cfg;
    cfg.variant = tcpsim::TcpVariant::RENO;
    cfg.initialCwndPackets = 10;
    cfg.initialSsthreshPackets = 16;
    cfg.randomLossProbability = 0.3; // Partial loss
    cfg.totalRttsToSimulate = 3;

    tcpsim::TCPSimulator sim(cfg);
    sim.stepRtt();

    auto snapshots = sim.getSnapshots();
    assert(snapshots.size() >= 2);
    // SSThresh should halve to max(2, 10/2) = 5
    assert(snapshots[1].ssthreshPackets == 5.0);
    std::cout << "PASSED (Reno SSThresh set to max(2, cwnd/2))\n";
}

int main() {
    std::cout << "=== RUNNING TCP CONGESTION CONTROL C++ UNIT TESTS ===\n\n";
    testSlowStartGrowth();
    testTahoeFastRetransmit();
    testRenoFastRecovery();
    std::cout << "\nALL C++ UNIT TESTS PASSED SUCCESSFULLY!\n";
    return 0;
}
