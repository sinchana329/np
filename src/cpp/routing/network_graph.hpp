/**
 * @file network_graph.hpp
 * @brief Graph Data Structure and C++ Routing Definitions
 * @project CSE Network Programming AAT Final-Year Project Expansion
 */

#ifndef NETWORK_GRAPH_HPP
#define NETWORK_GRAPH_HPP

#include <string>
#include <vector>
#include <unordered_map>
#include <queue>
#include <limits>
#include <algorithm>
#include <iostream>
#include <sstream>

namespace routing {

enum class NodeRole {
    SENDER,
    RECEIVER,
    ROUTER
};

inline std::string roleToString(NodeRole role) {
    switch (role) {
        case NodeRole::SENDER: return "SENDER";
        case NodeRole::RECEIVER: return "RECEIVER";
        case NodeRole::ROUTER: return "ROUTER";
    }
    return "ROUTER";
}

struct NetworkNode {
    std::string id;
    std::string label;
    NodeRole role;
    double x;
    double y;

    NetworkNode(std::string nodeId = "", std::string nodeLabel = "", NodeRole nodeRole = NodeRole::ROUTER, double posX = 0, double posY = 0)
        : id(nodeId), label(nodeLabel), role(nodeRole), x(posX), y(posY) {}
};

struct NetworkLink {
    std::string id;
    std::string sourceId;
    std::string targetId;
    double bandwidthMbps;
    double propDelayMs;
    double weight;          // Routing cost metric
    int queueCapacityPackets;
    bool active;            // Link status (true = active, false = failed)

    NetworkLink(std::string linkId = "", std::string src = "", std::string dst = "",
                double bw = 10.0, double delay = 20.0, double w = 1.0, int cap = 15, bool isAct = true)
        : id(linkId), sourceId(src), targetId(dst), bandwidthMbps(bw),
          propDelayMs(delay), weight(w), queueCapacityPackets(cap), active(isAct) {}
};

struct PathResult {
    bool reachable;
    std::vector<std::string> nodePath;
    double totalWeight;
    double totalDelayMs;
    double minBandwidthMbps;
    std::string algorithm;

    PathResult() : reachable(false), totalWeight(0.0), totalDelayMs(0.0), minBandwidthMbps(0.0), algorithm("Dijkstra") {}
};

struct RoutingTableEntry {
    std::string destNodeId;
    std::string nextHopId;
    double cost;

    RoutingTableEntry(std::string dest = "", std::string next = "", double c = 0.0)
        : destNodeId(dest), nextHopId(next), cost(c) {}
};

class NetworkGraph {
private:
    std::unordered_map<std::string, NetworkNode> nodes;
    std::vector<NetworkLink> links;

public:
    NetworkGraph() = default;

    void addNode(const NetworkNode& node) {
        nodes[node.id] = node;
    }

    bool removeNode(const std::string& nodeId) {
        if (nodes.find(nodeId) == nodes.end()) return false;
        nodes.erase(nodeId);
        
        // Remove connected links
        links.erase(std::remove_if(links.begin(), links.end(), [&](const NetworkLink& link) {
            return link.sourceId == nodeId || link.targetId == nodeId;
        }), links.end());

        return true;
    }

    void addLink(const NetworkLink& link) {
        // Prevent duplicate link IDs
        for (auto& l : links) {
            if (l.id == link.id) {
                l = link;
                return;
            }
        }
        links.push_back(link);
    }

    bool removeLink(const std::string& linkId) {
        auto it = std::remove_if(links.begin(), links.end(), [&](const NetworkLink& l) {
            return l.id == linkId;
        });
        if (it != links.end()) {
            links.erase(it, links.end());
            return true;
        }
        return false;
    }

    bool setLinkStatus(const std::string& linkId, bool active) {
        for (auto& l : links) {
            if (l.id == linkId) {
                l.active = active;
                return true;
            }
        }
        return false;
    }

    const std::unordered_map<std::string, NetworkNode>& getNodes() const { return nodes; }
    const std::vector<NetworkLink>& getLinks() const { return links; }

    PathResult computeDijkstraShortestPath(const std::string& srcId, const std::string& dstId) const;
    std::unordered_map<std::string, std::vector<RoutingTableEntry>> computeDistanceVectorRouting() const;
};

} // namespace routing

#endif // NETWORK_GRAPH_HPP
