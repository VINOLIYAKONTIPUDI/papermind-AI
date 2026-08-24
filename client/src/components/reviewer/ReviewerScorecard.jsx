import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { fetchPeerReview } from '../../lib/api';

export default function ReviewerScorecard({ paperId }) {
  const [reviewData, setReviewData] = useState(null);

  useEffect(() => {
    async function loadReview() {
      if (paperId) {
        const data = await fetchPeerReview(paperId);
        if (data) setReviewData(data);
      }
    }
    loadReview();
  }, [paperId]);

  const defaultReview = {
    title: 'Attention Is All You Need',
    overall_score: 8.8,
    acceptance_verdict: 'Accept (Oral Presentation)',
    confidence_score: 5,
    strengths: [
      'Presents a revolutionary paradigm shift in NLP & Sequence Modeling by completely eliminating recurrent & convolutional bottlenecks.',
      'Empirical results achieve state-of-the-art BLEU scores (28.4 BLEU on Eng-Ger) while training in 1/4th the time of previous SOTA models.',
      'Mathematical formulation of Scaled Dot-Product Attention is elegant, rigorously motivated, and intuitive.'
    ],
    weaknesses: [
      'Quadratic memory cost O(N^2) with respect to sequence length limits native long-document processing (>2048 tokens).',
      'Ablation studies could provide more granular insights on positional encodings vs relative attention masks.'
    ],
    novel_contributions: [
      'Multi-head linear projection attention mechanism.',
      'Sinusoidal positional encoding formulation for non-recurrent token sequences.'
    ]
  };

  const review = reviewData || defaultReview;

  return (
    <div className="w-full h-full bg-zinc-950 p-8 overflow-y-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-900/40 via-zinc-900 to-indigo-900/40 border border-violet-500/40 glass-panel flex flex-col md:flex-row items-center justify-between gap-6 glow-violet">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-violet-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" /> NeurIPS Simulated Peer Review Suite
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-white">{review.title}</h1>
          <p className="text-xs text-zinc-400">Automated AI Peer Evaluation Matrix & Novelty Verification Engine</p>
        </div>

        {/* Radial Gauge Container */}
        <div className="flex items-center gap-6 bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
          <div className="text-center">
            <div className="text-3xl font-heading font-extrabold text-emerald-400">{review.overall_score} / 10</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Overall Quality</div>
          </div>
          <div className="h-10 w-px bg-zinc-800" />
          <div className="text-center">
            <div className="text-xs font-heading font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {review.acceptance_verdict}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 flex items-center justify-center gap-1">
              <span>Confidence:</span>
              <span className="text-amber-400 font-bold">★★★★★ ({review.confidence_score}/5)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-emerald-500/30 glass-panel space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-heading font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" /> Key Strengths
          </div>
          <ul className="space-y-3 text-xs text-zinc-300">
            {review.strengths.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/20">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-amber-500/30 glass-panel space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-heading font-bold text-sm">
            <AlertTriangle className="w-4 h-4" /> Methodological Limitations
          </div>
          <ul className="space-y-3 text-xs text-zinc-300">
            {review.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-amber-950/20 p-3 rounded-xl border border-amber-500/20">
                <span className="text-amber-400 font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Novelty Contributions */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-violet-500/30 glass-panel space-y-4">
        <div className="flex items-center gap-2 text-violet-400 font-heading font-bold text-sm">
          <Lightbulb className="w-4 h-4" /> Primary Novel Contributions
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
          {review.novel_contributions.map((n, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
                #{idx + 1}
              </div>
              <div>{n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
