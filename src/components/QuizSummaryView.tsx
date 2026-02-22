import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Target, ArrowRight, BookOpen, Loader2, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { Topic } from '../types';
import { geminiService } from '../services/geminiService';
import { cn } from '../lib/utils';

interface QuizSummaryViewProps {
  score: number;
  total: number;
  topicResults: Record<Topic, { correct: number; total: number }>;
  onClose: () => void;
}

export const QuizSummaryView: React.FC<QuizSummaryViewProps> = ({ score, total, topicResults, onClose }) => {
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loadingRec, setLoadingRec] = useState(true);
  const percentage = Math.round((score / total) * 100);

  useEffect(() => {
    const fetchRec = async () => {
      try {
        const rec = await geminiService.generateRecommendation(score, total, topicResults);
        setRecommendation(rec);
      } catch (error) {
        console.error("Failed to fetch recommendation", error);
      } finally {
        setLoadingRec(false);
      }
    };
    fetchRec();
  }, [score, total, topicResults]);

  const getGradeColor = () => {
    if (percentage >= 90) return "text-emerald-500";
    if (percentage >= 75) return "text-blue-500";
    if (percentage >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  const getGradeMessage = () => {
    if (percentage >= 90) return "Outstanding! You're exam-ready.";
    if (percentage >= 75) return "Great job! Almost there.";
    if (percentage >= 60) return "Good effort. Keep practicing.";
    return "Needs more focus. Don't give up!";
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-slate-900 p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6"
            >
              <Trophy size={40} className="text-amber-400" />
            </motion.div>
            <h2 className="text-4xl font-display italic mb-2">Quiz Complete</h2>
            <p className="text-slate-400 text-lg">{getGradeMessage()}</p>
          </div>
          
          {/* Decorative background */}
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-64 h-64 border-[30px] border-white rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 border-[30px] border-white rounded-full"></div>
          </div>
        </div>

        <div className="p-8 sm:p-12 space-y-10">
          {/* Main Score Display */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-12">
            <div className="text-center">
              <div className={cn("text-7xl font-display italic font-bold mb-1", getGradeColor())}>
                {percentage}%
              </div>
              <div className="text-slate-400 uppercase tracking-widest text-xs font-bold">Final Grade</div>
            </div>
            <div className="h-12 w-px bg-slate-100 hidden sm:block"></div>
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-800 mb-1">{score} / {total}</div>
              <div className="text-slate-400 uppercase tracking-widest text-xs font-bold">Correct Answers</div>
            </div>
          </div>

          {/* Topic Breakdown */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center">
              <Target size={16} className="mr-2 text-slate-400" />
              Performance by Topic
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(topicResults).map(([topic, data]) => (
                <div key={topic} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700 truncate mr-2">{topic}</span>
                    <span className="text-xs font-mono text-slate-400">{data.correct}/{data.total}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-slate-900 h-full transition-all duration-1000"
                      style={{ width: `${(data.correct / data.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles size={18} className="text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">AI Recommendation</h3>
              </div>
              
              {loadingRec ? (
                <div className="flex items-center space-x-3 py-4">
                  <Loader2 size={20} className="animate-spin text-slate-500" />
                  <span className="text-slate-400 text-sm">Analyzing your performance...</span>
                </div>
              ) : (
                <div className="markdown-body prose prose-invert prose-sm max-w-none text-slate-200">
                  <Markdown>{recommendation}</Markdown>
                </div>
              )}
            </div>
            
            {/* Background glow */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-400/10 blur-3xl rounded-full"></div>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 shadow-lg group"
            >
              <span>Return to Dashboard</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
