import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Flashcard } from '../types';
import { cn } from '../lib/utils';

interface FlashcardViewProps {
  cards: Flashcard[];
  onComplete: () => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({ cards, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  if (!currentCard) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto space-y-6 sm:space-y-8 py-6 sm:py-12 px-2 sm:px-4">
      <div className="w-full flex justify-between items-center px-2">
        <span className="text-[10px] sm:text-sm font-medium text-slate-500 uppercase tracking-wider">
          {currentCard.topic}
        </span>
        <span className="text-[10px] sm:text-sm font-mono text-slate-400">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      <div 
        className="relative w-full aspect-[4/5] sm:aspect-[3/2] cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative preserve-3d transition-transform duration-500"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div className={cn(
            "absolute inset-0 w-full h-full backface-hidden bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col items-center justify-center p-6 sm:p-12 text-center overflow-hidden",
            isFlipped && "pointer-events-none"
          )}>
            <div className="absolute top-4 sm:top-6 left-0 right-0 flex justify-center">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-medium text-slate-800 leading-tight">
              {currentCard.question}
            </h3>
            <div className="absolute bottom-4 sm:bottom-6 text-[10px] text-slate-400 uppercase tracking-widest">
              Tap to flip
            </div>
          </div>

          {/* Back */}
          <div className={cn(
            "absolute inset-0 w-full h-full backface-hidden bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col items-center justify-center p-6 sm:p-12 text-center rotate-y-180 overflow-hidden",
            !isFlipped && "pointer-events-none"
          )}>
            <div className="absolute top-4 sm:top-6 left-0 right-0 flex justify-center">
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correct Answer</span>
            </div>
            <div className="text-sm sm:text-xl text-slate-200 leading-relaxed overflow-y-auto max-h-full py-4 mt-4">
              {currentCard.answer}
            </div>
            <div className="absolute bottom-4 sm:bottom-6 text-[10px] text-slate-500 uppercase tracking-widest">
              Tap to flip back
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center space-x-4 sm:space-x-6">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 sm:p-4 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium transition-colors flex items-center space-x-2 text-sm sm:text-base"
        >
          <RotateCcw size={18} />
          <span>Flip</span>
        </button>

        <button
          onClick={handleNext}
          className="p-3 sm:p-4 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
