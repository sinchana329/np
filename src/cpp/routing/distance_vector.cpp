/**
 * @file distance_vector.cpp
 * @brief Distance Vector (Bellman-Ford) Routing Algorithm
 * @project CSE Network Programming AAT Final-Year Project Expansion
 */

#include "network_graph.hpp"

namespace routing {

std::unordered_map<std::string, std::vector<RoutingTableEntry>> NetworkGraph::computeDistanceVectorRouting() const {
    std::unordered_map<std::string, std::vector<RoutingTableEntry>> tables;

    // Node list
    std::vector<std::string> nodeList;
    for (const auto& pair : nodes) {
        nodeList.push_back(pair.first);
    }

    // Distance matrix D[i][j] and nextHop matrix N[i][j]
    std::unordered_map<std::string, std::unordered_map<std::string, double>> dist;
    std::unordered_map<std::string, std::unordered_map<std::string, std::string>> nextHop;

    const double INF = std::numeric_limits<double>::infinity();

    for (const auto& u : nodeList) {
        for (const auto& v : nodeList) {
            dist[u][v] = (u == v) ? 0.0 : INF;
            nextHop[u][v] = (u == v) ? u : "";
        }
    }

    // Initialize with direct active link weights
    for (const auto& link : links) {
        if (!link.active) continue;
        const std::string& u = link.sourceId;
        const std::string& v = link.targetId;

        if (link.weight < dist[u][v]) {
            dist[u][v] = link.weight;
            nextHop[u][v] = v;
        }
        if (link.weight < dist[v][u]) {
            dist[v][u] = link.weight;
            nextHop[v][u] = u;
        }
    }

    // Bellman-Ford / Distance Vector Iterative Relaxation (N-1 iterations)
    size_t numNodes = nodeList.size();
    for (size_t k = 0; k < numNodes; ++k) {
        bool updated = false;
        for (const auto& u : nodeList) {
            for (const auto& v : nodeList) {
                if (u == v) continue;
                for (const auto& w : nodeList) {
                    if (dist[u][w] != INF && dist[w][v] != INF) {
                        if (dist[u][w] + dist[w][v] < dist[u][v]) {
                            dist[u][v] = dist[u][w] + dist[w][v];
                            nextHop[u][v] = nextHop[u][w]; // Next hop to reach w
                            updated = true;
                        }
                    }
                }
            }
        }
        if (!updated) break; // Converged
    }

    // Convert to per-node RoutingTableEntry vector
    for (const auto& u : nodeList) {
        std::vector<RoutingTableEntry> nodeTable;
        for (const auto& v : nodeList) {
            if (u == v) continue;
            if (dist[u][v] != INF) {
                nodeTable.push_back(RoutingTableEntry(v, nextHop[u][v], dist[u][v]));
            }
        }
        tables[u] = nodeTable;
    }

    return tables;
}

} // namespace routing
