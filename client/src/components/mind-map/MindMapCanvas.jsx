import React, { useState, useEffect } from 'react';
import { GitFork, ChevronRight, ExternalLink, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { fetchMindMap } from '../../lib/api';

export default function MindMapCanvas({ paperId, onNodePageClick }) {
  const [expandedNodes, setExpandedNodes] = useState({ 'root': true, 'branch-1': true, 'branch-2': true, 'branch-3': true, 'branch-4': true });
  const [zoom, setZoom] = useState(1);
  const [mindmap, setMindmap] = useState(null);

  useEffect(() => {
    async function loadMindMap() {
      if (paperId) {
        const data = await fetchMindMap(paperId);
        if (data) setMindmap(data);
      }
    }
    loadMindMap();
  }, [paperId]);

  const toggleNode = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const defaultBranches = [
    {
      id: 'branch-1',
      title: '1. Problem & Core Philosophy',
      color: 'border-violet-500/50 bg-violet-950/30 text-violet-300',
      children: [
        { id: 'b1-1', title: 'Sequential bottlenecks in RNNs (LSTM, GRU)', page: 1 },
        { id: 'b1-2', title: 'Eliminating Recurrence & Convolutions completely', page: 2 }
      ]
    },
    {
      id: 'branch-2',
      title: '2. Multi-Head Scaled Attention Architecture',
      color: 'border-indigo-500/50 bg-indigo-950/30 text-indigo-300',
      children: [
        { id: 'b2-1', title: 'Scaled Dot-Product Attention: Softmax(Q K^T / √d_k) V', page: 4 },
        { id: 'b2-2', title: 'Multi-Head Linear Projections (h = 8 heads)', page: 4 },
        { id: 'b2-3', title: 'Sinusoidal Positional Encoding & Residual Connections', page: 5 }
      ]
    },
    {
      id: 'branch-3',
      title: '3. Empirical Results & Benchmarks',
      color: 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300',
      children: [
        { id: 'b3-1', title: 'WMT 2014 English-to-German: 28.4 BLEU (+2.0 SOTA)', page: 7 },
        { id: 'b3-2', title: 'Trained on 8 NVIDIA P100 GPUs for 3.5 Days', page: 8 }
      ]
    },
    {
      id: 'branch-4',
      title: '4. Critical Limitations & Future Extensions',
      color: 'border-amber-500/50 bg-amber-950/30 text-amber-300',
      children: [
        { id: 'b4-1', title: 'Quadratic Memory Complexity O(N^2)', page: 9 },
        { id: 'b4-2', title: 'Foundation for GPT-4, BERT, & LLaMA Models', page: 10 }
      ]
    }
  ];

  const colors = [
    'border-violet-500/50 bg-violet-950/30 text-violet-300',
    'border-indigo-500/50 bg-indigo-950/30 text-indigo-300',
    'border-emerald-500/50 bg-emerald-950/30 text-emerald-300',
    'border-amber-500/50 bg-amber-950/30 text-amber-300'
  ];

  const branches = mindmap?.children ? mindmap.children.map((b, idx) => ({
    id: b.id,
    title: b.label,
    color: colors[idx % colors.length],
    children: b.children ? b.children.map(c => ({ id: c.id, title: c.label, page: c.page_number || 1 })) : []
  })) : defaultBranches;

  const rootTitle = mindmap?.label || 'Attention Is All You Need';

  return (
    <div className="w-full h-full bg-zinc-950 flex flex-col overflow-hidden relative glass-panel">
      {/* Mind Map Canvas Toolbar */}
      <div className="h-12 border-b border-zinc-800 bg-zinc-900/80 px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-violet-400" />
          <span className="font-heading font-bold text-sm text-zinc-100">Hierarchical Paper Mind Map</span>
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">Interactive Bezier Tree</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))} className="p-1.5 bg-zinc-800 rounded-lg text-zinc-300 hover:text-white"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={() => setZoom(prev => Math.max(0.6, prev - 0.1))} className="p-1.5 bg-zinc-800 rounded-lg text-zinc-300 hover:text-white"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={() => setZoom(1)} className="p-1.5 bg-zinc-800 rounded-lg text-zinc-300 hover:text-white"><RotateCcw className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Mind Map Canvas Grid */}
      <div className="flex-1 overflow-auto p-12 flex items-center justify-center bg-zinc-950/80">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }} className="transition-transform duration-200 flex flex-col items-center gap-10 min-w-[900px]">
          
          {/* Root Card Node */}
          <div className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 border border-violet-400 text-white font-heading font-extrabold text-lg shadow-2xl shadow-violet-900/50 glow-violet flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <span>{rootTitle}</span>
          </div>

          {/* SVG Connecting Bezier Curve Lines */}
          <svg className="w-full h-12 overflow-visible">
            <path d="M 450 0 C 450 24, 150 24, 150 48" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 450 0 C 450 24, 350 24, 350 48" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 450 0 C 450 24, 550 24, 550 48" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 450 0 C 450 24, 750 24, 750 48" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
          </svg>

          {/* Branch Level 1 Nodes Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {branches.map((branch) => (
              <div key={branch.id} className="space-y-3">
                <button
                  onClick={() => toggleNode(branch.id)}
                  className={`w-full p-4 rounded-xl border text-left font-heading font-bold text-xs shadow-lg transition-all flex items-center justify-between ${branch.color}`}
                >
                  <span>{branch.title}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${expandedNodes[branch.id] ? 'rotate-90' : ''}`} />
                </button>

                {/* Sub-branch Leaf Nodes */}
                {expandedNodes[branch.id] && (
                  <div className="pl-3 space-y-2 border-l-2 border-zinc-800 ml-3 animate-in fade-in duration-200">
                    {branch.children.map((child) => (
                      <div 
                        key={child.id}
                        className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs hover:border-violet-500/50 hover:text-white transition-all flex items-center justify-between group cursor-pointer shadow-sm"
                        onClick={() => onNodePageClick(child.page)}
                      >
                        <span className="pr-2">{child.title}</span>
                        <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-violet-400 group-hover:bg-violet-600/30 flex items-center gap-1">
                          p.{child.page} <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
