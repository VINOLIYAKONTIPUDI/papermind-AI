import React, { useState, useEffect } from 'react';
import { Search, Sparkles, BookOpen, BrainCircuit, HelpCircle, GitFork, X } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, setCurrentTab, papers = [], onSelectPaper }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { label: 'Open Active PDF Workspace', tab: 'workspace', category: 'Quick Actions', icon: BookOpen },
    { label: 'View Mind Map Breakdown', tab: 'mindmap', category: 'Quick Actions', icon: GitFork },
    { label: 'Launch Flashcards Arena', tab: 'flashcards', category: 'Quick Actions', icon: BrainCircuit },
    { label: 'Take Adaptive Comprehension Quiz', tab: 'quiz', category: 'Quick Actions', icon: HelpCircle }
  ];

  const paperActions = papers.map(p => ({
    id: p.id,
    label: p.title,
    tab: 'workspace',
    category: 'Uploaded Paper',
    icon: Sparkles
  }));

  const actions = [...quickActions, ...paperActions];
  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-start justify-center pt-24 px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden glass-panel">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800">
          <Search className="w-5 h-5 text-violet-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search papers, flashcards, or type /quiz..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (action.id && onSelectPaper) {
                      onSelectPaper(action.id);
                    }
                    setCurrentTab(action.tab);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/80 text-left group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800 group-hover:bg-violet-600/20 text-zinc-400 group-hover:text-violet-400 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-200 group-hover:text-violet-300 line-clamp-1">{action.label}</div>
                      <div className="text-[10px] text-zinc-500">{action.category}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono bg-zinc-800 px-2 py-1 rounded">Select ↵</span>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-zinc-500 text-sm">No matching research actions found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
