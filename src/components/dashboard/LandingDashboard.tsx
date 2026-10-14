/**
 * @file LandingDashboard.tsx
 * @brief NetScope Landing Hub with Module Descriptions & Quick Navigation
 * @project NetScope Platform - CSE Network Programming AAT Final-Year Project
 */

import React from 'react';
import { NetScopePage } from '../shell/Sidebar';
import {
  Activity,
  Network,
  RotateCcw,
  ShieldAlert,
  FileSearch,
  BarChart3,
  MonitorCheck,
  ArrowRight,
  Cpu,
  Award,
} from 'lucide-react';

interface LandingDashboardProps {
  onSelectPage: (page: NetScopePage) => void;
}

export const LandingDashboard: React.FC<LandingDashboardProps> = ({ onSelectPage }) => {
  const modules = [
    {
      id: 'tcp' as NetScopePage,
      title: '1. TCP Congestion Control Simulator',
      category: 'Transport Layer',
      description: 'Simulates TCP Tahoe, Reno, and NewReno state machines over bottleneck links with CWND Recharts plots and Packet topology diagrams.',
      icon: <Activity className="w-5 h-5 text-cyan-400" />,
      badge: 'C++ WASM Engine',
    },
    {
      id: 'routing' as NetScopePage,
      title: '2. Network Topology & Routing',
      category: 'Network Layer',
      description: 'Drag-and-drop network topology builder, C++ Dijkstra shortest path algorithm, Distance Vector tables, and instant link failover.',
      icon: <Network className="w-5 h-5 text-cyan-400" />,
      badge: 'Dijkstra & DV',
    },
    {
      id: 'arq' as NetScopePage,
      title: '3. Reliable ARQ Transport Lab',
      category: 'Transport Layer',
      description: 'Interactive sliding-window visualizer comparing Stop-and-Wait, Go-Back-N, and Selective Repeat ARQ protocols.',
      icon: <RotateCcw className="w-5 h-5 text-cyan-400" />,
      badge: 'Sliding Window',
    },
    {
      id: 'lowguard' as NetScopePage,
      title: '4. LowGuard Flood Detection',
      category: 'Security & Monitoring',
      description: 'Sliding window flood detector, token-bucket rate limiter, and confusion matrix precision/recall evaluator.',
      icon: <ShieldAlert className="w-5 h-5 text-cyan-400" />,
      badge: 'Confusion Matrix',
    },
    {
      id: 'pcap' as NetScopePage,
      title: '5. PCAP Packet Inspector',
      category: 'Packet Analysis',
      description: 'Client-side binary PCAP parser, TCP 3-way handshake identifier, and heuristic packet loss/retransmission inspector.',
      icon: <FileSearch className="w-5 h-5 text-cyan-400" />,
      badge: 'Binary Parser',
    },
    {
      id: 'benchmarking' as NetScopePage,
      title: '6. Performance Benchmarking Lab',
      category: 'Analytics',
      description: 'Cross-module experiment batch runner executing multi-parameter scenario tests with statistical CSV export.',
      icon: <BarChart3 className="w-5 h-5 text-cyan-400" />,
      badge: 'Batch Runner',
    },
    {
      id: 'monitoring' as NetScopePage,
      title: '7. Unified Network Monitoring Dashboard',
      category: 'Analytics & History',
      description: 'Centralized network telemetry feed summarizing active simulation runs, security alerts, and persisted experiment logs.',
      icon: <MonitorCheck className="w-5 h-5 text-cyan-400" />,
      badge: 'Telemetry Feed',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-base">
            NS
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              NetScope — Integrated Network Simulation & Protocol Analysis
            </h1>
            <p className="text-xs font-mono text-cyan-400">
              Computer Science & Engineering Final-Year Academic Platform
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl pt-1">
          Welcome to NetScope. This integrated laboratory environment features 7 specialized modules powered by modern C++ core algorithms compiled to WebAssembly. Explore transport layer congestion control, network graph routing, ARQ sliding windows, flood security detection, PCAP packet analysis, and performance benchmarking.
        </p>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((m) => (
          <div
            key={m.id}
            onClick={() => onSelectPage(m.id)}
            className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between hover:shadow-lg hover:shadow-cyan-500/5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
                    {m.icon}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {m.category}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                  {m.badge}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                {m.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {m.description}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-mono text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
              <span>Open Module</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
