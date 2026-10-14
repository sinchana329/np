/**
 * @file EventLog.tsx
 * @brief Searchable and Filterable Real-time Event Telemetry Table
 * @project CSE Network Programming AAT Final-Year Project
 */

import React, { useState } from 'react';
import { EventRecord } from '../engine/types';
import { Terminal, Search, Filter } from 'lucide-react';

interface EventLogProps {
  events: EventRecord[];
  currentRttIndex: number;
}

export const EventLog: React.FC<EventLogProps> = ({ events, currentRttIndex }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Filter visible events up to current RTT
  const visibleEvents = events.filter((e) => e.rttIndex <= currentRttIndex);

  const filteredEvents = visibleEvents.filter((e) => {
    const matchesSearch =
      e.details.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase()) ||
      e.seqNum.toString().includes(search);

    if (filterType === 'ALL') return matchesSearch;
    if (filterType === 'DROPS')
      return matchesSearch && (e.type === 'DROP_QUEUE' || e.type === 'DROP_RANDOM');
    if (filterType === 'FAST_RETX') return matchesSearch && e.type === 'FAST_RETRANSMIT';
    if (filterType === 'TIMEOUT') return matchesSearch && e.type === 'RTO_TIMEOUT';
    return matchesSearch;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            Real-Time Socket & Packet Telemetry Log
          </h2>
          <span className="text-xs font-mono text-slate-400">
            ({filteredEvents.length} events logged)
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search seq#, event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'DROPS', label: 'Drops' },
              { id: 'FAST_RETX', label: 'FastRetx' },
              { id: 'TIMEOUT', label: 'Timeout' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterType === f.id
                    ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-64 border border-slate-800/80 rounded-lg">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
            <tr>
              <th className="py-2 px-3">RTT</th>
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3">Event Type</th>
              <th className="py-2 px-3">Seq#</th>
              <th className="py-2 px-3">CWND</th>
              <th className="py-2 px-3">Phase</th>
              <th className="py-2 px-3">Telemetry Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300 bg-slate-950/40">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No matching telemetry events recorded yet.
                </td>
              </tr>
            ) : (
              filteredEvents.slice().reverse().map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 font-bold text-cyan-400">#{e.rttIndex}</td>
                  <td className="py-2 px-3 text-slate-400">{e.timeMs.toFixed(0)} ms</td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        e.type === 'DROP_QUEUE' || e.type === 'DROP_RANDOM'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : e.type === 'FAST_RETRANSMIT'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : e.type === 'RTO_TIMEOUT'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {e.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-200">pkt_{e.seqNum}</td>
                  <td className="py-2 px-3 text-cyan-300">{e.cwndPackets.toFixed(1)}</td>
                  <td className="py-2 px-3 text-emerald-400">{e.state}</td>
                  <td className="py-2 px-3 text-slate-400 truncate max-w-xs">{e.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
