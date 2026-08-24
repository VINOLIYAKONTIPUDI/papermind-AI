import React from 'react';
import { Flame, Target, Award, BrainCircuit, Plus, Clock, Star } from 'lucide-react';

export default function Dashboard({ papers = [], activePaperId, onSelectPaper, onGoToUpload, setCurrentTab }) {
  const defaultList = [
    {
      id: 'paper-attention-2017',
      title: 'Attention Is All You Need',
      authors: 'Vaswani et al. (Google Brain)',
      publication_year: 2017,
      domain_tag: 'Deep Learning',
      difficulty_rating: 5,
      reading_time_mins: 40
    },
    {
      id: 'paper-resnet-2015',
      title: 'Deep Residual Learning for Image Recognition',
      authors: 'Kaiming He et al.',
      publication_year: 2016,
      domain_tag: 'Computer Vision',
      difficulty_rating: 4,
      reading_time_mins: 30
    },
    {
      id: 'paper-reformer-2020',
      title: 'Reformer: The Efficient Transformer',
      authors: 'Kitaev et al.',
      publication_year: 2020,
      domain_tag: 'Efficiency',
      difficulty_rating: 5,
      reading_time_mins: 45
    }
  ];

  const paperList = papers.length > 0 ? papers : defaultList;

  return (
    <div className="w-full min-h-screen bg-zinc-950 p-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white">Research Command Center</h1>
          <p className="text-xs text-zinc-400">Welcome back, Researcher! You are on a 7-day study streak. 🔥</p>
        </div>
        <button
          onClick={onGoToUpload}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-heading font-bold text-xs flex items-center gap-2 transition-all shadow-xl shadow-violet-900/40 glow-violet"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Paper</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Streak Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-amber-500/30 glass-panel flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold border border-amber-500/40">
            🔥
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-white">7 Days</div>
            <div className="text-[11px] text-zinc-400">Active Learning Streak</div>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-violet-500/30 glass-panel flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center text-xl font-bold border border-violet-500/40">
            <Target className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-heading font-bold text-white">2 / 3</div>
            <div className="text-[11px] text-zinc-400">Weekly Papers Read</div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-violet-500 h-full w-[66%]" />
            </div>
          </div>
        </div>

        {/* Due Flashcards Notification */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-emerald-500/30 glass-panel flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold border border-emerald-500/40">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-white">5 Cards</div>
            <div className="text-[11px] text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => setCurrentTab('flashcards')}>
              Due for Review Today →
            </div>
          </div>
        </div>

        {/* Badges Showcase */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-indigo-500/30 glass-panel flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold border border-indigo-500/40">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-heading font-bold text-white">RAG Champion</div>
            <div className="text-[11px] text-zinc-400">Scored 100% on 5 Quizzes</div>
          </div>
        </div>
      </div>

      {/* GitHub-Style Study Heatmap */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-zinc-100">Yearly Research Event Activity Heatmap</h3>
          <span className="text-[10px] text-zinc-500 font-mono">142 Total Study Hours</span>
        </div>
        <div className="grid grid-cols-12 gap-2 pt-2">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className={`h-5 rounded-md ${
                i % 7 === 0 ? 'bg-violet-500 glow-violet' : i % 3 === 0 ? 'bg-violet-700/60' : i % 2 === 0 ? 'bg-zinc-800' : 'bg-zinc-900'
              }`}
              title={`Study Session #${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Recent Uploaded Papers Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-zinc-100">Recent Papers Library</h3>
          <span className="text-xs text-violet-400 font-semibold cursor-pointer" onClick={() => setCurrentTab('workspace')}>View Active Workspace →</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paperList.map((p) => {
            const authorStr = Array.isArray(p.authors) ? p.authors.join(', ') : (p.authors || 'Academic Author');
            const isSelected = p.id === activePaperId;

            return (
              <div
                key={p.id}
                onClick={() => onSelectPaper(p.id)}
                className={`p-6 rounded-2xl bg-zinc-900/80 border ${
                  isSelected ? 'border-violet-500 shadow-violet-900/40 glow-violet' : 'border-zinc-800/80 hover:border-violet-500/50'
                } glass-panel space-y-4 cursor-pointer transition-all hover:scale-[1.02] group shadow-xl`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-violet-600/20 text-violet-300 text-[10px] font-semibold border border-violet-500/30">
                    {p.domain_tag || p.domain || 'Research'}
                  </span>
                  <span className="text-zinc-500 text-xs font-mono">{p.publication_year || p.year || 2024}</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-sm text-zinc-100 group-hover:text-violet-300 transition-colors line-clamp-2">
                    {p.title}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-1">{authorStr}</p>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{p.reading_time_mins || 30} mins</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{p.difficulty_rating || 4}/5</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
