import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Play, BookOpen, Brain, ArrowRight, ChevronLeft } from 'lucide-react';
import { GUIDED_COURSE } from '../constants';
import { Topic, UserProgress } from '../types';
import { cn } from '../lib/utils';

interface GuidedCourseViewProps {
  progress: UserProgress;
  onStartFlashcards: (topic: Topic) => void;
  onStartQuiz: (topic: Topic) => void;
  onBack: () => void;
}

export const GuidedCourseView: React.FC<GuidedCourseViewProps> = ({ progress, onStartFlashcards, onStartQuiz, onBack }) => {
  const currentStepIndex = progress.currentCourseStep || 0;
  const currentStep = GUIDED_COURSE[currentStepIndex];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-slate-900 transition-colors font-medium"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Dashboard
        </button>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Course Progress</span>
          <div className="text-lg font-mono font-bold text-slate-900">
            {Math.round((currentStepIndex / GUIDED_COURSE.length) * 100)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Step List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xl font-display italic text-slate-900 mb-6">Learning Path</h2>
          {GUIDED_COURSE.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;
            const isLocked = index > currentStepIndex;

            return (
              <div 
                key={step.id}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex items-center space-x-4",
                  isActive ? "bg-slate-900 border-slate-900 text-white shadow-lg scale-105 z-10" : 
                  isCompleted ? "bg-white border-emerald-100 text-slate-600" :
                  "bg-white border-slate-100 text-slate-400 opacity-60"
                )}
              >
                <div className={cn(
                  "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  isCompleted ? "bg-emerald-500 text-white" : 
                  isActive ? "bg-white text-slate-900" : "bg-slate-100"
                )}>
                  {isCompleted ? <CheckCircle2 size={18} /> : <span>{index + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{step.title}</div>
                  <div className="text-[10px] uppercase tracking-widest opacity-60">{step.topic}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Step Details */}
        <div className="lg:col-span-2">
          <motion.div 
            key={currentStep.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="bg-slate-900 p-8 sm:p-12 text-white">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest mb-6">
                <Play size={12} className="fill-current" />
                <span>Active Module</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display italic mb-4">{currentStep.title}</h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            <div className="p-8 sm:p-12 space-y-10">
              {/* Objectives */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center">
                  <BookOpen size={16} className="mr-2 text-slate-400" />
                  Learning Objectives
                </h3>
                <div className="space-y-4">
                  {currentStep.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="mt-1">
                        <Circle size={12} className="text-slate-300 fill-slate-300" />
                      </div>
                      <span className="text-slate-700 font-medium">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => onStartFlashcards(currentStep.topic)}
                  className="flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-100 rounded-[32px] hover:border-slate-900 hover:shadow-xl transition-all group"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Brain size={24} />
                  </div>
                  <span className="font-bold text-slate-900">Review Flashcards</span>
                  <span className="text-xs text-slate-400 mt-1">Build foundational recall</span>
                </button>

                <button
                  onClick={() => onStartQuiz(currentStep.topic)}
                  className="flex flex-col items-center justify-center p-8 bg-slate-900 text-white rounded-[32px] hover:bg-slate-800 hover:shadow-xl transition-all group"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="font-bold">Take Module Quiz</span>
                  <span className="text-xs text-slate-400 mt-1">Verify your mastery</span>
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start space-x-3">
                <div className="mt-0.5">
                  <ArrowRight size={16} className="text-amber-600" />
                </div>
                <p className="text-sm text-amber-800 leading-relaxed">
                  <strong>Pro Tip:</strong> Aim for at least 80% on the module quiz before moving to the next step. This ensures solid retention for the final license exam.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
