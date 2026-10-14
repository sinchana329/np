/**
 * @file RoutingEventLog.tsx
 * @brief Telemetry Log for Routing Events, Link Failures, and Rerouting
 * @project CSE Network Programming AAT Final-Year Project Expansion
 */

import React, { useState } from 'react';
import { RoutingEventRecord } from '../../engine/routingTypes';
import { Terminal, Search } from 'lucide-react';

interface RoutingEventLogProps {
  events: RoutingEventRecord[];
}

export const RoutingEventLog: React.FC<RoutingEventLogProps> = ({ events }) => {
  const [search, setSearch] = useState('');

  const filteredEvents = events.filter((e) =>
    e.details.toLowerCase().includes(search.toLowerCase()) ||
    e.eventType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            Network Routing Telemetry & Failover Log
          </h2>
          <span className="text-xs font-mono text-slate-400">
            ({filteredEvents.length} events logged)
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search routing events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 w-48"
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-56 border border-slate-800 rounded-lg">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
            <tr>
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3">Event Type</th>
              <th className="py-2 px-3">Event Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300 bg-slate-950/40">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-slate-400">
                  No routing events logged yet. Try toggling a link status or switching algorithms.
                </td>
              </tr>
            ) : (
              filteredEvents.slice().reverse().map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 text-slate-400">
                    {new Date(e.timestampMs).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        e.eventType === 'LINK_FAILURE'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : e.eventType === 'LINK_RESTORE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      {e.eventType}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-200">{e.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
