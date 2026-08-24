const { memoryStore } = require('../config/db');

// Seed default flashcards
memoryStore.flashcards = [
  {
    id: 'fc-1',
    paper_id: 'paper-attention-2017',
    question: 'What primary limitation of RNNs does the Transformer overcome?',
    answer: 'Sequential processing constraints that prevent parallelization across long sequences during training.',
    concept_tag: 'Architecture',
    box_level: 1,
    next_review: new Date()
  },
  {
    id: 'fc-2',
    paper_id: 'paper-attention-2017',
    question: 'What is the formula for Scaled Dot-Product Attention?',
    answer: 'Attention(Q, K, V) = softmax( (Q K^T) / sqrt(d_k) ) V',
    concept_tag: 'Math',
    box_level: 2,
    next_review: new Date()
  },
  {
    id: 'fc-3',
    paper_id: 'paper-attention-2017',
    question: 'Why are positional encodings necessary in Transformers?',
    answer: 'Because the self-attention operation is permutation-equivariant and contains no innate notion of word order or token position.',
    concept_tag: 'Embeddings',
    box_level: 1,
    next_review: new Date()
  },
  {
    id: 'fc-4',
    paper_id: 'paper-attention-2017',
    question: 'What BLEU score did the Transformer achieve on the WMT 2014 Eng-to-Ger benchmark?',
    answer: '28.4 BLEU, outperforming existing state-of-the-art models including ensembles.',
    concept_tag: 'Metrics',
    box_level: 3,
    next_review: new Date()
  }
];

// Seed default quiz
memoryStore.quizzes = [
  {
    id: 'quiz-1',
    paper_id: 'paper-attention-2017',
    title: 'Transformer Architecture Comprehension Quiz',
    questions: [
      {
        id: 'q1',
        question_text: 'Which components are completely removed in the Transformer architecture?',
        options: [
          'Feed-Forward Neural Networks',
          'Recurrent Neural Networks and Convolutions',
          'Softmax Output Layers',
          'Linear Projections'
        ],
        correct_option: '1',
        explanation: 'The Transformer relies entirely on self-attention mechanisms, eliminating RNNs and convolutional layers.',
        difficulty: 'medium'
      },
      {
        id: 'q2',
        question_text: 'What is the scaling factor applied inside the Scaled Dot-Product Attention formula?',
        options: ['1 / d_k', '1 / sqrt(d_k)', 'sqrt(d_k)', 'd_model^2'],
        correct_option: '1',
        explanation: 'Dividing by sqrt(d_k) prevents the dot products from growing large in magnitude, which would push softmax into regions with extremely small gradients.',
        difficulty: 'hard'
      },
      {
        id: 'q3',
        question_text: 'What is the time complexity per layer for self-attention with sequence length N?',
        options: ['O(N)', 'O(N * d^2)', 'O(N^2 * d)', 'O(log N)'],
        correct_option: '2',
        explanation: 'Self-attention computes pairwise token interactions across length N, leading to O(N^2 * d) complexity per layer.',
        difficulty: 'hard'
      },
      {
        id: 'q4',
        question_text: 'How many attention heads are used in the base Transformer encoder?',
        options: ['4 heads', '8 heads', '12 heads', '16 heads'],
        correct_option: '1',
        explanation: 'The base model uses h = 8 parallel attention heads with d_k = d_v = d_model / h = 64.',
        difficulty: 'easy'
      }
    ]
  }
];

exports.getFlashcards = async (req, res) => {
  try {
    return res.json({ success: true, flashcards: memoryStore.flashcards });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.reviewFlashcard = async (req, res) => {
  try {
    const { rating } = req.body; // 1: Forgot, 2: Knew Partially, 3: Mastered
    const card = memoryStore.flashcards.find(f => f.id === req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    if (rating === 3) card.box_level = Math.min(5, card.box_level + 1);
    else if (rating === 1) card.box_level = 1;

    card.next_review = new Date(Date.now() + card.box_level * 24 * 60 * 60 * 1000);
    return res.json({ success: true, flashcard: card });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const quiz = memoryStore.quizzes.find(q => q.paper_id === req.params.paper_id) || memoryStore.quizzes[0];
    return res.json({ success: true, quiz });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // [{ question_id: 'q1', selected_option: '1' }]
    const quiz = memoryStore.quizzes[0];
    
    let correctCount = 0;
    const results = quiz.questions.map(q => {
      const userAns = answers ? answers.find(a => a.question_id === q.id) : null;
      const isCorrect = userAns && userAns.selected_option === q.correct_option;
      if (isCorrect) correctCount++;
      return {
        question_id: q.id,
        is_correct: isCorrect,
        correct_option: q.correct_option,
        user_option: userAns ? userAns.selected_option : null,
        explanation: q.explanation
      };
    });

    const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);

    return res.json({
      success: true,
      score: scorePercentage,
      total_questions: quiz.questions.length,
      correct_count: correctCount,
      results
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
