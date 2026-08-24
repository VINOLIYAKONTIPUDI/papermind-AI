const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Multer storage setup for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

const paperController = require('../controllers/paperController');
const tutorController = require('../controllers/tutorController');
const graphController = require('../controllers/graphController');
const quizController = require('../controllers/quizController');
const reviewerController = require('../controllers/reviewerController');

// Papers API
router.get('/papers', paperController.getPapers);
router.get('/papers/:id', paperController.getPaperById);
router.post('/papers/upload', upload.single('file'), paperController.uploadPaper);

// AI Tutor RAG API
router.post('/tutor/chat', tutorController.queryTutor);

// Mind Map & Knowledge Graph API
router.get('/papers/:paper_id/mindmap', graphController.getMindMap);
router.get('/graph', graphController.getKnowledgeGraph);

// Quiz & Flashcard API
router.get('/flashcards', quizController.getFlashcards);
router.post('/flashcards/:id/review', quizController.reviewFlashcard);
router.get('/quizzes/:paper_id', quizController.getQuiz);
router.post('/quizzes/submit', quizController.submitQuiz);

// AI Peer Reviewer & Comparison API
router.get('/papers/:paper_id/reviewer', reviewerController.getPeerReview);
router.post('/papers/compare', reviewerController.comparePapers);

// Analytics API
router.get('/analytics', (req, res) => {
  return res.json({
    success: true,
    analytics: {
      total_papers_read: 8,
      streak_days: 7,
      flashcards_mastered: 24,
      quizzes_completed: 6,
      average_quiz_score: 92,
      total_hours_spent: 14.5,
      study_heatmap: [
        { date: '2026-08-01', count: 3 },
        { date: '2026-08-02', count: 5 },
        { date: '2026-08-03', count: 2 },
        { date: '2026-08-04', count: 8 },
        { date: '2026-08-05', count: 6 },
        { date: '2026-08-06', count: 4 }
      ]
    }
  });
});

module.exports = router;
