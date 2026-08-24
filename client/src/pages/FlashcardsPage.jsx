import React, { useState, useEffect } from 'react';
import { BrainCircuit, RotateCw } from 'lucide-react';
import { fetchFlashcards, reviewFlashcardItem } from '../lib/api';

export default function FlashcardsPage({ paperId }) {
  const [cards, setCards] = useState([
    {
      id: '1',
      question: 'What primary limitation of RNNs does the Transformer overcome?',
      answer: 'Sequential processing constraints that prevent parallelization across long sequences during training.',
      box_level: 1,
      concept_tag: 'Architecture'
    },
    {
      id: '2',
      question: 'What is the formula for Scaled Dot-Product Attention?',
      answer: 'Attention(Q, K, V) = softmax( (Q K^T) / sqrt(d_k) ) V',
      box_level: 2,
      concept_tag: 'Math'
    },
    {
      id: '3',
      question: 'Why are positional encodings necessary in Transformers?',
      answer: 'Because self-attention is permutation-equivariant and contains no innate notion of word token order.',
      box_level: 1,
      concept_tag: 'Embeddings'
    },
    {
      id: '4',
      question: 'What BLEU score did the Transformer achieve on WMT 2014 Eng-to-Ger?',
      answer: '28.4 BLEU, outperforming existing state-of-the-art models including ensembles.',
      box_level: 3,
      concept_tag: 'Metrics'
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function loadCards() {
      const data = await fetchFlashcards();
      if (data && data.length > 0) {
        setCards(data);
      }
    }
    loadCards();
  }, [paperId]);

  const currentCard = cards[currentIndex];

  const handleRate = async (rating) => {
    setIsFlipped(false);
    if (currentCard?.id) {
      await reviewFlashcardItem(currentCard.id, rating);
    }
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === '1') handleRate(1);
      else if (e.key === '2') handleRate(2);
      else if (e.key === '3') handleRate(3);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, currentCard]);

  return (
    <div className="w-full min-h-screen bg-zinc-950 p-8 flex flex-col items-center justify-center max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/40 text-violet-300 text-xs font-semibold glow-violet">
          <BrainCircuit className="w-4 h-4 text-violet-400" />
          <span>Leitner Spaced Repetition Study Arena</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-white">Concept Flashcards Deck</h1>
        <p className="text-xs text-zinc-400">Use <kbd className="px-2 py-0.5 rounded bg-zinc-800 font-mono text-zinc-300">Spacebar</kbd> to flip card, and keys <kbd className="px-2 py-0.5 rounded bg-zinc-800 font-mono text-zinc-300">1</kbd>, <kbd className="px-2 py-0.5 rounded bg-zinc-800 font-mono text-zinc-300">2</kbd>, <kbd className="px-2 py-0.5 rounded bg-zinc-800 font-mono text-zinc-300">3</kbd> to rate recall difficulty.</p>
      </div>

      {!completed && currentCard ? (
        <div className="w-full max-w-xl space-y-6">
          {/* Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 rounded-3xl bg-zinc-900/90 border-2 border-violet-500/40 p-8 flex flex-col justify-between cursor-pointer glass-panel shadow-2xl transition-all duration-300 hover:scale-[1.01] glow-violet text-center relative"
          >
            <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>Card {currentIndex + 1} of {cards.length}</span>
              <span className="px-2 py-1 rounded bg-violet-600/20 text-violet-300 font-semibold border border-violet-500/30">{currentCard.concept_tag || currentCard.tag || 'Concept'}</span>
              <span>Leitner Box #{currentCard.box_level || currentCard.box || 1}</span>
            </div>

            <div className="my-auto space-y-4">
              <div className="text-xs font-mono text-violet-400 font-bold uppercase tracking-wider">
                {isFlipped ? 'ANSWER REVEAL' : 'QUESTION CONCEPT'}
              </div>
              <div className="font-heading font-bold text-lg text-zinc-100 leading-relaxed px-4">
                {isFlipped ? currentCard.answer : currentCard.question}
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 font-mono flex items-center justify-center gap-2">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Click or Press Spacebar to Flip Card</span>
            </div>
          </div>

          {/* Rating Buttons */}
          {isFlipped && (
            <div className="grid grid-cols-3 gap-4 animate-in fade-in duration-200">
              <button
                onClick={() => handleRate(1)}
                className="py-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 font-semibold text-xs hover:bg-red-900/60 transition-colors"
              >
                [1] Forgot Card
              </button>
              <button
                onClick={() => handleRate(2)}
                className="py-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 font-semibold text-xs hover:bg-amber-900/60 transition-colors"
              >
                [2] Knew Partially
              </button>
              <button
                onClick={() => handleRate(3)}
                className="py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-semibold text-xs hover:bg-emerald-900/60 transition-colors shadow-lg shadow-emerald-950/50"
              >
                [3] Mastered!
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-10 rounded-3xl bg-zinc-900/80 border border-emerald-500/50 glass-panel text-center space-y-4 glow-emerald max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
            🎉
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Flashcard Deck Completed!</h2>
          <p className="text-xs text-zinc-400">All scheduled flashcards for today have been reviewed. High retention recorded!</p>
          <button
            onClick={() => { setCurrentIndex(0); setCompleted(false); }}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-900/40"
          >
            Review Deck Again
          </button>
        </div>
      )}
    </div>
  );
}
