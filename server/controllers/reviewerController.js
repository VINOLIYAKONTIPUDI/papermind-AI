const { memoryStore } = require('../config/db');

exports.getPeerReview = async (req, res) => {
  try {
    const paper = memoryStore.papers.find(p => p.id === req.params.paper_id) || memoryStore.papers[0];

    const reviewData = {
      paper_id: paper.id,
      title: paper.title,
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
      ],
      missing_experiments: [
        'Evaluation on long-context autoregressive language modeling tasks (e.g., WikiText-103).',
        'Direct hardware latency benchmark comparisons on edge TPU hardware.'
      ],
      improvement_suggestions: 'We recommend adding an inference latency chart comparing FLOPs vs memory bandwidth usage across varying sequence lengths.'
    };

    return res.json({ success: true, review: reviewData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.comparePapers = async (req, res) => {
  try {
    const { paper1_id = 'paper-attention-2017', paper2_id = 'paper-reformer-2020' } = req.body || {};

    const paper1 = memoryStore.papers.find(p => p.id === paper1_id) || memoryStore.papers[0];
    const paper2 = memoryStore.papers.find(p => p.id === paper2_id) || memoryStore.papers[2];

    const comparisonData = {
      paper1: {
        id: paper1.id,
        title: paper1.title,
        authors: paper1.authors ? paper1.authors.join(', ') : 'Vaswani et al.',
        year: paper1.publication_year || 2017,
        architecture: 'Standard Transformer (Encoder-Decoder)',
        attention_complexity: 'O(N^2) Time & Memory',
        key_dataset: 'WMT 2014 Eng-to-Ger (4.5M pairs)',
        best_metric: '28.4 BLEU Score',
        limitations: 'Quadratic GPU RAM growth for long context windows.'
      },
      paper2: {
        id: paper2.id,
        title: paper2.title,
        authors: paper2.authors ? paper2.authors.join(', ') : 'Kitaev et al.',
        year: paper2.publication_year || 2020,
        architecture: 'LSH Attention + Reversible Layers',
        attention_complexity: 'O(N log N) Time & Memory',
        key_dataset: 'enwik8 & WMT Translation',
        best_metric: '1.05 Bits per Byte',
        limitations: 'Slightly higher constant overhead for small sequence lengths.'
      },
      conflicting_conclusions: [
        'Paper 1 asserts full softmax dense attention is mandatory for top performance; Paper 2 proves LSH buckets achieve matching BLEU with fraction of memory.',
        'Paper 1 stores intermediate layer activations; Paper 2 uses reversible residual layers to dynamically recompute activations during backprop.'
      ]
    };

    return res.json({ success: true, comparison: comparisonData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
