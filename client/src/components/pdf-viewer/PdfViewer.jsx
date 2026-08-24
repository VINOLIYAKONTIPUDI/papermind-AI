import React, { useState } from 'react';
import { Sparkles, GitFork, BrainCircuit, MessageSquare, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PdfViewer({ paper, chunks, activePage, setActivePage, onTriggerAction }) {
  const [selectedText, setSelectedText] = useState('');
  const [popoverPos, setPopoverPos] = useState(null);
  const [highlightColor, setHighlightColor] = useState('bg-yellow-500/30');
  const [searchQuery, setSearchQuery] = useState('');

  const handleMouseUp = (e) => {
    const text = window.getSelection().toString().trim();
    if (text.length > 3) {
      setSelectedText(text);
      setPopoverPos({ x: Math.min(window.innerWidth - 300, Math.max(10, e.clientX)), y: Math.max(70, e.clientY - 60) });
    } else {
      setPopoverPos(null);
    }
  };

  // Default fallback text if paper has no parsed chunks
  const paperTitle = paper?.title || 'Attention Is All You Need';
  const paperAuthors = paper?.authors ? (Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors) : 'Vaswani et al.';
  const paperMeta = `${paper?.journal || 'NeurIPS'} • ${paper?.publication_year || 2017} • DOI: ${paper?.doi || '10.48550/arXiv.1706.03762'}`;
  
  const totalPages = Math.max(15, ...chunks.map(c => c.page_number || 1));

  // Filter chunks for current page or show all if search/filter applied
  const pageChunks = chunks.length > 0
    ? chunks.filter(c => c.page_number === activePage || (searchQuery && c.content.toLowerCase().includes(searchQuery.toLowerCase())))
    : [];

  return (
    <div className="relative w-full h-full bg-zinc-950 flex flex-col overflow-hidden" onMouseUp={handleMouseUp}>
      {/* PDF Controls Header */}
      <div className="h-12 border-b border-zinc-800/80 bg-zinc-900/80 px-4 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-3 overflow-hidden max-w-md">
          <span className="font-semibold text-zinc-200 truncate" title={paperTitle}>{paperTitle}</span>
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] shrink-0">
            Page {activePage} of {totalPages}
          </span>
        </div>

        {/* Search input in header */}
        <div className="hidden sm:flex items-center bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 focus-within:border-violet-500/50">
          <Search className="w-3.5 h-3.5 text-zinc-400 mr-1.5" />
          <input
            type="text"
            placeholder="Search paper text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-zinc-200 outline-none w-32 placeholder-zinc-500"
          />
        </div>

        {/* Page navigation & highlight controls */}
        <div className="flex items-center gap-2">
          {['bg-yellow-500/40', 'bg-emerald-500/40', 'bg-pink-500/40', 'bg-blue-500/40'].map((color, i) => (
            <button 
              key={i} 
              onClick={() => setHighlightColor(color)} 
              className={`w-4 h-4 rounded-full ${color} border border-white/20 hover:scale-110 transition-transform`} 
              title="Change Highlight Color"
            />
          ))}
          <button 
            onClick={() => setActivePage(Math.max(1, activePage - 1))} 
            className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setActivePage(Math.min(totalPages, activePage + 1))} 
            className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 flex items-center gap-1"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PDF Canvas Body */}
      <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-zinc-950/80">
        <div className="w-full max-w-3xl bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6 text-zinc-200 leading-relaxed font-reader selection:bg-violet-500/40 selection:text-white">
          
          {/* Header Title & Metadata */}
          <div className="text-center border-b border-zinc-800 pb-6 font-heading space-y-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{paperTitle}</h1>
            <p className="text-xs text-zinc-400">{paperAuthors}</p>
            <p className="text-[10px] text-violet-400 font-mono">{paperMeta}</p>
          </div>

          {/* Abstract / Summary Card */}
          {paper?.summary && (
            <div className="space-y-2">
              <h3 className="font-heading font-semibold text-xs text-violet-300 uppercase tracking-wider">Document Overview & Abstract</h3>
              <div className="text-sm text-zinc-300 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/80">
                <mark className={`${highlightColor} text-white px-1.5 py-0.5 rounded`}>
                  {paper.summary}
                </mark>
              </div>
            </div>
          )}

          {/* Extracted Section Chunks */}
          {pageChunks.length > 0 ? (
            <div className="space-y-6 pt-2">
              {pageChunks.map((chunk, idx) => (
                <div key={chunk.id || idx} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-violet-400 font-heading border-b border-zinc-800/50 pb-1">
                    <span>{chunk.section_name || `Section Page ${chunk.page_number}`}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Page {chunk.page_number} • Chunk #{chunk.chunk_index ?? idx}</span>
                  </div>
                  <p className="text-sm text-zinc-200 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/60 leading-relaxed">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              <div className="space-y-3">
                <h3 className="font-heading font-semibold text-xs text-violet-300 uppercase tracking-wider">3. Model Architecture</h3>
                <p className="text-sm text-zinc-300">
                  Most competitive neural sequence transduction models have an encoder-decoder structure. Here, the encoder maps an input sequence of symbol representations (x1, ..., xn) to a sequence of continuous representations z = (z1, ..., zn). Given z, the decoder then generates an output sequence (y1, ..., ym) of symbols one element at a time.
                </p>
                <div className="bg-zinc-950 p-5 rounded-xl border border-violet-500/30 text-center space-y-2 font-mono text-xs text-violet-300 glow-violet my-4">
                  <div className="font-bold text-white">Scaled Dot-Product Attention</div>
                  <div>Attention(Q, K, V) = softmax( (Q K<sup>T</sup>) / √d<sub>k</sub> ) V</div>
                </div>
                <p className="text-sm text-zinc-300">
                  An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors. The output is computed as a weighted sum of the values.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Floating Action Popover on Text Selection */}
      {popoverPos && (
        <div 
          style={{ top: popoverPos.y, left: popoverPos.x }}
          className="fixed z-50 transform -translate-x-1/2 bg-zinc-900 border border-violet-500/50 rounded-xl shadow-2xl p-1.5 flex items-center gap-1 glass-panel animate-in zoom-in-95 duration-150 glow-violet"
        >
          <button 
            onClick={() => { onTriggerAction('simplify', selectedText); setPopoverPos(null); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-violet-600/20 text-violet-300 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" /> Simplify
          </button>
          <button 
            onClick={() => { onTriggerAction('visualize', selectedText); setPopoverPos(null); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-emerald-600/20 text-emerald-300 text-xs font-semibold"
          >
            <GitFork className="w-3.5 h-3.5" /> Visualize
          </button>
          <button 
            onClick={() => { onTriggerAction('flashcard', selectedText); setPopoverPos(null); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-amber-600/20 text-amber-300 text-xs font-semibold"
          >
            <BrainCircuit className="w-3.5 h-3.5" /> Save Card
          </button>
          <button 
            onClick={() => { onTriggerAction('askTutor', selectedText); setPopoverPos(null); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-indigo-600/20 text-indigo-300 text-xs font-semibold"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Ask Tutor
          </button>
        </div>
      )}
    </div>
  );
}
