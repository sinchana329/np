/**
 * @file main.cpp
 * @brief Native C++ CLI executable for TCP Congestion Control Simulator
 * @project CSE Network Programming AAT Final-Year Project
 */

#include "tcp_simulator.hpp"

void printHeader(const std::string& title) {
    std::cout << "\n========================================================================\n";
    std::cout << "  " << title << "\n";
    std::cout << "========================================================================\n";
}

void runSingleSimulation(tcpsim::TcpVariant variant, double lossRate, int queueCap) {
    tcpsim::NetworkConfig cfg;
    cfg.variant = variant;
    cfg.linkCapacityMbps = 10.0;
    cfg.propDelayMs = 40.0;
    cfg.mssBytes = 1460;
    cfg.initialCwndPackets = 1;
    cfg.initialSsthreshPackets = 32;
    cfg.queueCapacityPackets = queueCap;
    cfg.randomLossProbability = lossRate;
    cfg.totalRttsToSimulate = 50;
    cfg.randomSeed = 12345;

    tcpsim::TCPSimulator sim(cfg);
    sim.runAll();

    tcpsim::SimulationMetrics metrics = sim.calculateMetrics();

    std::cout << std::left << std::setw(15) << tcpsim::variantToString(variant)
              << " | Goodput: " << std::fixed << std::setprecision(2) << std::setw(6) << metrics.goodputMbps << " Mbps"
              << " | Offered: " << std::setw(6) << metrics.offeredThroughputMbps << " Mbps"
              << " | Drops: " << std::setw(3) << (metrics.totalQueueDrops + metrics.totalRandomDrops)
              << " | Retx: " << std::setw(3) << metrics.totalRetransmissions
              << " | FastRetx: " << std::setw(2) << metrics.totalFastRetransmits
              << " | Timeouts: " << std::setw(2) << metrics.totalTimeouts
              << " | Efficiency: " << std::setw(5) << (metrics.efficiencyRatio * 100.0) << "%\n";
}

int main(int argc, char* argv[]) {
    (void)argc; (void)argv;

    printHeader("TCP CONGESTION CONTROL PERFORMANCE SIMULATOR (NATIVE C++)");
    std::cout << "CSE Network Programming AAT Academic Project\n";
    std::cout << "Demonstrating TCP Tahoe, TCP Reno, and TCP NewReno Congestion Control Algorithms\n";

    printHeader("EXPERIMENT 1: Baseline Low Loss Network (Loss = 0.5%, Queue = 20 pkts)");
    runSingleSimulation(tcpsim::TcpVariant::TAHOE, 0.005, 20);
    runSingleSimulation(tcpsim::TcpVariant::RENO, 0.005, 20);
    runSingleSimulation(tcpsim::TcpVariant::NEW_RENO, 0.005, 20);

    printHeader("EXPERIMENT 2: High Loss Wireless Link (Loss = 5.0%, Queue = 15 pkts)");
    runSingleSimulation(tcpsim::TcpVariant::TAHOE, 0.05, 15);
    runSingleSimulation(tcpsim::TcpVariant::RENO, 0.05, 15);
    runSingleSimulation(tcpsim::TcpVariant::NEW_RENO, 0.05, 15);

    printHeader("EXPERIMENT 3: Constrained Buffer / Queue Bottleneck (Loss = 1.0%, Queue = 5 pkts)");
    runSingleSimulation(tcpsim::TcpVariant::TAHOE, 0.01, 5);
    runSingleSimulation(tcpsim::TcpVariant::RENO, 0.01, 5);
    runSingleSimulation(tcpsim::TcpVariant::NEW_RENO, 0.01, 5);

    std::cout << "\n[SUCCESS] C++ Simulation Core executed cleanly.\n";
    return 0;
}
