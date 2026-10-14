/**
 * @file Sidebar.tsx
 * @brief NetScope Professional Collapsible Navigation Sidebar
 * @project NetScope Platform - CSE Network Programming AAT Final-Year Project
 */

import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Network,
  RotateCcw,
  ShieldAlert,
  FileSearch,
  BarChart3,
  MonitorCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type NetScopePage =
  | 'dashboard'
  | 'tcp'
  | 'routing'
  | 'arq'
  | 'lowguard'
  | 'pcap'
  | 'benchmarking'
  | 'monitoring';

interface SidebarProps {
  activePage: NetScopePage;
  onSelectPage: (page: NetScopePage) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  isCollapsed,
  onToggleCollapse,
}) => {
  const menuItems: { id: NetScopePage; label: string; icon: React.ReactNode; category: string }[] = [
    { id: 'dashboard', label: '0. Platform Landing Hub', icon: <LayoutDashboard className="w-4 h-4" />, category: 'Overview' },
    { id: 'tcp', label: '1. TCP Congestion Lab', icon: <Activity className="w-4 h-4" />, category: 'Transport Layer' },
    { id: 'routing', label: '2. Network Topology & Routing', icon: <Network className="w-4 h-4" />, category: 'Network Layer' },
    { id: 'arq', label: '3. Reliable ARQ Transport Lab', icon: <RotateCcw className="w-4 h-4" />, category: 'Transport Layer' },
    { id: 'lowguard', label: '4. LowGuard Flood Detection', icon: <ShieldAlert className="w-4 h-4" />, category: 'Security' },
    { id: 'pcap', label: '5. PCAP Packet Inspector', icon: <FileSearch className="w-4 h-4" />, category: 'Packet Analysis' },
    { id: 'benchmarking', label: '6. Performance Benchmarking', icon: <BarChart3 className="w-4 h-4" />, category: 'Analytics' },
    { id: 'monitoring', label: '7. Unified Monitoring Feed', icon: <MonitorCheck className="w-4 h-4" />, category: 'Analytics' },
  ];

  return (
    <aside
      className={`bg-[#080C14] border-r border-slate-800/80 transition-all duration-300 flex flex-col justify-between select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
              NS
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">NetScope</h1>
              <p className="text-[10px] font-mono text-cyan-400/80">NetProg Laboratory</p>
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors mx-auto"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</div>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 text-center">
          CSE NetProg AAT v2.5
        </div>
      )}
    </aside>
  );
};
