/**
 * @file Header.tsx
 * @brief Top Navigation Bar supporting TCP Simulator & Routing Topology Pages
 * @project CSE Network Programming AAT Final-Year Project Expansion
 */

import React from 'react';
import { Download, Activity, Cpu, BookOpen, Award, FileText, Network } from 'lucide-react';

interface HeaderProps {
  pageMode: 'tcp' | 'routing';
  setPageMode: (mode: 'tcp' | 'routing') => void;
  activeTab: 'simulator' | 'algorithms' | 'comparison' | 'viva' | 'report';
  setActiveTab: (tab: 'simulator' | 'algorithms' | 'comparison' | 'viva' | 'report') => void;
  onExportCsv: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageMode,
  setPageMode,
  activeTab,
  setActiveTab,
  onExportCsv,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between gap-8">
      {/* Zone 1: Single element brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
          NET
        </div>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setPageMode('tcp');
            setActiveTab('simulator');
          }}
          className="text-base font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          NetProg-Sim <span className="text-xs font-mono font-normal text-cyan-400/80 ml-1.5">// CSE AAT Project</span>
        </a>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-300">
        {/* Module Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 mr-4">
          <button
            onClick={() => {
              setPageMode('tcp');
              setActiveTab('simulator');
            }}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-md transition-all whitespace-nowrap ${
              pageMode === 'tcp'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>TCP Congestion Simulator</span>
          </button>

          <button
            onClick={() => {
              setPageMode('routing');
            }}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-md transition-all whitespace-nowrap ${
              pageMode === 'routing'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Network Topology & Routing</span>
          </button>
        </div>

        {/* TCP Specific Tabs (shown when in TCP mode) */}
        {pageMode === 'tcp' && (
          <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`py-1 px-2.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'text-cyan-400 font-bold bg-slate-800'
                  : 'hover:text-white'
              }`}
            >
              Simulator
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`py-1 px-2.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === 'comparison'
                  ? 'text-cyan-400 font-bold bg-slate-800'
                  : 'hover:text-white'
              }`}
            >
              Algorithm Comparison
            </button>

            <button
              onClick={() => setActiveTab('algorithms')}
              className={`py-1 px-2.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === 'algorithms'
                  ? 'text-cyan-400 font-bold bg-slate-800'
                  : 'hover:text-white'
              }`}
            >
              Rules
            </button>

            <button
              onClick={() => setActiveTab('viva')}
              className={`py-1 px-2.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === 'viva'
                  ? 'text-cyan-400 font-bold bg-slate-800'
                  : 'hover:text-white'
              }`}
            >
              Viva Q&A
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`py-1 px-2.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === 'report'
                  ? 'text-cyan-400 font-bold bg-slate-800'
                  : 'hover:text-white'
              }`}
            >
              Report
            </button>
          </div>
        )}
      </nav>

      {/* Zone 3: 1 primary action button */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onExportCsv}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>
    </header>
  );
};
