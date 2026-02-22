import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, XCircle, ArrowRight, Info, RotateCcw, Microscope, FlaskConical, Sparkles, ChevronLeft, Loader2 } from 'lucide-react';
import { TROUBLESHOOTING_SCENARIOS } from '../constants';
import { TroubleshootingScenario } from '../types';
import { cn } from '../lib/utils';

interface LabSimulatorViewProps {
  scenarios: TroubleshootingScenario[];
  onBack: () => void;
  onGenerateMore: () => void;
  isGenerating?: boolean;
}

export const LabSimulatorView: React.FC<LabSimulatorViewProps> = ({ scenarios, onBack, onGenerateMore, isGenerating }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [currentIndex]);

  if (scenarios.length === 0) return null;

  const currentScenario = scenarios[currentIndex];

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      // If we reached the end, maybe offer to generate more or go back
      onBack();
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-display italic text-slate-900">Lab Troubleshooter</h1>
              <p className="text-sm text-slate-500">Diagnose and fix common processing errors.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <button
            onClick={onGenerateMore}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-xs font-bold hover:bg-amber-100 transition-all disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>Generate More</span>
          </button>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scenario</span>
            <div className="text-lg font-mono font-bold text-slate-900">
              {currentIndex + 1} / {scenarios.length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Problem Description */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentScenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-[10px] font-bold uppercase tracking-widest text-rose-600 mb-6">
                  <FlaskConical size={12} />
                  <span>Problem Report</span>
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{currentScenario.title}</h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {currentScenario.problemDescription}
                </p>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start space-x-3">
                  <Microscope size={18} className="text-slate-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Microscopic Observation</span>
                    <p className="text-sm text-slate-700 italic">"{currentScenario.observation}"</p>
                  </div>
                </div>
              </div>

              {currentScenario.imageUrl && (
                <div className="rounded-[32px] overflow-hidden border border-slate-200 shadow-sm aspect-video bg-slate-900 flex items-center justify-center relative group/img">
                  {!imageError ? (
                    <img 
                      src={currentScenario.imageUrl} 
                      alt="Microscopic Observation" 
                      className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover/img:scale-110"
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 p-8">
                      <FlaskConical size={48} className="mb-4 opacity-50" />
                      <p className="text-sm font-medium">Image unavailable</p>
                      <p className="text-xs opacity-60">Reference image could not be loaded</p>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest opacity-0 group-hover/img:opacity-100 transition-opacity">
                    Reference Image
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Diagnosis Options */}
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Select Diagnosis</h3>
            <div className="space-y-3">
              {currentScenario.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrect = index === currentScenario.correctOptionIndex;
                const showResult = isAnswered;

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={isAnswered}
                    className={cn(
                      "w-full p-4 text-left rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group",
                      !showResult && isSelected && "border-slate-900 bg-slate-50",
                      !showResult && !isSelected && "border-slate-100 hover:border-slate-200 bg-white",
                      showResult && isCorrect && "border-emerald-500 bg-emerald-50",
                      showResult && isSelected && !isCorrect && "border-rose-500 bg-rose-50",
                      showResult && !isSelected && !isCorrect && "border-slate-100 opacity-50"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium",
                      showResult && isCorrect && "text-emerald-700",
                      showResult && isSelected && !isCorrect && "text-rose-700",
                      !showResult && isSelected && "text-slate-900",
                      !showResult && !isSelected && "text-slate-600"
                    )}>
                      {option}
                    </span>
                    {showResult && isCorrect && <CheckCircle2 className="text-emerald-500 shrink-0 ml-2" size={18} />}
                    {showResult && isSelected && !isCorrect && <XCircle className="text-rose-500 shrink-0 ml-2" size={18} />}
                  </button>
                );
              })}
            </div>

            <div className="mt-8">
              {!isAnswered ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedOption === null}
                  className="w-full py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  Confirm Diagnosis
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>{currentIndex === scenarios.length - 1 ? 'Finish Simulation' : 'Next Scenario'}</span>
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl"
              >
                <div className="flex items-start space-x-3">
                  <Info className="text-slate-400 mt-1 shrink-0" size={18} />
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-2">Expert Analysis</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {currentScenario.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isAnswered && currentIndex === scenarios.length - 1 && (
            <button
              onClick={handleReset}
              className="w-full py-4 border-2 border-slate-200 text-slate-600 rounded-full font-bold hover:bg-slate-50 transition-all flex items-center justify-center space-x-2"
            >
              <RotateCcw size={18} />
              <span>Restart Simulator</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
