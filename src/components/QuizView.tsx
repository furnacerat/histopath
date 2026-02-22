import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ArrowRight, Info, Image } from 'lucide-react';
import { Question, Topic } from '../types';
import { cn } from '../lib/utils';

interface QuizViewProps {
  questions: Question[];
  onComplete: (score: number, topicResults: Record<Topic, { correct: number; total: number }>) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [topicResults, setTopicResults] = useState<Record<string, { correct: number; total: number }>>({});
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [currentIndex]);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isCorrect) setScore(prev => prev + 1);

    const topic = currentQuestion.topic as Topic;
    setTopicResults(prev => ({
      ...prev,
      [topic]: {
        correct: (prev[topic]?.correct || 0) + (isCorrect ? 1 : 0),
        total: (prev[topic]?.total || 0) + 1
      }
    }));

    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onComplete(score + (selectedOption === currentQuestion.correctAnswer ? 1 : 0), topicResults as any);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="w-full max-w-3xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end space-y-4 sm:space-y-0">
        <div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 leading-tight">
            {currentQuestion.text}
          </h2>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-xs sm:text-sm font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
            Score: {score}
          </span>
        </div>
      </div>

      {currentQuestion.imageUrl && (
        <div className="mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 aspect-video flex items-center justify-center">
          {!imageError ? (
            <img 
              src={currentQuestion.imageUrl} 
              alt="Histology Spotter" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 p-8">
              <Image size={48} className="mb-4 opacity-50" />
              <p className="text-sm font-medium">Image unavailable</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 sm:space-y-3">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = index === currentQuestion.correctAnswer;
          const showResult = isAnswered;

          return (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              disabled={isAnswered}
              className={cn(
                "w-full p-4 sm:p-5 text-left rounded-xl sm:rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group",
                !showResult && isSelected && "border-slate-900 bg-slate-50",
                !showResult && !isSelected && "border-slate-100 hover:border-slate-200 bg-white",
                showResult && isCorrect && "border-emerald-500 bg-emerald-50",
                showResult && isSelected && !isCorrect && "border-rose-500 bg-rose-50",
                showResult && !isSelected && !isCorrect && "border-slate-100 opacity-50"
              )}
            >
              <span className={cn(
                "text-base sm:text-lg",
                showResult && isCorrect && "text-emerald-700 font-medium",
                showResult && isSelected && !isCorrect && "text-rose-700 font-medium",
                !showResult && isSelected && "text-slate-900 font-medium",
                !showResult && !isSelected && "text-slate-600"
              )}>
                {option}
              </span>
              
              {showResult && isCorrect && <CheckCircle2 className="text-emerald-500 shrink-0 ml-2" size={20} />}
              {showResult && isSelected && !isCorrect && <XCircle className="text-rose-500 shrink-0 ml-2" size={20} />}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 sm:mt-8 p-4 sm:p-6 bg-slate-900 rounded-xl sm:rounded-2xl text-slate-200 shadow-xl"
          >
            <div className="flex items-start space-x-3">
              <Info className="text-slate-400 mt-1 shrink-0" size={18} />
              <div>
                <h4 className="font-bold text-white mb-1 sm:mb-2 uppercase text-[10px] sm:text-xs tracking-widest">Explanation</h4>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 sm:mt-8 flex justify-end">
        {!isAnswered ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="w-full sm:w-auto px-8 py-3 sm:py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg text-sm sm:text-base"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full sm:w-auto px-8 py-3 sm:py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 shadow-lg text-sm sm:text-base"
          >
            <span>{currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
