import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, GraduationCap, BrainCircuit, ShieldCheck, Activity, Microscope, FlaskConical, Beaker, Play, ArrowRight, AlertTriangle, Headphones } from 'lucide-react';
import { Topic, UserProgress } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  progress: UserProgress;
  onStartFlashcards: (topic: Topic) => void;
  onStartQuiz: (topic: Topic | 'Comprehensive') => void;
  onStartSpotterQuiz: () => void;
  onStartCourse: () => void;
  onOpenSlideBox: () => void;
  onStartSimulator: () => void;
  onStartCommuter: () => void;
}

const TOPICS: { name: Topic; icon: any; color: string }[] = [
  { name: 'Fixation', icon: FlaskConical, color: 'bg-blue-500' },
  { name: 'Processing & Embedding', icon: Beaker, color: 'bg-indigo-500' },
  { name: 'Microtomy', icon: Microscope, color: 'bg-emerald-500' },
  { name: 'Staining', icon: Activity, color: 'bg-rose-500' },
  { name: 'Special Stains', icon: BrainCircuit, color: 'bg-violet-500' },
  { name: 'Lab Operations & Safety', icon: ShieldCheck, color: 'bg-amber-500' },
  { name: 'Anatomy & Physiology', icon: BookOpen, color: 'bg-slate-500' },
];

export const Dashboard: React.FC<DashboardProps> = ({ progress, onStartFlashcards, onStartQuiz, onStartSpotterQuiz, onStartCourse, onOpenSlideBox, onStartSimulator, onStartCommuter }) => {
  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 rounded-3xl sm:rounded-[40px] p-8 sm:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6">
            <GraduationCap size={14} />
            <span>License Prep Suite</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display italic mb-4 sm:mb-6 leading-tight">
            Master Histology <br />
            <span className="text-slate-400">with Precision.</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
            Comprehensive study tools designed for the Histology State License. 
            AI-powered tutoring, interactive flashcards, and realistic practice exams.
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <button 
              onClick={onStartCourse}
              className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-all shadow-lg text-sm sm:text-base flex items-center justify-center space-x-2"
            >
              <Play size={18} className="fill-current" />
              <span>{progress.currentCourseStep > 0 ? 'Continue Guided Course' : 'Start Guided Course'}</span>
            </button>
            <button 
              onClick={onStartSpotterQuiz}
              className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-500 transition-all shadow-lg text-sm sm:text-base flex items-center justify-center space-x-2"
            >
              <Microscope size={18} />
              <span>Spotter Quiz</span>
            </button>
            <button 
              onClick={onStartSimulator}
              className="px-8 py-4 bg-amber-500 text-white rounded-full font-bold hover:bg-amber-400 transition-all shadow-lg text-sm sm:text-base flex items-center justify-center space-x-2"
            >
              <AlertTriangle size={18} />
              <span>Simulator</span>
            </button>
            <button 
              onClick={onStartCommuter}
              className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-500 transition-all shadow-lg text-sm sm:text-base flex items-center justify-center space-x-2"
            >
              <Headphones size={18} />
              <span>Commuter</span>
            </button>
            <button 
              onClick={() => onStartQuiz('Comprehensive')}
              className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-full font-bold hover:bg-white/20 transition-all text-sm sm:text-base"
            >
              Full Mock Exam
            </button>
          </div>
        </div>
        
        {/* Decorative elements - hidden on small mobile */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none hidden sm:block">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 border-[40px] border-white rounded-full"></div>
          <div className="absolute top-1/4 right-1/4 w-48 h-48 border-[20px] border-white rounded-full"></div>
        </div>
      </section>

      {/* Topics Grid */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 space-y-2 sm:space-y-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display italic text-slate-900">Study by Topic</h2>
            <p className="text-slate-500 text-sm sm:text-base">Focus on specific areas of the state exam.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Virtual Slide Box Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-2 lg:col-span-1 bg-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between group cursor-pointer"
            onClick={onOpenSlideBox}
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Microscope size={24} />
              </div>
              <h3 className="text-2xl font-display italic mb-2">Virtual Slide Box</h3>
              <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                Explore high-resolution digital slides with AI-powered morphological analysis.
              </p>
            </div>
            <div className="relative z-10 flex items-center text-sm font-bold group-hover:translate-x-2 transition-transform">
              <span>Enter Slide Box</span>
              <ArrowRight size={16} className="ml-2" />
            </div>
            
            {/* Background pattern */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 blur-3xl rounded-full"></div>
          </motion.div>

          {TOPICS.map((topic, i) => (
            <motion.div
              key={topic.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:border-slate-300 transition-all"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg", topic.color)}>
                <topic.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{topic.name}</h3>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mb-6 overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", topic.color)}
                  style={{ width: `${progress.mastery[topic.name] || 0}%` }}
                ></div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => onStartFlashcards(topic.name)}
                  className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all"
                >
                  Flashcards
                </button>
                <button
                  onClick={() => onStartQuiz(topic.name)}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
                >
                  Quiz
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
