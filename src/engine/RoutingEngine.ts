/**
 * @file RoutingEngine.ts
 * @brief Mirrored C++ Network Graph & Routing Engine in TypeScript
 * @project CSE Network Programming AAT Final-Year Project Expansion
 */

import {
  TopologyNode,
  TopologyLink,
  PathResult,
  RoutingTableEntry,
  RoutedPacket,
  RoutingMetrics,
  RoutingEventRecord,
  RoutingAlgorithm,
} from './routingTypes';

export class RoutingEngine {
  private nodes: Map<string, TopologyNode> = new Map();
  private links: TopologyLink[] = [];
  private routeChangesCount: number = 0;
  private eventLog: RoutingEventRecord[] = [];

  constructor(initialNodes: TopologyNode[] = [], initialLinks: TopologyLink[] = []) {
    initialNodes.forEach((n) => this.nodes.set(n.id, { ...n }));
    this.links = initialLinks.map((l) => ({ ...l }));
  }

  // Node Mutations
  public addNode(node: TopologyNode) {
    this.nodes.set(node.id, { ...node });
  }

  public updateNodePosition(nodeId: string, x: number, y: number) {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.x = x;
      node.y = y;
    }
  }

  public removeNode(nodeId: string) {
    this.nodes.delete(nodeId);
    this.links = this.links.filter((l) => l.sourceId !== nodeId && l.targetId !== nodeId);
  }

  // Link Mutations
  public addLink(link: TopologyLink) {
    const existingIdx = this.links.findIndex((l) => l.id === link.id);
    if (existingIdx >= 0) {
      this.links[existingIdx] = { ...link };
    } else {
      this.links.push({ ...link });
    }
  }

  public removeLink(linkId: string) {
    this.links = this.links.filter((l) => l.id !== linkId);
  }

  public setLinkStatus(linkId: string, active: boolean) {
    const link = this.links.find((l) => l.id === linkId);
    if (link) {
      const prev = link.active;
      link.active = active;
      if (prev !== active) {
        this.routeChangesCount++;
        this.eventLog.push({
          id: `evt_${Date.now()}_${Math.random()}`,
          timestampMs: Date.now(),
          eventType: active ? 'LINK_RESTORE' : 'LINK_FAILURE',
          details: `Link ${link.id} (${link.sourceId} <-> ${link.targetId}) set to ${
            active ? 'ACTIVE' : 'FAILED'
          }`,
        });
      }
    }
  }

  public updateLinkProperties(linkId: string, props: Partial<TopologyLink>) {
    const link = this.links.find((l) => l.id === linkId);
    if (link) {
      Object.assign(link, props);
      this.routeChangesCount++;
    }
  }

  public getNodes(): TopologyNode[] {
    return Array.from(this.nodes.values());
  }

  public getLinks(): TopologyLink[] {
    return [...this.links];
  }

  public getEventLog(): RoutingEventRecord[] {
    return [...this.eventLog];
  }

  // Dijkstra Shortest Path Algorithm
  public computeDijkstraShortestPath(srcId: string, dstId: string): PathResult {
    if (!this.nodes.has(srcId) || !this.nodes.has(dstId)) {
      return { reachable: false, nodePath: [], totalWeight: 0, totalDelayMs: 0, minBandwidthMbps: 0, algorithm: 'Dijkstra' };
    }

    if (srcId === dstId) {
      return { reachable: true, nodePath: [srcId], totalWeight: 0, totalDelayMs: 0, minBandwidthMbps: 1000, algorithm: 'Dijkstra' };
    }

    // Adjacency graph for active links
    const adj: Map<string, Array<{ target: string; linkId: string; weight: number; delayMs: number; bw: number }>> = new Map();
    this.nodes.forEach((_, id) => adj.set(id, []));

    this.links.forEach((l) => {
      if (!l.active) return;
      adj.get(l.sourceId)?.push({ target: l.targetId, linkId: l.id, weight: l.weight, delayMs: l.propDelayMs, bw: l.bandwidthMbps });
      adj.get(l.targetId)?.push({ target: l.sourceId, linkId: l.id, weight: l.weight, delayMs: l.propDelayMs, bw: l.bandwidthMbps });
    });

    // Min-Heap / Priority Distance Map
    const dist: Map<string, number> = new Map();
    const parent: Map<string, string> = new Map();
    const parentEdge: Map<string, { delayMs: number; bw: number }> = new Map();

    this.nodes.forEach((_, id) => dist.set(id, Infinity));
    dist.set(srcId, 0);

    const visited = new Set<string>();

    while (visited.size < this.nodes.size) {
      // Find unvisited node with min distance
      let minDist = Infinity;
      let u: string | null = null;

      dist.forEach((d, id) => {
        if (!visited.has(id) && d < minDist) {
          minDist = d;
          u = id;
        }
      });

      if (!u || u === dstId || minDist === Infinity) break;
      visited.add(u);

      const edges = adj.get(u) || [];
      for (const edge of edges) {
        if (visited.has(edge.target)) continue;
        const newD = dist.get(u)! + edge.weight;
        if (newD < dist.get(edge.target)!) {
          dist.set(edge.target, newD);
          parent.set(edge.target, u);
          parentEdge.set(edge.target, { delayMs: edge.delayMs, bw: edge.bw });
        }
      }
    }

    const finalDist = dist.get(dstId);
    if (!finalDist || finalDist === Infinity) {
      return { reachable: false, nodePath: [], totalWeight: 0, totalDelayMs: 0, minBandwidthMbps: 0, algorithm: 'Dijkstra' };
    }

    // Reconstruct Path
    const nodePath: string[] = [];
    let curr: string | undefined = dstId;
    let totalDelay = 0;
    let minBw = Infinity;

    while (curr && curr !== srcId) {
      nodePath.push(curr);
      const edge = parentEdge.get(curr);
      if (edge) {
        totalDelay += edge.delayMs;
        minBw = Math.min(minBw, edge.bw);
      }
      curr = parent.get(curr);
    }
    nodePath.push(srcId);
    nodePath.reverse();

    return {
      reachable: true,
      nodePath,
      totalWeight: finalDist,
      totalDelayMs: totalDelay,
      minBandwidthMbps: minBw === Infinity ? 10 : minBw,
      algorithm: 'Dijkstra',
    };
  }

  // Distance Vector Routing Table Calculator (Bellman-Ford)
  public computeDistanceVectorRouting(): Map<string, RoutingTableEntry[]> {
    const nodeIds = Array.from(this.nodes.keys());
    const distMap: Map<string, Map<string, number>> = new Map();
    const nextHopMap: Map<string, Map<string, string>> = new Map();

    nodeIds.forEach((u) => {
      distMap.set(u, new Map());
      nextHopMap.set(u, new Map());
      nodeIds.forEach((v) => {
        distMap.get(u)!.set(v, u === v ? 0 : Infinity);
        nextHopMap.get(u)!.set(v, u === v ? u : '');
      });
    });

    // Populate active direct link weights
    this.links.forEach((l) => {
      if (!l.active) return;
      const u = l.sourceId;
      const v = l.targetId;

      if (l.weight < distMap.get(u)!.get(v)!) {
        distMap.get(u)!.set(v, l.weight);
        nextHopMap.get(u)!.set(v, v);
      }
      if (l.weight < distMap.get(v)!.get(u)!) {
        distMap.get(v)!.set(u, l.weight);
        nextHopMap.get(v)!.set(u, u);
      }
    });

    // Bellman-Ford N-1 Relaxation
    for (let k = 0; k < nodeIds.length; k++) {
      let updated = false;
      for (const u of nodeIds) {
        for (const v of nodeIds) {
          if (u === v) continue;
          for (const w of nodeIds) {
            const duw = distMap.get(u)!.get(w)!;
            const dwv = distMap.get(w)!.get(v)!;
            if (duw !== Infinity && dwv !== Infinity) {
              if (duw + dwv < distMap.get(u)!.get(v)!) {
                distMap.get(u)!.set(v, duw + dwv);
                nextHopMap.get(u)!.set(v, nextHopMap.get(u)!.get(w)!);
                updated = true;
              }
            }
          }
        }
      }
      if (!updated) break;
    }

    const tables: Map<string, RoutingTableEntry[]> = new Map();
    nodeIds.forEach((u) => {
      const nodeTable: RoutingTableEntry[] = [];
      nodeIds.forEach((v) => {
        if (u === v) return;
        const c = distMap.get(u)!.get(v)!;
        if (c !== Infinity) {
          nodeTable.push({ destNodeId: v, nextHopId: nextHopMap.get(u)!.get(v)!, cost: c });
        }
      });
      tables.set(u, nodeTable);
    });

    return tables;
  }

  // Simulate Discrete Packet Burst
  public simulatePacketBurst(
    srcId: string,
    dstId: string,
    packetCount: number = 10
  ): { packets: RoutedPacket[]; metrics: RoutingMetrics } {
    const pathRes = this.computeDijkstraShortestPath(srcId, dstId);
    const packets: RoutedPacket[] = [];
    let delivered = 0;
    let dropped = 0;
    let totalDelay = 0;

    if (!pathRes.reachable || pathRes.nodePath.length < 2) {
      return {
        packets: [],
        metrics: {
          totalPacketsGenerated: packetCount,
          totalPacketsDelivered: 0,
          totalPacketsDropped: packetCount,
          deliveryRatioPercent: 0,
          avgEndToEndDelayMs: 0,
          estimatedThroughputMbps: 0,
          totalRouteChanges: this.routeChangesCount,
          durationMs: 0,
        },
      };
    }

    for (let i = 0; i < packetCount; i++) {
      const pktId = `pkt_${Date.now()}_${i + 1}`;
      const creationTime = i * 2.0; // Spaced 2ms apart

      packets.push({
        id: pktId,
        packetNum: i + 1,
        srcId,
        dstId,
        currentNodeId: pathRes.nodePath[0],
        nextHopId: pathRes.nodePath[1],
        hopIndex: 0,
        path: pathRes.nodePath,
        creationTimeMs: creationTime,
        deliveryTimeMs: creationTime + pathRes.totalDelayMs,
        status: 'DELIVERED',
        progressPct: 100,
      });

      delivered++;
      totalDelay += pathRes.totalDelayMs;
    }

    const durationSec = pathRes.totalDelayMs > 0 ? (pathRes.totalDelayMs + packetCount * 2) / 1000 : 1;
    const estThroughputMbps = (delivered * 1460 * 8) / (durationSec * 1e6);

    const metrics: RoutingMetrics = {
      totalPacketsGenerated: packetCount,
      totalPacketsDelivered: delivered,
      totalPacketsDropped: dropped,
      deliveryRatioPercent: parseFloat(((delivered / packetCount) * 100).toFixed(1)),
      avgEndToEndDelayMs: parseFloat((totalDelay / Math.max(1, delivered)).toFixed(1)),
      estimatedThroughputMbps: parseFloat(estThroughputMbps.toFixed(2)),
      totalRouteChanges: this.routeChangesCount,
      durationMs: parseFloat(durationSec.toFixed(2)) * 1000,
    };

    return { packets, metrics };
  }

  // CSV Export for Routing Experiments
  public generateCsvExport(srcId: string, dstId: string): string {
    const path = this.computeDijkstraShortestPath(srcId, dstId);
    const tables = this.computeDistanceVectorRouting();

    const lines: string[] = [];
    lines.push(`# Network Topology & Routing Experiment Data Export`);
    lines.push(`# Source: ${srcId} | Destination: ${dstId} | Algorithm: ${path.algorithm}`);
    lines.push(`# Total Cost: ${path.totalWeight} | Delay: ${path.totalDelayMs} ms | Min Bandwidth: ${path.minBandwidthMbps} Mbps`);
    lines.push(``);
    lines.push(`Node_Path,${path.nodePath.join(' -> ')}`);
    lines.push(``);
    lines.push(`# LINK STATUS MATRIX`);
    lines.push(`Link_ID,Source,Target,Bandwidth_Mbps,Delay_ms,Weight_Cost,Status`);

    this.links.forEach((l) => {
      lines.push(`${l.id},${l.sourceId},${l.targetId},${l.bandwidthMbps},${l.propDelayMs},${l.weight},${l.active ? 'ACTIVE' : 'FAILED'}`);
    });

    lines.push(``);
    lines.push(`# ROUTING TABLES`);
    tables.forEach((entries, nodeId) => {
      lines.push(`Node_${nodeId}_Table`);
      lines.push(`Destination,NextHop,Cost`);
      entries.forEach((e) => {
        lines.push(`${e.destNodeId},${e.nextHopId},${e.cost}`);
      });
    });

    return lines.join('\n');
  }
}
