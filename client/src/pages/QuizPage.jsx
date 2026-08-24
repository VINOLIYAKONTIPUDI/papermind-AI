import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { fetchQuiz, submitQuizAnswers } from '../lib/api';

export default function QuizPage({ paperId }) {
  const [quizData, setQuizData] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins countdown

  useEffect(() => {
    async function loadQuiz() {
      if (paperId) {
        const data = await fetchQuiz(paperId);
        if (data) setQuizData(data);
      }
    }
    loadQuiz();
  }, [paperId]);

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, submitted]);

  const defaultQuestions = [
    {
      id: 'q1',
      question_text: 'Which components are completely eliminated in the Transformer architecture?',
      options: [
        'Feed-Forward Neural Networks',
        'Recurrent Neural Networks (RNNs) and Convolutions',
        'Softmax Probability Output Layers',
        'Linear Feature Projections'
      ],
      correct_option: '1',
      explanation: 'The Transformer relies entirely on self-attention mechanisms, eliminating RNNs and convolutional layers.'
    },
    {
      id: 'q2',
      question_text: 'What scaling factor is applied inside the Scaled Dot-Product Attention equation?',
      options: ['1 / d_k', '1 / sqrt(d_k)', 'sqrt(d_k)', 'd_model^2'],
      correct_option: '1',
      explanation: 'Dividing by sqrt(d_k) prevents dot products from growing large in magnitude, which would push softmax into small gradient regions.'
    },
    {
      id: 'q3',
      question_text: 'What is the time complexity per layer for self-attention with sequence length N?',
      options: ['O(N)', 'O(N * d^2)', 'O(N^2 * d)', 'O(log N)'],
      correct_option: '2',
      explanation: 'Self-attention computes pairwise token interactions across length N, leading to O(N^2 * d) complexity per layer.'
    }
  ];

  const quizTitle = quizData?.title || 'Adaptive Paper Comprehension Quiz';
  const questions = quizData?.questions || defaultQuestions;

  const handleSelectOption = (idx) => {
    if (userAnswers[currentQ] !== undefined) return;
    setUserAnswers(prev => ({ ...prev, [currentQ]: idx }));
  };

  const handleNext = async () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      // Form submission array
      const answerPayload = questions.map((q, i) => ({
        question_id: q.id,
        selected_option: String(userAnswers[i] !== undefined ? userAnswers[i] : 0)
      }));

      const res = await submitQuizAnswers(answerPayload);
      if (res.success && res.score !== undefined) {
        setScore(res.score);
      } else {
        let correctCount = 0;
        questions.forEach((q, i) => {
          if (String(userAnswers[i]) === String(q.correct_option || q.correct)) correctCount++;
        });
        setScore(Math.round((correctCount / questions.length) * 100));
      }
      setSubmitted(true);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const q = questions[currentQ];

  return (
    <div className="w-full min-h-screen bg-zinc-950 p-8 flex flex-col items-center justify-center max-w-3xl mx-auto space-y-6">
      
      {/* Quiz Header & Timer */}
      <div className="w-full flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="font-heading font-extrabold text-xl text-white">{quizTitle}</h1>
          <p className="text-xs text-zinc-400">Adaptive Question Engine • Question {currentQ + 1} of {questions.length}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-violet-400 font-bold">
          <Clock className="w-4 h-4 text-violet-400" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {!submitted ? (
        <div className="w-full space-y-6">
          {/* Question Card */}
          <div className="p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 glass-panel space-y-6 shadow-2xl">
            <h3 className="font-heading font-bold text-base text-zinc-100 leading-relaxed">
              {currentQ + 1}. {q.question_text || q.question}
            </h3>

            {/* Options List */}
            <div className="space-y-3">
              {q.options.map((opt, idx) => {
                const isSelected = userAnswers[currentQ] === idx;
                const targetCorrectIndex = Number(q.correct_option ?? q.correct);
                const isCorrect = idx === targetCorrectIndex;
                const answered = userAnswers[currentQ] !== undefined;

                let optStyle = 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-violet-500/50';
                if (answered) {
                  if (isCorrect) optStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold';
                  else if (isSelected) optStyle = 'bg-red-950/40 border-red-500 text-red-300';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${optStyle}`}
                  >
                    <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                    {answered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {answered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {userAnswers[currentQ] !== undefined && (
              <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30 text-xs text-violet-200 space-y-1 animate-in fade-in duration-200">
                <div className="font-bold text-violet-300">Explanation Rationale:</div>
                <p>{q.explanation}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={userAnswers[currentQ] === undefined}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-heading font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-violet-950/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{currentQ + 1 === questions.length ? 'Submit Quiz' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Scorecard Output */
        <div className="p-10 rounded-3xl bg-zinc-900/80 border border-violet-500/50 glass-panel text-center space-y-6 glow-violet max-w-md w-full animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto text-3xl font-extrabold border border-violet-500/40">
            {score}%
          </div>
          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-2xl text-white">Comprehension Quiz Completed!</h2>
            <p className="text-xs text-zinc-400">You scored {score}% on this paper practice quiz.</p>
          </div>
          <button
            onClick={() => { setCurrentQ(0); setUserAnswers({}); setSubmitted(false); setTimeLeft(300); }}
            className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-colors shadow-lg shadow-violet-900/40"
          >
            Retake Practice Quiz
          </button>
        </div>
      )}
    </div>
  );
}
