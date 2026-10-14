# TCP Congestion Control Performance Simulator
## CSE Network Programming AAT Final-Year Academic Project

An interactive, high-fidelity WebAssembly-accelerated TCP Congestion Control Simulator and Academic Dashboard.

---

## 1. Project Overview

This application simulates and evaluates the behavior of **TCP Tahoe**, **TCP Reno**, and **TCP NewReno** congestion-control algorithms. Built using a modular **C++20 core simulation engine** compiled to **WebAssembly**, it models:
- **Slow Start** exponential growth
- **Congestion Avoidance** linear AIMD window scaling
- **Fast Retransmit & Fast Recovery** dynamics
- **Duplicate ACK thresholding** (3 DupACK trigger)
- **Retransmission Timeout (RTO)** fallback
- **Finite-capacity bottleneck router queueing** with tail-drop policy
- **Independent random packet loss** and deterministic random seed reproducibility

---

## 2. Directory Structure

```
.
├── CMakeLists.txt                 # Native C++ & Emscripten WASM CMake build script
├── README.md                      # Comprehensive project documentation & guide
├── index.html                     # HTML Entry Point
├── package.json                   # React & Vite Dependencies
├── src/
│   ├── App.tsx                    # Main Dashboard Application Root
│   ├── components/
│   │   ├── Header.tsx             # 3-Zone Top Navigation Contract
│   │   ├── ParameterPanel.tsx     # Network Sliders & Execution Controls
│   │   ├── CwndChart.tsx          # Recharts CWND vs RTT Line Chart
│   │   ├── PacketDiagram.tsx      # Animated Topology & Bottleneck Queue Stage
│   │   ├── KpiCards.tsx           # Performance Metrics Summary Cards
│   │   ├── EventLog.tsx           # Searchable Socket & Packet Telemetry Log
│   │   ├── ComparisonView.tsx     # Multi-Algorithm Benchmark Comparison View
│   │   ├── AlgorithmsExplanation.tsx # Rules, Equations, & State Machines Guide
│   │   ├── VivaSection.tsx        # Interactive Practice Questions & Flashcards
│   │   └── ProjectReportView.tsx  # Academic Project Report Draft
│   ├── cpp/
│   │   ├── tcp_simulator.hpp      # C++ Header (Structures & Classes)
│   │   ├── tcp_algorithms.cpp     # C++ Implementation of Tahoe, Reno, NewReno
│   │   ├── tcp_simulator.cpp      # C++ Discrete-Event Step Engine
│   │   ├── wasm_bridge.cpp        # Emscripten C-API WebAssembly Export Bridge
│   │   ├── main.cpp               # Native C++ CLI Executable
│   │   └── tests/
│   │       └── test_tcp.cpp       # Native C++ Unit Test Suite
│   └── engine/
│       ├── types.ts               # TypeScript Type Definitions
│       ├── TcpSimulatorEngine.ts  # Mirrored C++ Engine in TypeScript
│       └── TcpEngineBridge.ts     # Orchestration, Scenarios, & CSV Exporter
```

---

## 3. Native C++ Executable Build & Execution

To compile and run the native C++ CLI simulator and unit tests on Linux / macOS / Windows terminal:

### Prerequisites
- GCC / Clang compiler with C++20 support (`g++` >= 10 or `clang++` >= 11)
- CMake (>= 3.16)

### Building with CMake
```bash
# 1. Create build directory
mkdir -p build && cd build

# 2. Configure project
cmake ..

# 3. Build native CLI simulator and unit tests
make -j4

# 4. Run native CLI simulator
./tcp_sim_cli

# 5. Run native C++ unit tests
./test_tcp_sim
```

### Direct Compilation with g++ (Alternative)
```bash
# Compile CLI binary directly
g++ -std=c++20 -O3 src/cpp/tcp_algorithms.cpp src/cpp/tcp_simulator.cpp src/cpp/main.cpp -o tcp_sim_cli

# Run binary
./tcp_sim_cli
```

---

## 4. WebAssembly (WASM) Compilation with Emscripten

To recompile the C++ engine to WebAssembly (`.wasm` and JS glue code):

```bash
# 1. Activate Emscripten SDK environment
source /path/to/emsdk/emsdk_env.sh

# 2. Compile C++ core to WebAssembly module
emcc -std=c++20 -O3 \
  src/cpp/tcp_algorithms.cpp \
  src/cpp/tcp_simulator.cpp \
  src/cpp/wasm_bridge.cpp \
  -s WASM=1 \
  -s EXPORTED_RUNTIME_METHODS="['cwrap','ccall']" \
  -s EXPORTED_FUNCTIONS="['_run_tcp_simulation_wasm','_free_wasm_string']" \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORT_ES6=1 \
  -s MODULARIZE=1 \
  -o src/engine/tcp_sim_wasm.js
```

---

## 5. Web Frontend Run Commands

```bash
# 1. Install Node.js dependencies
npm install

# 2. Start Vite development server on port 3000
npm run dev

# 3. Build production bundle
npm run build
```

---

## 6. Academic Viva Preparation Summary

1. **How does TCP Reno differ from TCP Tahoe?**
   - Tahoe resets CWND back to 1 on 3 duplicate ACKs. Reno introduces Fast Recovery, setting `ssthresh = cwnd/2` and `cwnd = ssthresh + 3`, avoiding an explicit drop to 1.
2. **Why use TCP NewReno?**
   - NewReno handles partial ACKs during Fast Recovery without exiting early, avoiding unnecessary RTO timeouts when multiple segments are lost in a single window.
3. **What is the difference between Offered Throughput and Goodput?**
   - Offered Throughput includes initial transmissions and retransmitted overhead. Goodput measures unique acknowledged payload payload bytes delivered per second.
