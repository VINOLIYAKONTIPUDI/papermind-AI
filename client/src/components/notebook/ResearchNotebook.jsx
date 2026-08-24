import React, { useState } from 'react';
import { BookOpen, Edit3, Bookmark, Save, Trash2, PenTool, Check } from 'lucide-react';

export default function ResearchNotebook() {
  const [notes, setNotes] = useState([
    {
      id: '1',
      title: 'Self-Attention Softmax Scaling Rationale',
      content: 'Scaling by sqrt(d_k) prevents extremely small gradients when d_k is large. High dimensionality causes dot products to grow large, pushing softmax into extreme regions.',
      pageAnchor: 4,
      date: '2026-08-06'
    },
    {
      id: '2',
      title: 'Positional Encodings Formulation',
      content: 'Uses PE(pos, 2i) = sin(pos / 10000^(2i/d_model)). Allows the model to easily learn relative positions by linear functions.',
      pageAnchor: 5,
      date: '2026-08-06'
    }
  ]);

  const [activeNote, setActiveNote] = useState(notes[0]);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="w-full h-full bg-zinc-900 border-l border-zinc-800 flex flex-col glass-panel">
      {/* Notebook Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-violet-400" />
          <h3 className="font-heading font-bold text-sm text-zinc-100">Research Notebook</h3>
        </div>
        <button 
          onClick={handleSave} 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-500 transition-colors shadow-md shadow-violet-900/40"
        >
          {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isSaved ? 'Saved!' : 'Save Notes'}</span>
        </button>
      </div>

      {/* Main Notebook Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Notes List Column */}
        <div className="w-1/3 border-r border-zinc-800 p-2 space-y-1 overflow-y-auto">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => setActiveNote(note)}
              className={`w-full p-3 rounded-xl text-left transition-all ${
                activeNote?.id === note.id ? 'bg-violet-600/20 border border-violet-500/40 text-violet-300' : 'hover:bg-zinc-800/60 text-zinc-400'
              }`}
            >
              <div className="font-semibold text-xs text-zinc-200 truncate">{note.title}</div>
              <div className="text-[10px] text-zinc-500 mt-1 flex items-center justify-between">
                <span>Anchor: p.{note.pageAnchor}</span>
                <span>{note.date}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Note Editor Column */}
        <div className="flex-1 p-4 flex flex-col space-y-3 bg-zinc-950/60">
          <input
            type="text"
            value={activeNote?.title || ''}
            onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
            className="w-full bg-transparent font-heading font-bold text-sm text-zinc-100 border-b border-zinc-800 pb-2 focus:outline-none focus:border-violet-500"
            placeholder="Note Title..."
          />
          <textarea
            value={activeNote?.content || ''}
            onChange={(e) => setActiveNote({ ...activeNote, content: e.target.value })}
            rows={10}
            className="w-full flex-1 bg-transparent text-xs text-zinc-300 leading-relaxed font-mono focus:outline-none resize-none"
            placeholder="Write your research notes, key formulas, or insights..."
          />
        </div>
      </div>
    </div>
  );
}
