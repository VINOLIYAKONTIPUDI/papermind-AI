const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  full_name: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

const PaperSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  title: { type: String, required: true },
  authors: [{ type: String }],
  journal: { type: String, default: 'Academic Conference' },
  doi: { type: String, default: '' },
  publication_year: { type: Number, default: 2024 },
  pdf_url: { type: String, required: true },
  summary: { type: String, default: '' },
  domain_tag: { type: String, default: 'Artificial Intelligence' },
  paper_type: { type: String, default: 'Empirical Study' },
  reading_time_mins: { type: Number, default: 35 },
  difficulty_rating: { type: Number, default: 4 },
  math_complexity: { type: Number, default: 4 },
  code_complexity: { type: Number, default: 3 },
  visual_complexity: { type: Number, default: 4 },
  prerequisites: [{ type: String }],
  learning_outcomes: [{ type: String }],
  owner_id: { type: String, default: null },
  created_at: { type: Date, default: Date.now }
});

const PaperChunkSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  paper_id: { type: String, required: true },
  page_number: { type: Number, required: true },
  chunk_index: { type: Number, required: true },
  section_name: { type: String, default: 'General' },
  content: { type: String, required: true },
  bbox: { type: Object, default: null }
});

const FlashcardSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  paper_id: { type: String, required: true },
  user_id: { type: String, default: null },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  concept_tag: { type: String, default: 'Core' },
  box_level: { type: Number, default: 1 },
  next_review: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now }
});

const QuizSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  paper_id: { type: String, required: true },
  user_id: { type: String, default: null },
  title: { type: String, default: 'Paper Comprehension Quiz' },
  score: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

const QuizQuestionSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  quiz_id: { type: String, required: true },
  question_text: { type: String, required: true },
  options: [{ type: String }],
  correct_option: { type: String, required: true },
  explanation: { type: String, default: '' },
  difficulty: { type: String, default: 'medium' }
});

const MessageSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  conversation_id: { type: String, required: true },
  sender: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  citations: [{ type: Object }],
  created_at: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Paper: mongoose.model('Paper', PaperSchema),
  PaperChunk: mongoose.model('PaperChunk', PaperChunkSchema),
  Flashcard: mongoose.model('Flashcard', FlashcardSchema),
  Quiz: mongoose.model('Quiz', QuizSchema),
  QuizQuestion: mongoose.model('QuizQuestion', QuizQuestionSchema),
  Message: mongoose.model('Message', MessageSchema)
};
