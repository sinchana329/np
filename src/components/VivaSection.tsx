/**
 * @file VivaSection.tsx
 * @brief Interactive Viva Preparation Suite & Examiner Practice Questions
 * @project CSE Network Programming AAT Final-Year Project
 */

import React, { useState } from 'react';
import { Award, HelpCircle, CheckCircle, RotateCcw, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';

interface VivaQuestion {
  id: string;
  category: 'Fundamentals' | 'Algorithms' | 'Queueing' | 'C++ Architecture';
  question: string;
  answer: string;
  examinerTip: string;
}

const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 'v1',
    category: 'Algorithms',
    question: 'How does TCP Reno differ from TCP Tahoe in loss handling?',
    answer:
      'TCP Tahoe resets CWND back to 1 packet and re-enters Slow Start upon receiving 3 duplicate ACKs or timing out. In contrast, TCP Reno introduces Fast Recovery: upon 3 duplicate ACKs, it sets ssthresh = cwnd/2, inflates cwnd = ssthresh + 3, retransmits the missing segment, and stays in Fast Recovery until a new ACK arrives, avoiding an unnecessary drop to CWND = 1.',
    examinerTip:
      'Emphasize that Reno avoids dropping to CWND=1 on 3 DupACKs, preserving high throughput on networks with occasional single packet drops.',
  },
  {
    id: 'v2',
    category: 'Algorithms',
    question: 'Why was TCP NewReno proposed as an enhancement over TCP Reno?',
    answer:
      'TCP Reno struggles when multiple packets are dropped from a single window because the first new ACK exits Fast Recovery, deflating CWND before subsequent lost packets are retransmitted. TCP NewReno introduces Partial ACK handling: if an ACK arrives that acknowledges some but not all segments sent before entering recovery (ACK < recoverSeq), NewReno stays in Fast Recovery and immediately retransmits the next missing segment.',
    examinerTip:
      'Mention the "recoverSeq" variable which tracks the highest sequence number transmitted prior to entering Fast Recovery.',
  },
  {
    id: 'v3',
    category: 'Fundamentals',
    question: 'What is the distinction between Offered Throughput and Receiver Goodput?',
    answer:
      'Offered Throughput measures the total volume of data transmitted over the link per unit time, including both initial segment transmissions and retransmissions. Receiver Goodput measures only the unique, non-duplicate user payload bytes successfully acknowledged by the receiver per unit time.',
    examinerTip:
      'Goodput is always less than or equal to Offered Throughput. The ratio (Goodput / Offered Throughput) represents protocol efficiency.',
  },
  {
    id: 'v4',
    category: 'Queueing',
    question: 'What is Bufferbloat and how does it affect TCP performance?',
    answer:
      'Bufferbloat occurs when bottleneck routers feature excessively large queue buffers. Rather than dropping packets early to signal congestion to TCP senders, the router holds packets in long queues, causing massive RTT spikes, severe latency jitter, and delayed window adjustments.',
    examinerTip:
      'Refer to your simulation preset #3 (Bufferbloat) where large queue sizes inflate queueing delay significantly while keeping loss low.',
  },
  {
    id: 'v5',
    category: 'C++ Architecture',
    question: 'How is the C++ simulation engine compiled to WebAssembly for browser execution?',
    answer:
      'The core C++ simulation engine is built using standard C++20 classes (`TCPSimulator`, `TcpAlgorithm`, `RouterQueue`). For browser execution, Emscripten (`emcc`) compiles the C++ codebase into a `.wasm` WebAssembly binary and JavaScript glue code (`tcp_sim_wasm.js`). Exposed `extern "C"` functions receive configuration parameters from React, execute the native C++ event loop, and return serialized JSON metrics.',
    examinerTip:
      'Highlight that all algorithm decisions originate from the modular C++ state machine, ensuring high performance and academic rigor.',
  },
  {
    id: 'v6',
    category: 'Fundamentals',
    question: 'What is AIMD and why is it necessary for TCP stability?',
    answer:
      'AIMD stands for Additive Increase Multiplicative Decrease. When ACKs arrive successfully in Congestion Avoidance, CWND increases additively (+1 segment per RTT). When congestion occurs (drops/dupACKs), CWND decreases multiplicatively (halving ssthresh). AIMD is mathematically proven to guarantee convergence to fairness and efficiency among competing TCP flows.',
    examinerTip:
      'Draw or describe the classic "sawtooth" waveform of CWND during AIMD operation.',
  },
];

export const VivaSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('v1');
  const [flashcardIdx, setFlashcardIdx] = useState<number>(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState<boolean>(false);

  const filteredQuestions = VIVA_QUESTIONS.filter(
    (q) => activeCategory === 'ALL' || q.category === activeCategory
  );

  const currentFlashcard = VIVA_QUESTIONS[flashcardIdx];

  const nextFlashcard = () => {
    setShowFlashcardAnswer(false);
    setFlashcardIdx((prev) => (prev + 1) % VIVA_QUESTIONS.length);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Academic Viva Preparation & Examiner Q&A Suite
            </h2>
            <p className="text-xs text-slate-400">
              Interactive practice questions, flashcards, and examiner tips for your project viva presentation.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Flashcard Simulator */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-cyan-400 font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Interactive Viva Practice Flashcard #{flashcardIdx + 1} of {VIVA_QUESTIONS.length}</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {currentFlashcard.category}
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4 min-h-[160px] flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white tracking-wide">
              {currentFlashcard.question}
            </h3>
            {showFlashcardAnswer && (
              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
                <p>{currentFlashcard.answer}</p>
                <div className="p-2.5 bg-cyan-950/40 border border-cyan-800/40 rounded text-[11px] text-cyan-300 font-mono">
                  💡 <strong>Examiner Tip:</strong> {currentFlashcard.examinerTip}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all"
            >
              {showFlashcardAnswer ? 'Hide Answer' : 'Reveal Answer'}
            </button>

            <button
              onClick={nextFlashcard}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all flex items-center gap-1"
            >
              <span>Next Card</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Accordion Questions List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white">
            Comprehensive Examiner Questions & Answers List
          </h3>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono">
            {['ALL', 'Fundamentals', 'Algorithms', 'Queueing', 'C++ Architecture'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredQuestions.map((q) => {
            const isExpanded = expandedId === q.id;
            return (
              <div
                key={q.id}
                className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                >
                  <span className="text-xs font-bold text-white tracking-wide">
                    {q.question}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {q.category}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 space-y-3 text-xs text-slate-300">
                    <p className="leading-relaxed">{q.answer}</p>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded text-[11px] text-cyan-300 font-mono">
                      <strong>Examiner Key Takeaway:</strong> {q.examinerTip}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
