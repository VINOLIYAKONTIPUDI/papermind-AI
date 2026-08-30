const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const { memoryStore } = require('../config/db');
const mongoose = require('mongoose');
const { Paper, PaperChunk } = require('../models/Schemas');
const ragPipeline = require('../rag/pipeline/ragPipeline');

// Seed default demo papers so platform is fully rich upon launch
const defaultPapers = [
  {
    id: 'paper-attention-2017',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
    journal: 'Advances in Neural Information Processing Systems (NeurIPS 30)',
    doi: '10.48550/arXiv.1706.03762',
    publication_year: 2017,
    pdf_url: '/samples/attention_is_all_you_need.pdf',
    summary: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer, a model architecture eschewing recurrence and relying entirely on attention mechanisms.',
    domain_tag: 'Deep Learning',
    paper_type: 'Empirical Study',
    reading_time_mins: 40,
    difficulty_rating: 5,
    math_complexity: 4,
    code_complexity: 3,
    visual_complexity: 5,
    prerequisites: ['Recurrent Neural Networks (RNN)', 'Vector Dot Products', 'Encoder-Decoder Framework', 'Softmax Probability Distributions'],
    learning_outcomes: [
      'Understand Scaled Dot-Product and Multi-Head Attention mechanisms.',
      'Master Positional Encodings without recurrence.',
      'Analyze training speedups on parallel GPU clusters.'
    ],
    created_at: new Date('2026-08-01T10:00:00Z')
  },
  {
    id: 'paper-resnet-2015',
    title: 'Deep Residual Learning for Image Recognition',
    authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
    journal: 'IEEE Conference on Computer Vision and Pattern Recognition (CVPR)',
    doi: '10.1109/CVPR.2016.90',
    publication_year: 2016,
    pdf_url: '/samples/resnet.pdf',
    summary: 'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously.',
    domain_tag: 'Computer Vision',
    paper_type: 'Empirical Study',
    reading_time_mins: 30,
    difficulty_rating: 4,
    math_complexity: 3,
    code_complexity: 4,
    visual_complexity: 4,
    prerequisites: ['Convolutional Neural Networks', 'Vanishing Gradient Problem', 'Backpropagation'],
    learning_outcomes: [
      'Understand shortcut connections F(x) + x.',
      'Analyze 152-layer deep neural networks performance.'
    ],
    created_at: new Date('2026-08-03T14:30:00Z')
  },
  {
    id: 'paper-reformer-2020',
    title: 'Reformer: The Efficient Transformer',
    authors: ['Nikita Kitaev', 'Łukasz Kaiser', 'Anselm Levskaya'],
    journal: 'International Conference on Learning Representations (ICLR)',
    doi: '10.48550/arXiv.2001.04451',
    publication_year: 2020,
    pdf_url: '/samples/reformer.pdf',
    summary: 'Large Transformer models routinely achieve state-of-the-art results, but training them can be prohibitively expensive. We introduce two techniques to improve the efficiency of Transformers: Locality-Sensitive Hashing (LSH) and reversible residual layers.',
    domain_tag: 'Machine Learning Efficiency',
    paper_type: 'Theoretical & Empirical',
    reading_time_mins: 45,
    difficulty_rating: 5,
    math_complexity: 5,
    code_complexity: 4,
    visual_complexity: 4,
    prerequisites: ['Standard Transformer Architecture', 'Locality Sensitive Hashing (LSH)', 'Memory Bandwidth Optimization'],
    learning_outcomes: [
      'Reduce attention complexity from O(N^2) to O(N log N).',
      'Understand reversible residual network backpropagation.'
    ],
    created_at: new Date('2026-08-05T09:15:00Z')
  }
];

// Initialize memoryStore with defaults
memoryStore.papers = [...defaultPapers];

// Seed chunks for default paper
memoryStore.chunks = [
  {
    id: 'chunk-1',
    paper_id: 'paper-attention-2017',
    page_number: 1,
    chunk_index: 0,
    section_name: 'Abstract & Introduction',
    content: 'Recurrent neural networks, particularly long short-term memory (LSTM) and gated recurrent neural networks, have been firmly established as state of the art approaches in sequence modeling. The Transformer is the first sequence transduction model relying entirely on self-attention to compute representations of its input and output without using sequence-aligned RNNs or convolution.',
    bbox: { x: 50, y: 100, w: 500, h: 120 }
  },
  {
    id: 'chunk-2',
    paper_id: 'paper-attention-2017',
    page_number: 3,
    chunk_index: 1,
    section_name: '3. Model Architecture',
    content: 'An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key.',
    bbox: { x: 50, y: 250, w: 500, h: 140 }
  },
  {
    id: 'chunk-3',
    paper_id: 'paper-attention-2017',
    page_number: 4,
    chunk_index: 2,
    section_name: '3.2 Multi-Head Attention',
    content: 'Instead of performing a single attention function with d_model-dimensional keys, values and queries, we found it beneficial to linearly project the queries, keys and values h times with different, learned linear projections to d_k, d_k and d_v dimensions, respectively.',
    bbox: { x: 50, y: 400, w: 500, h: 130 }
  },
  {
    id: 'chunk-4',
    paper_id: 'paper-attention-2017',
    page_number: 5,
    chunk_index: 3,
    section_name: '3.5 Positional Encoding',
    content: 'Since our model contains no recurrence and no convolution, in order for the model to make use of the order of the sequence, we must inject some information about the relative or absolute position of the tokens in the sequence. To this end, we add positional encodings to the input embeddings at the bottoms of the encoder and decoder stacks.',
    bbox: { x: 50, y: 550, w: 500, h: 120 }
  }
];

