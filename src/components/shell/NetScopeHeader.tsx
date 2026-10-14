/**
 * @file NetScopeHeader.tsx
 * @brief Top Bar with Breadcrumbs, System Health Badge, and Quick Export Actions
 * @project NetScope Platform - CSE Network Programming AAT Final-Year Project
 */

import React from 'react';
import { NetScopePage } from './Sidebar';
import { Download, ChevronRight, Activity, Cpu } from 'lucide-react';

interface NetScopeHeaderProps {
  activePage: NetScopePage;
  onExportCurrentCsv: () => void;
}

const PAGE_NAMES: Record<NetScopePage, string> = {
  dashboard: '0. Platform Landing Hub',
  tcp: '1. TCP Congestion Control Simulator',
  routing: '2. Network Topology & Routing Simulator',
  arq: '3. Reliable ARQ Transport Protocol Lab',
  lowguard: '4. LowGuard Lightweight Flood Detection',
  pcap: '5. Packet and Protocol Inspector',
  benchmarking: '6. Network Performance Benchmarking Lab',
  monitoring: '7. Unified Network Monitoring Dashboard',
};

export const NetScopeHeader: React.FC<NetScopeHeaderProps> = ({
  activePage,
  onExportCurrentCsv,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between gap-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-slate-400">NetScope</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-cyan-400 font-bold">{PAGE_NAMES[activePage]}</span>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[11px] font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>C++ Core Engine Online</span>
        </div>

        <button
          onClick={onExportCurrentCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>
    </header>
  );
};
