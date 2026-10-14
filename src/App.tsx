/**
 * @file App.tsx
 * @brief NetScope — Master Application Shell and Page Router
 * @project NetScope Platform - CSE Network Programming AAT Final-Year Project
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, NetScopePage } from './components/shell/Sidebar';
import { NetScopeHeader } from './components/shell/NetScopeHeader';
import { LandingDashboard } from './components/dashboard/LandingDashboard';

// TCP Simulator Module (Page 1)
import { Header } from './components/Header';
import { ParameterPanel } from './components/ParameterPanel';
import { CwndChart } from './components/CwndChart';
import { PacketDiagram } from './components/PacketDiagram';
import { KpiCards } from './components/KpiCards';
import { EventLog } from './components/EventLog';
import { ComparisonView } from './components/ComparisonView';
import { AlgorithmsExplanation } from './components/AlgorithmsExplanation';
import { VivaSection } from './components/VivaSection';
import { ProjectReportView } from './components/ProjectReportView';

// Routing Module (Page 2)
import { RoutingSimulatorPage } from './components/routing/RoutingSimulatorPage';

// New Labs (Pages 3, 4, 5, 6, 7)
import { ArqLabPage } from './components/arq/ArqLabPage';
import { LowGuardPage } from './components/security/LowGuardPage';
import { PcapInspectorPage } from './components/pcap/PcapInspectorPage';
import { BenchmarkingLabPage } from './components/benchmarking/BenchmarkingLabPage';
import { UnifiedDashboardPage } from './components/monitoring/UnifiedDashboardPage';

import { NetworkConfig, SimulationResult } from './engine/types';
import { TcpEngineBridge, DEFAULT_CONFIG } from './engine/TcpEngineBridge';

export default function App() {
  const [activePage, setActivePage] = useState<NetScopePage>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // TCP Simulator Sub-tab State
  const [activeTcpTab, setActiveTcpTab] = useState<'simulator' | 'algorithms' | 'comparison' | 'viva' | 'report'>('simulator');
  const [tcpConfig, setTcpConfig] = useState<NetworkConfig>(DEFAULT_CONFIG);
  const [simulationResult, setSimulationResult] = useState<SimulationResult>(() =>
    TcpEngineBridge.runSimulation(DEFAULT_CONFIG)
  );

  const [currentRttIndex, setCurrentRttIndex] = useState<number>(0);
  const [isRunningTcp, setIsRunningTcp] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Re-run TCP simulation when configuration changes
  useEffect(() => {
    const newResult = TcpEngineBridge.runSimulation(tcpConfig);
    setSimulationResult(newResult);
    setCurrentRttIndex(0);
    setIsRunningTcp(false);
  }, [tcpConfig]);

  // Playback loop for TCP Simulator
  useEffect(() => {
    if (isRunningTcp && activePage === 'tcp') {
      const intervalMs = Math.max(50, 400 / playbackSpeed);
      timerRef.current = setInterval(() => {
        setCurrentRttIndex((prev) => {
          if (prev >= tcpConfig.totalRttsToSimulate) {
            setIsRunningTcp(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunningTcp, playbackSpeed, tcpConfig.totalRttsToSimulate, activePage]);

  const handleStartTcp = () => {
    if (currentRttIndex >= tcpConfig.totalRttsToSimulate) {
      setCurrentRttIndex(0);
    }
    setIsRunningTcp(true);
  };

  const handlePauseTcp = () => {
    setIsRunningTcp(false);
  };

  const handleStepTcp = () => {
    if (currentRttIndex < tcpConfig.totalRttsToSimulate) {
      setCurrentRttIndex((prev) => prev + 1);
    }
  };

  const handleResetTcp = () => {
    setIsRunningTcp(false);
    setCurrentRttIndex(0);
  };

  const handleExportCsv = () => {
    TcpEngineBridge.downloadCsv(simulationResult);
  };

  const handleApplyBottleneckToTcp = (bottleneckProps: Partial<NetworkConfig>) => {
    setTcpConfig((prev) => ({
      ...prev,
      ...bottleneckProps,
    }));
  };

  const currentSnapshot = simulationResult.snapshots[currentRttIndex] || simulationResult.snapshots[0];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex font-sans">
      {/* Sidebar Navigation Shell */}
      <Sidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <NetScopeHeader
          activePage={activePage}
          onExportCurrentCsv={handleExportCsv}
        />

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
          {/* PAGE 0: LANDING DASHBOARD HUB */}
          {activePage === 'dashboard' && (
            <LandingDashboard onSelectPage={setActivePage} />
          )}

          {/* PAGE 1: TCP CONGESTION CONTROL SIMULATOR */}
          {activePage === 'tcp' && (
            <div className="space-y-6">
              {/* Secondary Navigation Bar for TCP Sub-tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-mono">
                {[
                  { id: 'simulator', label: 'Interactive Simulator' },
                  { id: 'comparison', label: 'Algorithm Comparison' },
                  { id: 'algorithms', label: 'Rules & Specs' },
                  { id: 'viva', label: 'Viva Q&A Suite' },
                  { id: 'report', label: 'Project Report' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTcpTab(tab.id as any)}
                    className={`py-1.5 px-3 rounded-lg font-bold transition-all ${
                      activeTcpTab === tab.id
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTcpTab === 'simulator' && (
                <div className="space-y-6">
                  <KpiCards metrics={simulationResult.metrics} />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-4 h-full">
                      <ParameterPanel
                        config={tcpConfig}
                        onChangeConfig={setTcpConfig}
                        isRunning={isRunningTcp}
                        onStart={handleStartTcp}
                        onPause={handlePauseTcp}
                        onStep={handleStepTcp}
                        onReset={handleResetTcp}
                        playbackSpeed={playbackSpeed}
                        setPlaybackSpeed={setPlaybackSpeed}
                        currentRtt={currentRttIndex}
                        totalRtts={tcpConfig.totalRttsToSimulate}
                      />
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                      <CwndChart
                        snapshots={simulationResult.snapshots}
                        currentRttIndex={currentRttIndex}
                      />

                      <PacketDiagram
                        config={tcpConfig}
                        currentSnapshot={currentSnapshot}
                        isRunning={isRunningTcp}
                      />
                    </div>
                  </div>

                  <EventLog
                    events={simulationResult.eventLog}
                    currentRttIndex={currentRttIndex}
                  />
                </div>
              )}

              {activeTcpTab === 'comparison' && (
                <ComparisonView initialConfig={tcpConfig} />
              )}

              {activeTcpTab === 'algorithms' && (
                <AlgorithmsExplanation />
              )}

              {activeTcpTab === 'viva' && (
                <VivaSection />
              )}

              {activeTcpTab === 'report' && (
                <ProjectReportView />
              )}
            </div>
          )}

          {/* PAGE 2: NETWORK TOPOLOGY AND ROUTING SIMULATOR */}
          {activePage === 'routing' && (
            <RoutingSimulatorPage
              onApplyBottleneckToTcp={handleApplyBottleneckToTcp}
              onNavigateToTcpSim={() => {
                setActivePage('tcp');
                setActiveTcpTab('simulator');
              }}
            />
          )}

          {/* PAGE 3: RELIABLE TRANSPORT PROTOCOL LAB (ARQ) */}
          {activePage === 'arq' && <ArqLabPage />}

          {/* PAGE 4: LOWGUARD LIGHTWEIGHT NETWORK FLOOD DETECTION */}
          {activePage === 'lowguard' && <LowGuardPage />}

          {/* PAGE 5: PACKET AND PROTOCOL INSPECTOR (PCAP) */}
          {activePage === 'pcap' && <PcapInspectorPage />}

          {/* PAGE 6: NETWORK PERFORMANCE BENCHMARKING LAB */}
          {activePage === 'benchmarking' && <BenchmarkingLabPage />}

          {/* PAGE 7: UNIFIED NETWORK MONITORING DASHBOARD */}
          {activePage === 'monitoring' && <UnifiedDashboardPage />}
        </main>

        {/* Platform Footer */}
        <footer className="border-t border-slate-800/80 bg-[#080C14] py-3.5 px-6 text-center text-xs font-mono text-slate-400">
          <p>
            NetScope — Integrated Network Simulation, Protocol Analysis and Performance Optimization Platform · CSE Final Project
          </p>
        </footer>
      </div>
    </div>
  );
}
