/**
 * @file test_routing.cpp
 * @brief Unit tests for C++ Network Graph, Dijkstra, and Link Failure Rerouting
 * @project CSE Network Programming AAT Final-Year Project Expansion
 */

#include "../routing/network_graph.hpp"
#include <cassert>

void testDiamondDijkstra() {
    std::cout << "[TEST 1] Testing Diamond Topology Shortest Path... ";
    routing::NetworkGraph graph;

    // Nodes: S (Sender), R1, R2, R3 (Receivers/Routers)
    graph.addNode(routing::NetworkNode("S", "Sender S", routing::NodeRole::SENDER));
    graph.addNode(routing::NetworkNode("R1", "Router 1", routing::NodeRole::ROUTER));
    graph.addNode(routing::NetworkNode("R2", "Router 2", routing::NodeRole::ROUTER));
    graph.addNode(routing::NetworkNode("R3", "Receiver R3", routing::NodeRole::RECEIVER));

    // Links: S -> R1 (cost 1), S -> R2 (cost 5), R1 -> R3 (cost 2), R2 -> R3 (cost 1)
    graph.addLink(routing::NetworkLink("L1", "S", "R1", 10.0, 10.0, 1.0));
    graph.addLink(routing::NetworkLink("L2", "S", "R2", 10.0, 10.0, 5.0));
    graph.addLink(routing::NetworkLink("L3", "R1", "R3", 10.0, 10.0, 2.0));
    graph.addLink(routing::NetworkLink("L4", "R2", "R3", 10.0, 10.0, 1.0));

    // Path S -> R3: S -> R1 -> R3 has cost 1 + 2 = 3. S -> R2 -> R3 has cost 5 + 1 = 6.
    routing::PathResult res = graph.computeDijkstraShortestPath("S", "R3");
    assert(res.reachable == true);
    assert(res.nodePath.size() == 3);
    assert(res.nodePath[0] == "S");
    assert(res.nodePath[1] == "R1");
    assert(res.nodePath[2] == "R3");
    assert(res.totalWeight == 3.0);
    std::cout << "PASSED (Path S -> R1 -> R3, Cost: 3.0)\n";
}

void testLinkFailureRerouting() {
    std::cout << "[TEST 2] Testing Link Failure and Rerouting... ";
    routing::NetworkGraph graph;

    graph.addNode(routing::NetworkNode("S", "Sender S", routing::NodeRole::SENDER));
    graph.addNode(routing::NetworkNode("R1", "Router 1", routing::NodeRole::ROUTER));
    graph.addNode(routing::NetworkNode("R2", "Router 2", routing::NodeRole::ROUTER));
    graph.addNode(routing::NetworkNode("R3", "Receiver R3", routing::NodeRole::RECEIVER));

    graph.addLink(routing::NetworkLink("L1", "S", "R1", 10.0, 10.0, 1.0));
    graph.addLink(routing::NetworkLink("L2", "S", "R2", 10.0, 10.0, 5.0));
    graph.addLink(routing::NetworkLink("L3", "R1", "R3", 10.0, 10.0, 2.0));
    graph.addLink(routing::NetworkLink("L4", "R2", "R3", 10.0, 10.0, 1.0));

    // Fail primary link L1 (S -> R1)
    graph.setLinkStatus("L1", false);

    // New Path should reroute through S -> R2 -> R3 (Cost 5 + 1 = 6)
    routing::PathResult res = graph.computeDijkstraShortestPath("S", "R3");
    assert(res.reachable == true);
    assert(res.nodePath.size() == 3);
    assert(res.nodePath[0] == "S");
    assert(res.nodePath[1] == "R2");
    assert(res.nodePath[2] == "R3");
    assert(res.totalWeight == 6.0);
    std::cout << "PASSED (Rerouted S -> R2 -> R3, Cost: 6.0)\n";
}

void testUnreachableNode() {
    std::cout << "[TEST 3] Testing Disconnected Unreachable Destination... ";
    routing::NetworkGraph graph;

    graph.addNode(routing::NetworkNode("S", "Sender S", routing::NodeRole::SENDER));
    graph.addNode(routing::NetworkNode("X", "Isolated X", routing::NodeRole::RECEIVER));

    routing::PathResult res = graph.computeDijkstraShortestPath("S", "X");
    assert(res.reachable == false);
    std::cout << "PASSED (Destination correctly reported unreachable)\n";
}

int main() {
    std::cout << "=== RUNNING ROUTING ALGORITHMS C++ UNIT TESTS ===\n\n";
    testDiamondDijkstra();
    testLinkFailureRerouting();
    testUnreachableNode();
    std::cout << "\nALL C++ ROUTING UNIT TESTS PASSED SUCCESSFULLY!\n";
    return 0;
}
