# NetScope — Integrated Network Simulation, Protocol Analysis and Performance Optimization Platform

A comprehensive, production-grade final-year CSE Network Programming platform combining 7 specialized laboratory modules inside a unified, responsive sidebar application shell.

> [!IMPORTANT]
> **Zero Regression Guarantee:**
> All existing, fully-functional modules — **Page 1: TCP Congestion Control Simulator** (Tahoe, Reno, NewReno) and **Page 2: Network Topology & Routing Simulator** (Dijkstra, Distance Vector, Interactive Canvas) — will be preserved in full without regressions.

---

## 1. Feature Status & Module Roadmap

| Module Page | Description | Current Status | Action |
| :--- | :--- | :--- | :--- |
| **0. Dashboard** | Landing Overview Dashboard with module cards and system telemetry | New | Implement Landing Hub |
| **1. TCP Congestion Simulator** | TCP Tahoe, Reno, NewReno, CWND Recharts, Packet Diagram | Verified Working | Preserve & Integrate |
| **2. Network Topology & Routing** | Interactive Topology Canvas, Dijkstra, Distance Vector, Link Failures | Verified Working | Preserve & Integrate |
| **3. Reliable Transport Lab (ARQ)** | Stop-and-Wait, Go-Back-N, Selective Repeat sliding window in C++ | New | Implement C++ ARQ Engine & UI |
| **4. LowGuard Flood Detection** | Sliding window flood detector, rate-limiting, confusion matrix | New | Implement LowGuard Engine & UI |
| **5. Packet & Protocol Inspector** | Client-side binary PCAP/PCAPNG parser, TCP 3-way handshake detector | New | Implement PCAP Parser & Inspector UI |
| **6. Performance Benchmarking Lab** | Cross-module experiment runner, batch scenario tests, CSV export | New | Implement Benchmarking Suite |
| **7. Unified Monitoring Dashboard** | Centralized network telemetry feed, alert logs, saved history | New | Implement Unified Dashboard |

---

## 2. System Architecture & NetScope Platform Shell

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              NETSCOPE PLATFORM SHELL (REACT)                            │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────────────────────┐  │
│  │ NetScope Sidebar        │  │ Top Header (Breadcrumbs, Status Badge, Quick Tools) │  │
│  │ - 0. Landing Dashboard  │  └─────────────────────────────────────────────────────┘  │
│  │ - 1. TCP Congestion     │  ┌─────────────────────────────────────────────────────┐  │
│  │ - 2. Topology & Routing │  │ Active Module Page View Area                         │  │
│  │ - 3. ARQ Transport Lab  │  │                                                     │  │
│  │ - 4. LowGuard Detection │  │ (Page 0, 1, 2, 3, 4, 5, 6, or 7)                    │  │
│  │ - 5. PCAP Inspector     │  │                                                     │  │
│  │ - 6. Benchmarking Lab   │  │                                                     │  │
│  │ - 7. Unified Dashboard  │  └─────────────────────────────────────────────────────┘  │
│  └─────────────────────────┘                                                           │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          C++ ENGINE & WASM INTERFACE LAYER                             │
│  - TCP Core (src/cpp/tcp_algorithms.cpp, tcp_simulator.cpp)                            │
│  - Routing Core (src/cpp/routing/dijkstra.cpp, distance_vector.cpp)                   │
│  - ARQ Core (src/cpp/arq/arq_algorithms.cpp): Stop-and-Wait, Go-Back-N, Selective Rep  │
│  - LowGuard Core (src/cpp/security/lowguard_detector.cpp): Token bucket & rate limits  │
│  - Native C++ Unit Tests (test_tcp_sim, test_routing_sim, test_arq_sim, test_lowguard) │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Specification for New Modules

### Page 3: Reliable Transport Protocol Lab (ARQ)
- **C++ ARQ Core (`src/cpp/arq/`)**:
  - `Stop-and-Wait ARQ`: Sender window = 1, waits for ACK before sending next sequence number.
  - `Go-Back-N ARQ`: Sender window $N > 1$, cumulative ACKs, retransmits all unacknowledged packets starting from lowest unACKed frame on timeout.
  - `Selective Repeat ARQ`: Sender window $N > 1$, receiver buffer window $N$, individual ACKs/NACKs, retransmits *only* specific timed-out frames.
