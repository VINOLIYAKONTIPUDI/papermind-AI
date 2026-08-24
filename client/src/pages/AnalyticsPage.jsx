import React from 'react';
import { BarChart3, TrendingUp, Clock, Award, BrainCircuit, Target } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="w-full min-h-screen bg-zinc-950 p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-white">Study Analytics & Subject Mastery</h1>
        <p className="text-xs text-zinc-400">Track your comprehension progress, flashcard retention, and duration logs over time.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 glass-panel space-y-2">
          <div className="text-xs text-zinc-400 flex items-center justify-between">
            <span>Average Quiz Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-heading font-bold text-emerald-400">92%</div>
          <div className="text-[10px] text-zinc-500">+4% higher than last week</div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 glass-panel space-y-2">
          <div className="text-xs text-zinc-400 flex items-center justify-between">
            <span>Total Study Hours</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-3xl font-heading font-bold text-violet-400">14.5 Hrs</div>
          <div className="text-[10px] text-zinc-500">6 papers synthesized this month</div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 glass-panel space-y-2">
          <div className="text-xs text-zinc-400 flex items-center justify-between">
            <span>Mastered Concepts</span>
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-heading font-bold text-indigo-400">24 Concepts</div>
          <div className="text-[10px] text-zinc-500">Leitner Level 4 & 5</div>
        </div>
      </div>

      {/* Mastery Growth Chart Simulation */}
      <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 glass-panel space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-zinc-100">Knowledge Retention & Mastery Progression</h3>
          <span className="text-[10px] font-mono text-zinc-400">Weekly Cumulative Metric</span>
        </div>

        <div className="h-48 flex items-end justify-between gap-4 pt-8 pb-2 px-4 border-b border-zinc-800">
          {[40, 55, 65, 78, 85, 92].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="text-[10px] font-mono text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">{height}%</div>
              <div 
                style={{ height: `${height}%` }}
                className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-violet-600 to-indigo-500 transition-all group-hover:brightness-125 glow-violet" 
              />
              <span className="text-[10px] text-zinc-500 font-mono">Week {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
