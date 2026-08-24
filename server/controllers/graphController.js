const { memoryStore } = require('../config/db');

exports.getMindMap = async (req, res) => {
  try {
    const paper = memoryStore.papers.find(p => p.id === req.params.paper_id) || memoryStore.papers[0];
    
    const mindmapData = {
      id: 'root',
      label: paper.title,
      type: 'root',
      children: [
        {
          id: 'branch-1',
          label: '1. Problem & Core Philosophy',
          page_number: 1,
          children: [
            { id: 'b1-1', label: 'Sequential Bottlenecks in Recurrent Neural Networks (RNNs)', page_number: 1 },
            { id: 'b1-2', label: 'Eliminating Convolution & Recurrence Completely', page_number: 2 }
          ]
        },
        {
          id: 'branch-2',
          label: '2. Multi-Head Scaled Attention Architecture',
          page_number: 3,
          children: [
            { id: 'b2-1', label: 'Scaled Dot-Product Attention: Softmax(Q K^T / √d_k) V', page_number: 4 },
            { id: 'b2-2', label: 'Multi-Head Linear Projections (h=8 heads)', page_number: 4 },
            { id: 'b2-3', label: 'Sinusoidal Positional Encoding & Residual Links', page_number: 5 }
          ]
        },
        {
          id: 'branch-3',
          label: '3. Empirical Results & Benchmark Evaluations',
          page_number: 7,
          children: [
            { id: 'b3-1', label: 'WMT 2014 English-to-German: 28.4 BLEU (+2.0 over SOTA)', page_number: 7 },
            { id: 'b3-2', label: 'Trained on 8 NVIDIA P100 GPUs for 3.5 Days', page_number: 8 }
          ]
        },
        {
          id: 'branch-4',
          label: '4. Critical Limitations & Extensions',
          page_number: 9,
          children: [
            { id: 'b4-1', label: 'Quadratic Memory Complexity O(N^2)', page_number: 9 },
            { id: 'b4-2', label: 'Paved Foundation for GPT-4, BERT, & LLaMA Models', page_number: 10 }
          ]
        }
      ]
    };

    return res.json({ success: true, mindmap: mindmapData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getKnowledgeGraph = async (req, res) => {
  try {
    const nodes = [
      { id: 'p1', label: 'Attention Is All You Need', type: 'Paper', size: 26, color: '#8b5cf6' },
      { id: 'p2', label: 'Deep Residual Learning for Image Recognition', type: 'Paper', size: 20, color: '#6366f1' },
      { id: 'p3', label: 'Reformer: The Efficient Transformer', type: 'Paper', size: 20, color: '#6366f1' },
      { id: 'c1', label: 'Self-Attention Mechanism', type: 'Concept', size: 22, color: '#10b981' },
      { id: 'c2', label: 'Multi-Head Attention', type: 'Concept', size: 18, color: '#10b981' },
      { id: 'c3', label: 'Positional Encoding', type: 'Concept', size: 18, color: '#10b981' },
      { id: 'c4', label: 'Residual Connections', type: 'Concept', size: 18, color: '#10b981' },
      { id: 'a1', label: 'Ashish Vaswani', type: 'Author', size: 16, color: '#f59e0b' },
      { id: 'a2', label: 'Noam Shazeer', type: 'Author', size: 16, color: '#f59e0b' },
      { id: 'd1', label: 'WMT 2014 Eng-Ger Dataset', type: 'Dataset', size: 16, color: '#ef4444' }
    ];

    const edges = [
      { id: 'e1', source: 'p1', target: 'c1', type: 'INTRODUCES', label: 'Introduces' },
      { id: 'e2', source: 'p1', target: 'c2', type: 'USES', label: 'Uses' },
      { id: 'e3', source: 'p1', target: 'c3', type: 'USES', label: 'Uses' },
      { id: 'e4', source: 'p1', target: 'c4', type: 'USES', label: 'Uses' },
      { id: 'e5', source: 'p1', target: 'a1', type: 'WRITTEN_BY', label: 'Authored By' },
      { id: 'e6', source: 'p1', target: 'a2', type: 'WRITTEN_BY', label: 'Authored By' },
      { id: 'e7', source: 'p1', target: 'd1', type: 'EVALUATED_ON', label: 'Evaluated On' },
      { id: 'e8', source: 'p3', target: 'p1', type: 'CITES', label: 'Cites' },
      { id: 'e9', source: 'p2', target: 'c4', type: 'INTRODUCES', label: 'Introduces' }
    ];

    return res.json({ success: true, graph: { nodes, edges } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