- **Interactive UI (`src/components/arq/`)**:
  - Sliding Window Visualizer displaying sequence numbers, sender window boundary, receiver window boundary, and in-flight ACK pulses.
  - Controls for Window Size ($N$), Timeout (ms), Loss Rate (%), Network Delay, and Seed.
  - Performance Metrics: Transmissions, Retransmissions, Throughput, Efficiency Ratio.

### Page 4: LowGuard — Lightweight Network Flood Detection
- **Detection Engine (`src/cpp/security/`)**:
  - Sliding Time Window Detector measuring requests per second ($RPS$).
  - Dual Detection Modes: Fixed Threshold Detector and Exponentially Weighted Moving Average (EWMA) anomaly detector.
  - Bounded Local Socket Rate Limiter using Token-Bucket algorithm to accept or reject excess connections.
- **Evaluation & Confusion Matrix**:
  - Computes True Positives (TP), False Positives (FP), True Negatives (TN), False Negatives (FN), Precision %, Recall / Detection Rate %, and Detection Latency ms.

### Page 5: Packet and Protocol Inspector
- **Client-Side Binary PCAP Parser (`src/engine/pcap/`)**:
  - Binary ArrayBuffer parser reading PCAP (`0xa1b2c3d4` / `0xd4c3b2a1`) global headers and packet records.
  - Parses Ethernet, IPv4, TCP (SYN, ACK, FIN, RST, Window Size, Seq/Ack numbers), and UDP frames.
  - TCP 3-Way Handshake Detector identifying `SYN` $\to$ `SYN-ACK` $\to$ `ACK` connection establishment sequences.
  - Preloaded sample captures (`web_http_traffic.pcap`, `tcp_handshake_retransmit.pcap`) and drag-and-drop file upload.

### Page 6: Network Performance Benchmarking Lab
- **Batch Experiment Runner**:
  - Configures and runs sequential test scenarios across TCP algorithms, ARQ protocols, and LowGuard thresholds.
  - Overlays comparison charts and computes statistical mean/std-dev for Goodput and Latency.
  - Multi-dataset CSV Exporter.

### Page 7: Unified Network Monitoring Dashboard
- **Central Telemetry Feed**:
  - Consolidated view summarizing active TCP simulation runs, topology status, ARQ efficiency, LowGuard security alerts, and PCAP packet distributions.
  - LocalStorage persistence for experiment history and alert logs.

---

## 4. Implementation Step Plan & Verification

1. **Phase 1: NetScope Sidebar Shell & Landing Dashboard**
   - Build `Sidebar.tsx`, `NetScopeHeader.tsx`, `LandingDashboard.tsx`, and update `App.tsx` layout shell.

2. **Phase 2: Reliable Transport Lab (ARQ C++ Core & UI)**
   - Implement `src/cpp/arq/arq_algorithms.cpp`, `test_arq.cpp`, `src/engine/arqEngine.ts`, `ArqSlidingWindow.tsx`, and `ArqLabPage.tsx`.

3. **Phase 3: LowGuard Network Flood Detection (C++ & UI)**
   - Implement `src/cpp/security/lowguard_detector.cpp`, `test_lowguard.cpp`, `src/engine/lowguardEngine.ts`, and `LowGuardPage.tsx`.

4. **Phase 4: PCAP Packet Inspector & Parser**
   - Implement `src/engine/pcap/pcapParser.ts`, `samplePcaps.ts`, `PcapInspectorPage.tsx`, and `HandshakeViewer.tsx`.

5. **Phase 5: Performance Benchmarking Lab & Unified Dashboard**
   - Implement `BenchmarkingLabPage.tsx` and `UnifiedDashboardPage.tsx`.

6. **Phase 6: Verification & Final Polish**
   - Run `compile_applet` and `lint_applet` to confirm zero errors. Verify that all 7 pages operate smoothly without regressions.
