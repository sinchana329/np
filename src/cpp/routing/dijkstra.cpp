/**
 * @file dijkstra.cpp
 * @brief Implementation of Dijkstra's Shortest Path Algorithm
 * @project CSE Network Programming AAT Final-Year Project Expansion
 */

#include "network_graph.hpp"

namespace routing {

PathResult NetworkGraph::computeDijkstraShortestPath(const std::string& srcId, const std::string& dstId) const {
    PathResult res;
    res.algorithm = "Dijkstra";

    if (nodes.find(srcId) == nodes.find(dstId) && nodes.find(srcId) == nodes.end()) {
        res.reachable = false;
        return res;
    }

    if (srcId == dstId) {
        res.reachable = true;
        res.nodePath.push_back(srcId);
        res.totalWeight = 0.0;
        res.totalDelayMs = 0.0;
        res.minBandwidthMbps = 1000.0;
        return res;
    }

    // Adjacency structure for active links
    struct Edge {
        std::string target;
        std::string linkId;
        double weight;
        double delayMs;
        double bandwidthMbps;
    };

    std::unordered_map<std::string, std::vector<Edge>> adj;
    for (const auto& link : links) {
        if (!link.active) continue; // Skip disabled links
        adj[link.sourceId].push_back({link.targetId, link.id, link.weight, link.propDelayMs, link.bandwidthMbps});
        adj[link.targetId].push_back({link.sourceId, link.id, link.weight, link.propDelayMs, link.bandwidthMbps}); // Bidirectional
    }

    // Dijkstra Priority Queue (Min-Heap based on cumulative distance)
    using QueueElement = std::pair<double, std::string>; // <dist, nodeId>
    std::priority_queue<QueueElement, std::vector<QueueElement>, std::greater<QueueElement>> pq;

    std::unordered_map<std::string, double> dist;
    std::unordered_map<std::string, std::string> parent;
    std::unordered_map<std::string, Edge> parentEdge;

    for (const auto& pair : nodes) {
        dist[pair.first] = std::numeric_limits<double>::infinity();
    }

    dist[srcId] = 0.0;
    pq.push({0.0, srcId});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;
        if (u == dstId) break; // Destination reached

        for (const auto& edge : adj[u]) {
            double newDist = dist[u] + edge.weight;
            if (newDist < dist[edge.target]) {
                dist[edge.target] = newDist;
                parent[edge.target] = u;
                parentEdge[edge.target] = edge;
                pq.push({newDist, edge.target});
            }
        }
    }

    if (dist[dstId] == std::numeric_limits<double>::infinity()) {
        res.reachable = false;
        return res;
    }

    // Reconstruct Path from dstId to srcId
    std::vector<std::string> path;
    std::string curr = dstId;
    double totalDelay = 0.0;
    double minBw = std::numeric_limits<double>::infinity();

    while (curr != srcId) {
        path.push_back(curr);
        auto edgeIt = parentEdge.find(curr);
        if (edgeIt != parentEdge.end()) {
            totalDelay += edgeIt->second.delayMs;
            minBw = std::min(minBw, edgeIt->second.bandwidthMbps);
        }
        curr = parent[curr];
    }
    path.push_back(srcId);
    std::reverse(path.begin(), path.end());

    res.reachable = true;
    res.nodePath = path;
    res.totalWeight = dist[dstId];
    res.totalDelayMs = totalDelay;
    res.minBandwidthMbps = (minBw == std::numeric_limits<double>::infinity()) ? 10.0 : minBw;

    return res;
}

} // namespace routing