exports.getPapers = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const papers = await Paper.find().sort({ created_at: -1 });
      return res.json({ success: true, papers });
    }
    return res.json({ success: true, papers: memoryStore.papers });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getPaperById = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const paper = await Paper.findOne({ id: req.params.id });
      if (paper) {
        const chunks = await PaperChunk.find({ paper_id: req.params.id }).sort({ chunk_index: 1 });
        return res.json({ success: true, paper, chunks });
      }
    }
    const paper = memoryStore.papers.find(p => p.id === req.params.id);
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    const chunks = memoryStore.chunks.filter(c => c.paper_id === req.params.id);
    return res.json({ success: true, paper, chunks });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.uploadPaper = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    
    // Page-by-page text parsing option
    const pageData = [];
    const renderPage = (pageDataObj) => {
      return pageDataObj.getTextContent().then(textContent => {
        const pageText = textContent.items.map(item => item.str).join(' ');
        pageData.push({
          page: pageDataObj.pageIndex + 1,
          text: pageText
        });
        return pageText;
      });
    };

    let parsedData;
    try {
      parsedData = await pdfParse(dataBuffer, { pagerender: renderPage });
    } catch (parseError) {
      return res.status(400).json({
        error: 'Failed to process PDF structure. It may be corrupt, password-protected, or invalid.'
      });
    }

    if (!parsedData || !parsedData.text || parsedData.text.trim().length === 0) {
      return res.status(400).json({
        error: 'The uploaded PDF does not contain extractable text. Scanned image documents are not supported.'
      });
    }

    const title = parsedData.info?.Title || req.file.originalname.replace('.pdf', '').replace(/_/g, ' ');
    const authorStr = parsedData.info?.Author || 'Academic Researcher';

    // Duplicate detection
    const isDbConnected = mongoose.connection.readyState === 1;
    let isDuplicate = false;
    if (isDbConnected) {
      const existingPaper = await Paper.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } });
      if (existingPaper) isDuplicate = true;
    } else {
      isDuplicate = memoryStore.papers.some(p => p.title.toLowerCase() === title.toLowerCase());
    }

    if (isDuplicate) {
      return res.status(400).json({ error: 'A research paper with this title has already been uploaded.' });
    }

    const newPaper = {
      id: `paper-${uuidv4().substring(0, 8)}`,
      title,
      authors: authorStr.split(',').map(a => a.trim()),
      journal: 'Submitted PDF Document',
      doi: `10.1016/papermind.${Math.floor(Math.random() * 899999 + 100000)}`,
      publication_year: new Date().getFullYear(),
      pdf_url: `/uploads/${req.file.filename}`,
      summary: parsedData.text.substring(0, 350).replace(/\n/g, ' ') + '...',
      domain_tag: 'Scientific Research',
      paper_type: 'Empirical Study',
      reading_time_mins: Math.max(15, Math.ceil(parsedData.numpages * 2.5)),
      difficulty_rating: 4,
      math_complexity: 3,
      code_complexity: 3,
      visual_complexity: 4,
      prerequisites: ['Domain Background Knowledge', 'Research Methodology Fundamentals'],
      learning_outcomes: ['Extract structural key insights', 'Evaluate experimental conclusions'],
      created_at: new Date()
    };

    // Ingest via RAG Pipeline
    pageData.sort((a, b) => a.page - b.page);
    const ingestedChunks = await ragPipeline.ingestPaper(newPaper.id, pageData);

    const schemaChunks = ingestedChunks.map(c => ({
      id: c.id || `chunk-${uuidv4().substring(0, 8)}`,
      paper_id: newPaper.id,
      page_number: c.page_number,
      chunk_index: c.chunk_index,
      section_name: c.section_name,
      content: c.content,
      bbox: c.bbox
    }));

    if (isDbConnected) {
      const paperDoc = new Paper(newPaper);
      await paperDoc.save();
      if (schemaChunks.length > 0) {
        await PaperChunk.insertMany(schemaChunks);
      }
    }

    memoryStore.papers.unshift(newPaper);
    schemaChunks.forEach(sc => memoryStore.chunks.push(sc));

    return res.status(201).json({
      success: true,
      message: 'File successfully parsed and ingested into vector index.',
      paper: newPaper
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
