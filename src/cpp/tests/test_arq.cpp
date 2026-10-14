/**
 * @file test_arq.cpp
 * @brief Unit tests for Stop-and-Wait, Go-Back-N, and Selective Repeat ARQ Protocols
 * @project NetScope Platform - CSE Network Programming AAT Final-Year Project
 */

#include "../arq/arq_algorithms.cpp"
#include <cassert>

void testStopAndWaitARQ() {
    std::cout << "[TEST 1] Testing Stop-and-Wait ARQ... ";
    arq::ArqConfig cfg;
    cfg.protocol = arq::ArqProtocol::STOP_AND_WAIT;
    cfg.windowSize = 1;
    cfg.totalPacketsToSend = 5;

    arq::ArqSimulator sim(cfg);
    sim.runAll();

    arq::ArqMetrics m = sim.getMetrics();
    assert(m.totalDelivered == 5);
    std::cout << "PASSED (Delivered 5 packets with Window=1)\n";
}

void testGoBackNARQ() {
    std::cout << "[TEST 2] Testing Go-Back-N ARQ... ";
    arq::ArqConfig cfg;
    cfg.protocol = arq::ArqProtocol::GO_BACK_N;
    cfg.windowSize = 4;
    cfg.totalPacketsToSend = 10;

    arq::ArqSimulator sim(cfg);
    sim.runAll();

    arq::ArqMetrics m = sim.getMetrics();
    assert(m.totalDelivered == 10);
    std::cout << "PASSED (Delivered 10 packets with Window=4)\n";
}

void testSelectiveRepeatARQ() {
    std::cout << "[TEST 3] Testing Selective Repeat ARQ... ";
    arq::ArqConfig cfg;
    cfg.protocol = arq::ArqProtocol::SELECTIVE_REPEAT;
    cfg.windowSize = 4;
    cfg.totalPacketsToSend = 10;

    arq::ArqSimulator sim(cfg);
    sim.runAll();

    arq::ArqMetrics m = sim.getMetrics();
    assert(m.totalDelivered == 10);
    std::cout << "PASSED (Delivered 10 packets with Selective Repeat)\n";
}

int main() {
    std::cout << "=== RUNNING RELIABLE TRANSPORT ARQ C++ UNIT TESTS ===\n\n";
    testStopAndWaitARQ();
    testGoBackNARQ();
    testSelectiveRepeatARQ();
    std::cout << "\nALL C++ ARQ PROTOCOL UNIT TESTS PASSED SUCCESSFULLY!\n";
    return 0;
}
