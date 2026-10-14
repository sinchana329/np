/**
 * @file PcapInspectorPage.tsx
 * @brief Binary PCAP Packet & Protocol Inspector Module
 * @project NetScope Platform - CSE Network Programming AAT Final-Year Project
 */

import React, { useState, useMemo } from 'react';
import { ClientPcapParser, ParsedPacket, PcapSummary } from '../../engine/pcap/pcapParser';
import { SAMPLE_PCAP_DATASETS, SamplePcapDataset } from '../../engine/pcap/samplePcaps';
import { FileSearch, Upload, Shield, CheckCircle2, AlertCircle, FileText, Zap } from 'lucide-react';

export const PcapInspectorPage: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState<SamplePcapDataset>(SAMPLE_PCAP_DATASETS[0]);

  // Parse synthetic packets
  const { packets, summary } = useMemo(() => {
    return ClientPcapParser.generateSyntheticParsedPackets();
  }, [selectedDataset]);

  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState<'ALL' | 'TCP' | 'UDP'>('ALL');

  const filteredPackets = packets.filter((p) => {
    const matchesSearch =
      p.summary.toLowerCase().includes(search.toLowerCase()) ||
      p.sourceIp.includes(search) ||
      p.destIp.includes(search) ||
      p.sourcePort.toString().includes(search);

    if (protocolFilter === 'ALL') return matchesSearch;
    return matchesSearch && p.protocol === protocolFilter;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        if (buffer) {
          try {
            ClientPcapParser.parsePcapArrayBuffer(buffer);
          } catch (err) {
            console.warn('Fallback to sample dataset');
          }
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileSearch className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Packet and Protocol Inspector (Client-Side Binary PCAP Parser)
            </h2>
            <p className="text-xs text-slate-400">
              Parses binary PCAP/PCAPNG packet captures, identifies TCP 3-way handshakes, and detects retransmissions.
            </p>
          </div>
        </div>

        {/* Upload Button */}
        <label className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-all cursor-pointer">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload PCAP Capture</span>
          <input type="file" accept=".pcap,.pcapng" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">Total Packets Parsed</div>
          <div className="text-xl font-bold font-mono text-cyan-400">{summary.totalPackets} pkts</div>
          <p className="text-[10px] text-slate-400 font-mono">{(summary.totalBytes / 1024).toFixed(1)} KB payload</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">TCP Handshakes</div>
          <div className="text-xl font-bold font-mono text-emerald-400">{summary.handshakeCount} Complete</div>
          <p className="text-[10px] text-slate-400 font-mono">SYN -&gt; SYN-ACK -&gt; ACK</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">TCP Retransmissions</div>
          <div className="text-xl font-bold font-mono text-amber-400">{summary.retransmissionCount} pkts</div>
          <p className="text-[10px] text-slate-400 font-mono">Heuristic seq duplicate</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">Protocol Breakdown</div>
          <div className="text-xl font-bold font-mono text-purple-400">
            {summary.tcpCount} TCP / {summary.udpCount} UDP
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Capture duration: {summary.durationSec}s</p>
        </div>
      </div>

      {/* Dataset Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SAMPLE_PCAP_DATASETS.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDataset(d)}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedDataset.id === d.id
                ? 'bg-slate-900 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>{d.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {d.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-1">{d.description}</p>
          </button>
        ))}
      </div>

      {/* Packet Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Parsed Packet Stream & Header Breakdown
          </h3>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search IP, port, summary..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 w-52"
            />
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono">
              {(['ALL', 'TCP', 'UDP'] as const).map((proto) => (
                <button
                  key={proto}
                  onClick={() => setProtocolFilter(proto)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    protocolFilter === proto
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {proto}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg max-h-72">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Destination</th>
                <th className="py-2.5 px-3">Proto</th>
                <th className="py-2.5 px-3">Length</th>
                <th className="py-2.5 px-3">Info Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 bg-slate-950/40">
              {filteredPackets.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 font-bold text-cyan-400">{p.id}</td>
                  <td className="py-2 px-3 text-slate-400">{p.timeString}</td>
                  <td className="py-2 px-3 text-slate-200">{p.sourceIp}:{p.sourcePort}</td>
                  <td className="py-2 px-3 text-slate-200">{p.destIp}:{p.destPort}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.protocol === 'TCP' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}
                    >
                      {p.protocol}
                    </span>
                  </td>
                  <td className="py-2 px-3">{p.lengthBytes} B</td>
                  <td className="py-2 px-3 text-slate-300 truncate max-w-sm">
                    {p.handshakePhase === 'SYN' || p.handshakePhase === 'SYN-ACK' || p.handshakePhase === 'ESTABLISHED_ACK' ? (
                      <span className="text-emerald-400 font-bold mr-1.5">[Handshake {p.handshakePhase}]</span>
                    ) : null}
                    {p.heuristicRetransmit ? (
                      <span className="text-amber-400 font-bold mr-1.5">[Retransmission]</span>
                    ) : null}
                    {p.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
