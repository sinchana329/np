/**
 * @file wasm_bridge.cpp
 * @brief Emscripten C/C++ WebAssembly Export Interface
 * @project CSE Network Programming AAT Final-Year Project
 */

#include "tcp_simulator.hpp"
#include <cstring>
#include <cstdlib>

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

extern "C" {

/**
 * @brief Run full simulation from C++ WASM module and return JSON string
 * @param variantInt 0: Tahoe, 1: Reno, 2: NewReno
 * @param bandwidthMbps Link bandwidth in Mbps
 * @param propDelayMs Propagation delay in ms
 * @param queueCap Router buffer capacity in packets
 * @param lossProb Random packet drop probability (0.0 to 1.0)
 * @param totalRtts Simulation duration in RTT units
 * @param seed Deterministic random seed
 * @return Dynamically allocated JSON string pointer (caller MUST free or handled by JS helper)
 */
EMSCRIPTEN_KEEPALIVE
const char* run_tcp_simulation_wasm(
    int variantInt,
    double bandwidthMbps,
    double propDelayMs,
    int queueCap,
    double lossProb,
    int totalRtts,
    unsigned int seed
) {
    tcpsim::NetworkConfig cfg;
    cfg.variant = static_cast<tcpsim::TcpVariant>(variantInt);
    cfg.linkCapacityMbps = bandwidthMbps;
    cfg.propDelayMs = propDelayMs;
    cfg.mssBytes = 1460;
    cfg.initialCwndPackets = 1;
    cfg.initialSsthreshPackets = 32;
    cfg.queueCapacityPackets = queueCap;
    cfg.randomLossProbability = lossProb;
    cfg.totalRttsToSimulate = totalRtts;
    cfg.randomSeed = seed;

    tcpsim::TCPSimulator sim(cfg);
    sim.runAll();

    tcpsim::SimulationMetrics metrics = sim.calculateMetrics();
    const auto& snapshots = sim.getSnapshots();
    const auto& eventLog = sim.getEventLog();

    std::stringstream ss;
    ss << "{";
    
    // Metrics
    ss << "\"metrics\":{";
    ss << "\"goodputMbps\":" << metrics.goodputMbps << ",";
    ss << "\"offeredThroughputMbps\":" << metrics.offeredThroughputMbps << ",";
    ss << "\"avgRttMs\":" << metrics.avgRttMs << ",";
    ss << "\"lossRatePercent\":" << metrics.lossRatePercent << ",";
    ss << "\"retransmissionPercent\":" << metrics.retransmissionPercent << ",";
    ss << "\"totalPacketsSent\":" << metrics.totalPacketsSent << ",";
    ss << "\"totalPacketsAcked\":" << metrics.totalPacketsAcked << ",";
    ss << "\"totalQueueDrops\":" << metrics.totalQueueDrops << ",";
    ss << "\"totalRandomDrops\":" << metrics.totalRandomDrops << ",";
    ss << "\"totalRetransmissions\":" << metrics.totalRetransmissions << ",";
    ss << "\"totalFastRetransmits\":" << metrics.totalFastRetransmits << ",";
    ss << "\"totalTimeouts\":" << metrics.totalTimeouts << ",";
    ss << "\"efficiencyRatio\":" << metrics.efficiencyRatio;
    ss << "},";

    // Snapshots
    ss << "\"snapshots\":[";
    for (size_t i = 0; i < snapshots.size(); ++i) {
        const auto& s = snapshots[i];
        ss << "{";
        ss << "\"rttIndex\":" << s.rttIndex << ",";
        ss << "\"timeMs\":" << s.timeMs << ",";
        ss << "\"cwndPackets\":" << s.cwndPackets << ",";
        ss << "\"ssthreshPackets\":" << s.ssthreshPackets << ",";
        ss << "\"inFlightPackets\":" << s.inFlightPackets << ",";
        ss << "\"queueLength\":" << s.queueLength << ",";
        ss << "\"totalBytesSent\":" << s.totalBytesSent << ",";
        ss << "\"totalBytesAcked\":" << s.totalBytesAcked << ",";
        ss << "\"totalDrops\":" << s.totalDrops << ",";
        ss << "\"totalRetransmissions\":" << s.totalRetransmissions << ",";
        ss << "\"state\":\"" << tcpsim::stateToString(s.state) << "\",";
        ss << "\"lastEvent\":\"" << s.lastEvent << "\"";
        ss << "}" << (i + 1 < snapshots.size() ? "," : "");
    }
    ss << "],";

    // Event Log (limit to max 200 events for memory safety in string transfer)
    ss << "\"eventLog\":[";
    size_t logLimit = std::min(eventLog.size(), static_cast<size_t>(200));
    for (size_t i = 0; i < logLimit; ++i) {
        const auto& e = eventLog[i];
        ss << "{";
        ss << "\"rttIndex\":" << e.rttIndex << ",";
        ss << "\"timeMs\":" << e.timeMs << ",";
        ss << "\"type\":\"" << tcpsim::eventTypeToString(e.type) << "\",";
        ss << "\"seqNum\":" << e.seqNum << ",";
        ss << "\"cwndPackets\":" << e.cwndPackets << ",";
        ss << "\"ssthreshPackets\":" << e.ssthreshPackets << ",";
        ss << "\"state\":\"" << tcpsim::stateToString(e.state) << "\",";
        ss << "\"queueLength\":" << e.queueLength << ",";
        ss << "\"details\":\"" << e.details << "\"";
        ss << "}" << (i + 1 < logLimit ? "," : "");
    }
    ss << "]";

    ss << "}";

    std::string jsonStr = ss.str();
    char* ret = static_cast<char*>(malloc(jsonStr.length() + 1));
    std::strcpy(ret, jsonStr.c_str());
    return ret;
}

EMSCRIPTEN_KEEPALIVE
void free_wasm_string(char* str) {
    if (str) free(str);
}

} // extern "C"
