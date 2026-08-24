import React, { useState, useEffect } from 'react';
import { Network, Filter, Search, Info } from 'lucide-react';
import { fetchKnowledgeGraph } from '../../lib/api';

export default function KnowledgeGraphView() {
  const [filterType, setFilterType] = useState('All');
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    async function loadGraph() {
      const data = await fetchKnowledgeGraph();
      if (data && data.nodes) {
        setGraphData(data);
      }
    }
    loadGraph();
  }, []);

  const defaultNodes = [
    { id: 'p1', label: 'Attention Is All You Need', type: 'Paper', x: 350, y: 250, r: 28, color: '#8b5cf6', details: 'Introduces the Transformer model (Vaswani et al. 2017)' },
    { id: 'p2', label: 'Deep Residual Learning (ResNet)', type: 'Paper', x: 180, y: 150, r: 22, color: '#6366f1', details: 'Introduces residual shortcut connections F(x) + x' },
    { id: 'p3', label: 'Reformer: Efficient Transformer', type: 'Paper', x: 550, y: 350, r: 22, color: '#6366f1', details: 'LSH attention O(N log N) complexity' },
    { id: 'c1', label: 'Self-Attention Mechanism', type: 'Concept', x: 350, y: 120, r: 24, color: '#10b981', details: 'Computes Softmax(Q K^T / sqrt(d_k)) V' },
    { id: 'c2', label: 'Multi-Head Attention', type: 'Concept', x: 480, y: 180, r: 20, color: '#10b981', details: 'Parallel linear projections across h heads' },
    { id: 'c3', label: 'Positional Encoding', type: 'Concept', x: 220, y: 320, r: 20, color: '#10b981', details: 'Sinusoidal positional encoding formulation' },
    { id: 'a1', label: 'Ashish Vaswani', type: 'Author', x: 500, y: 100, r: 16, color: '#f59e0b', details: 'Lead author at Google Brain' },
    { id: 'd1', label: 'WMT 2014 Eng-Ger Dataset', type: 'Dataset', x: 180, y: 400, r: 16, color: '#ef4444', details: 'Standard machine translation benchmark dataset' }
  ];

  const defaultEdges = [
    { source: 'p1', target: 'c1', label: 'INTRODUCES' },
    { source: 'p1', target: 'c2', label: 'USES' },
    { source: 'p1', target: 'c3', label: 'USES' },
    { source: 'p1', target: 'a1', label: 'WRITTEN_BY' },
    { source: 'p1', target: 'd1', label: 'EVALUATED_ON' },
    { source: 'p3', target: 'p1', label: 'CITES' },
    { source: 'p2', target: 'c3', label: 'INFLUENCES' }
  ];

  const renderNodes = graphData.nodes.length > 0 ? graphData.nodes.map((n, idx) => ({
    ...n,
    x: n.x || (200 + (idx * 110) % 600),
    y: n.y || (120 + Math.floor(idx / 3) * 140),
    r: n.size || 22,
    color: n.color || (n.type === 'Paper' ? '#8b5cf6' : n.type === 'Concept' ? '#10b981' : n.type === 'Author' ? '#f59e0b' : '#ef4444'),
    details: n.details || `${n.type} entity registered in PaperMind Knowledge Base`
  })) : defaultNodes;

  const renderEdges = graphData.edges.length > 0 ? graphData.edges : defaultEdges;

  const filteredNodes = renderNodes.filter(n => {
    const matchesFilter = filterType === 'All' || n.type === filterType;
    const matchesSearch = n.label.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full h-full bg-zinc-950 flex flex-col relative overflow-hidden glass-panel">
      {/* Knowledge Graph Header */}
      <div className="h-14 border-b border-zinc-800 bg-zinc-900/80 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Network className="w-5 h-5 text-violet-400" />
          <div>
            <h2 className="font-heading font-bold text-sm text-zinc-100">Multi-Paper Knowledge Graph Explorer</h2>
            <p className="text-[10px] text-zinc-400">Interactive Entity & Relationship Network</p>
          </div>
        </div>

        {/* Filter Chips & Search */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search concepts or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none w-36"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400 ml-1" />
            {['All', 'Paper', 'Concept', 'Author', 'Dataset'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                  filterType === type ? 'bg-violet-600 text-white shadow-md shadow-violet-900/40' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 relative bg-zinc-950/90 flex items-center justify-center">
        <svg className="w-full h-full min-h-[500px]">
          {/* Edge Lines */}
          {renderEdges.map((edge, idx) => {
            const sNode = renderNodes.find(n => n.id === edge.source);
            const tNode = renderNodes.find(n => n.id === edge.target);
            if (!sNode || !tNode) return null;
            return (
              <g key={idx}>
                <line
                  x1={sNode.x}
                  y1={sNode.y}
                  x2={tNode.x}
                  y2={tNode.y}
                  stroke="#3f3f46"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <text
                  x={(sNode.x + tNode.x) / 2}
                  y={(sNode.y + tNode.y) / 2}
                  fill="#71717a"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {edge.label || edge.type}
                </text>
              </g>
            );
          })}

          {/* Node Circles */}
          {filteredNodes.map((node) => (
            <g
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className="cursor-pointer group"
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill={node.color}
                opacity="0.85"
                className="transition-all group-hover:scale-125 group-hover:opacity-100 glow-violet"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r + 4}
                fill="none"
                stroke={node.color}
                strokeWidth="1.5"
                opacity="0.5"
              />
              <text
                x={node.x}
                y={node.y + node.r + 14}
                fill="#e4e4e7"
                fontSize="11"
                fontWeight="600"
                fontFamily="Outfit, sans-serif"
                textAnchor="middle"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Selected Node Inspector Drawer */}
        {selectedNode && (
          <div className="absolute bottom-6 right-6 w-80 bg-zinc-900 border border-violet-500/50 rounded-2xl p-5 shadow-2xl glass-panel animate-in slide-in-from-bottom-4 duration-200 glow-violet">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-violet-400" />
                <span className="font-heading font-bold text-sm text-zinc-100">{selectedNode.type} Node</span>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-zinc-500 hover:text-zinc-300 text-xs font-mono">✕</button>
            </div>
            <div className="space-y-2">
              <h4 className="font-heading font-bold text-zinc-100 text-sm">{selectedNode.label}</h4>
              <p className="text-xs text-zinc-400">{selectedNode.details}</p>
              <div className="pt-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>Node ID: {selectedNode.id}</span>
                <span className="px-2 py-0.5 rounded bg-violet-600/20 text-violet-300 font-semibold">{selectedNode.type}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
