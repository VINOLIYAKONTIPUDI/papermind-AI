import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Info, Code, Calculator } from 'lucide-react';

export default function OverviewPage({ paper: activePaper, onStartReading }) {
  const [activePrereq, setActivePrereq] = useState(null);

  const paper = {
    title: activePaper?.title || 'Attention Is All You Need',
    authors: activePaper?.authors ? (Array.isArray(activePaper.authors) ? activePaper.authors : [activePaper.authors]) : ['Vaswani et al.'],
    journal: activePaper?.journal || 'NeurIPS 2017',
    doi: activePaper?.doi || '10.48550/arXiv.1706.03762',
    year: activePaper?.publication_year || 2017,
    domain: activePaper?.domain_tag || 'Deep Learning / Sequence Models',
    type: activePaper?.paper_type || 'Empirical Study',
    readingTime: activePaper?.reading_time_mins || 40,
    difficulty: activePaper?.difficulty_rating || 5,
    mathComplexity: activePaper?.math_complexity || 4,
    codeComplexity: activePaper?.code_complexity || 3,
    prerequisites: activePaper?.prerequisites?.map(p => typeof p === 'string' ? { name: p, explanation: 'Prerequisite concept key for understanding document mathematical modeling.' } : p) || [
      { name: 'Recurrent Neural Networks (RNN)', explanation: 'Understanding sequential hidden state updates h_t = f(W h_{t-1} + U x_t) and vanishing gradients.' },
      { name: 'Vector Dot Products', explanation: 'Mathematical inner product q · k computing cosine similarity between feature vectors.' },
      { name: 'Encoder-Decoder Architecture', explanation: 'Mapping input sequences into continuous latent vectors before decoding output tokens.' }
    ],
    outcomes: activePaper?.learning_outcomes || [
      'Master Scaled Dot-Product Attention: Softmax(Q K^T / √d_k) V formulation.',
      'Understand Multi-Head Linear Projections across h = 8 parallel attention heads.',
      'Analyze Sinusoidal Positional Encodings eliminating the need for recurrence.'
    ]
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-violet-950/60 via-zinc-900 to-indigo-950/60 border border-violet-500/40 glass-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glow-violet">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-violet-600/30 text-violet-300 text-xs font-semibold border border-violet-500/40">
              {paper.domain}
            </span>
            <span className="text-zinc-500 text-xs font-mono">{paper.year} • {paper.journal}</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-white">{paper.title}</h1>
          <p className="text-xs text-zinc-400 max-w-2xl">{paper.authors.join(', ')}</p>
        </div>

        <button
          onClick={onStartReading}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-heading font-bold text-sm flex items-center gap-3 transition-all shadow-xl shadow-violet-900/50 glow-violet hover:scale-105 shrink-0"
        >
          <BookOpen className="w-5 h-5" />
          <span>Start Reading Session</span>
        </button>
      </div>

      {/* Complexity Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 glass-panel text-center space-y-2">
          <div className="text-xs text-zinc-400">Reading Difficulty</div>
          <div className="text-xl font-heading font-bold text-amber-400">★★★★★ ({paper.difficulty}/5)</div>
          <div className="text-[10px] text-zinc-500">Advanced Academic Density</div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 glass-panel text-center space-y-2">
          <div className="text-xs text-zinc-400">Estimated Duration</div>
          <div className="text-xl font-heading font-bold text-emerald-400">{paper.readingTime} Minutes</div>
          <div className="text-[10px] text-zinc-500">Based on historical reading rate</div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 glass-panel text-center space-y-2">
          <div className="text-xs text-zinc-400 flex items-center justify-center gap-1"><Calculator className="w-3.5 h-3.5 text-violet-400" /> Math Complexity</div>
          <div className="text-xl font-heading font-bold text-violet-300">Level {paper.mathComplexity} / 5</div>
          <div className="text-[10px] text-zinc-500">Matrix Multiplications & Softmax</div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 glass-panel text-center space-y-2">
          <div className="text-xs text-zinc-400 flex items-center justify-center gap-1"><Code className="w-3.5 h-3.5 text-indigo-400" /> Code Density</div>
          <div className="text-xl font-heading font-bold text-indigo-300">Level {paper.codeComplexity} / 5</div>
          <div className="text-[10px] text-zinc-500">PyTorch / CUDA Implementation</div>
        </div>
      </div>

      {/* Prerequisites & Outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prerequisites */}
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 glass-panel space-y-4">
          <h3 className="font-heading font-bold text-base text-zinc-100 flex items-center gap-2">
            <Info className="w-4 h-4 text-violet-400" /> Required Concept Prerequisites
          </h3>
          <div className="space-y-2">
            {paper.prerequisites.map((p, idx) => (
              <div 
                key={idx}
                onClick={() => setActivePrereq(activePrereq === p.name ? null : p.name)}
                className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-violet-500/50 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                  <span>{p.name}</span>
                  <span className="text-violet-400 text-[10px]">Click to explain →</span>
                </div>
                {activePrereq === p.name && (
                  <p className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60 leading-relaxed font-mono animate-in fade-in duration-150">
                    {p.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Expected Learning Outcomes */}
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 glass-panel space-y-4">
          <h3 className="font-heading font-bold text-base text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Expected Learning Outcomes
          </h3>
          <div className="space-y-3 text-xs text-zinc-300">
            {paper.outcomes.map((o, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                  #{idx + 1}
                </div>
                <span>{o}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
