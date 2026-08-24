import React, { useState, useEffect } from 'react';
import { Columns, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { fetchComparison } from '../lib/api';

export default function ComparePage({ papers = [], defaultPaperA }) {
  const [syncScroll, setSyncScroll] = useState(true);
  const [paperAId, setPaperAId] = useState(defaultPaperA || 'paper-attention-2017');
  const [paperBId, setPaperBId] = useState('paper-reformer-2020');
  const [comparisonData, setComparisonData] = useState(null);

  useEffect(() => {
    async function loadComparison() {
      const data = await fetchComparison(paperAId, paperBId);
      if (data) setComparisonData(data);
    }
    loadComparison();
  }, [paperAId, paperBId]);

  const defaultComparison = {
    paper1: {
      title: 'Attention Is All You Need',
      authors: 'Vaswani et al. (2017)',
      architecture: 'Standard Transformer (Encoder-Decoder)',
      attention_complexity: 'O(N^2) Time & Space',
      key_dataset: 'WMT 2014 Eng-to-Ger (4.5M pairs)',
      best_metric: '28.4 BLEU Score',
      limitations: 'Quadratic GPU RAM growth for sequence length > 2048.'
    },
    paper2: {
      title: 'Reformer: The Efficient Transformer',
      authors: 'Kitaev et al. (2020)',
      architecture: 'LSH Attention + Reversible Layers',
      attention_complexity: 'O(N log N) Time & Space',
      key_dataset: 'enwik8 & WMT Translation',
      best_metric: '1.05 Bits per Byte',
      limitations: 'Locality-Sensitive Hashing constant factors overhead.'
    },
    conflicting_conclusions: [
      'Paper 1 asserts full dense softmax attention is mandatory for maximum accuracy; Paper 2 proves LSH buckets achieve matching BLEU with fraction of memory.',
      'Paper 1 stores all layer activation maps; Paper 2 uses reversible residual layers to recompute activation maps on backprop pass.'
    ]
  };

  const comp = comparisonData || defaultComparison;

  return (
    <div className="w-full min-h-screen bg-zinc-950 p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-violet-400 font-mono text-xs font-semibold">
            <Columns className="w-4 h-4" /> Side-by-Side Paper Comparison Suite
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-white">Comparative Methodology Analysis</h1>
        </div>

        <button
          onClick={() => setSyncScroll(!syncScroll)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
            syncScroll ? 'bg-violet-600/20 text-violet-300 border-violet-500/40' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>{syncScroll ? 'Synchronized Scroll Enabled' : 'Independent Scroll'}</span>
        </button>
      </div>

      {/* Dual Paper Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <label className="text-[11px] font-mono text-violet-400 uppercase tracking-wider block">Target Paper A</label>
          <select
            value={paperAId}
            onChange={(e) => setPaperAId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 font-semibold outline-none focus:border-violet-500"
          >
            {papers.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
            {papers.length === 0 && <option value="paper-attention-2017">Attention Is All You Need</option>}
          </select>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <label className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block">Target Paper B</label>
          <select
            value={paperBId}
            onChange={(e) => setPaperBId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 font-semibold outline-none focus:border-indigo-500"
          >
            {papers.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
            {papers.length === 0 && <option value="paper-reformer-2020">Reformer: The Efficient Transformer</option>}
          </select>
        </div>
      </div>

      {/* AI Comparison Matrix Table */}
      <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 glass-panel space-y-6 shadow-2xl">
        <h3 className="font-heading font-bold text-base text-zinc-100">Architectural & Metric Comparison Matrix</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                <th className="p-3">Metric Feature</th>
                <th className="p-3 text-violet-300">Paper A ({comp.paper1.title})</th>
                <th className="p-3 text-indigo-300">Paper B ({comp.paper2.title})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              <tr>
                <td className="p-3 font-semibold text-zinc-400">Core Layer Architecture</td>
                <td className="p-3 font-mono">{comp.paper1.architecture}</td>
                <td className="p-3 font-mono">{comp.paper2.architecture}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-zinc-400">Attention Time Complexity</td>
                <td className="p-3 font-mono text-amber-400">{comp.paper1.attention_complexity}</td>
                <td className="p-3 font-mono text-emerald-400">{comp.paper2.attention_complexity}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-zinc-400">Evaluation Dataset</td>
                <td className="p-3">{comp.paper1.key_dataset || comp.paper1.dataset}</td>
                <td className="p-3">{comp.paper2.key_dataset || comp.paper2.dataset}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-zinc-400">Peak Performance Benchmark</td>
                <td className="p-3 font-bold text-emerald-400">{comp.paper1.best_metric || comp.paper1.metric}</td>
                <td className="p-3 font-bold text-emerald-400">{comp.paper2.best_metric || comp.paper2.metric}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-zinc-400">Primary Limitation</td>
                <td className="p-3 text-zinc-400">{comp.paper1.limitations || comp.paper1.limitation}</td>
                <td className="p-3 text-zinc-400">{comp.paper2.limitations || comp.paper2.limitation}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Conflicting Conclusions Checklist */}
      <div className="p-6 rounded-3xl bg-zinc-900/80 border border-amber-500/30 glass-panel space-y-4">
        <h3 className="font-heading font-bold text-sm text-amber-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Detected Conflicting Theoretical Assumptions
        </h3>
        <div className="space-y-3 text-xs text-zinc-300">
          {(comp.conflicting_conclusions || comp.conflicts || []).map((c, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
