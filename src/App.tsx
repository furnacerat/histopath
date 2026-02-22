/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, BookOpen, MessageSquare, GraduationCap, Loader2, RefreshCw, Microscope, User } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { FlashcardView } from './components/FlashcardView';
import { QuizView } from './components/QuizView';
import { QuizSummaryView } from './components/QuizSummaryView';
import { TutorView } from './components/TutorView';
import { GuidedCourseView } from './components/GuidedCourseView';
import { SlideBoxView } from './components/SlideBoxView';
import { LabSimulatorView } from './components/LabSimulatorView';
import { CommuterView } from './components/CommuterView';
import { AuthView } from './components/AuthView';
import { ProfileView } from './components/ProfileView';
import { PaywallView } from './components/PaywallView';
import { Topic, UserProgress, Flashcard, Question, TroubleshootingScenario } from './types';
import { geminiService } from './services/geminiService';
import { supabase } from './lib/supabase';
import { cn } from './lib/utils';

type View = 'dashboard' | 'flashcards' | 'quiz' | 'tutor' | 'loading' | 'summary' | 'course' | 'slidebox' | 'simulator' | 'commuter' | 'profile';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [activeTopic, setActiveTopic] = useState<Topic | 'Comprehensive' | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [scenarios, setScenarios] = useState<TroubleshootingScenario[]>([]);
  const [lastQuizResult, setLastQuizResult] = useState<{ score: number; total: number; topicResults: Record<Topic, { correct: number; total: number }> } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingScenarios, setIsGeneratingScenarios] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [session, setSession] = useState<any>(undefined); // undefined = loading, null = logged out
  const [displayName, setDisplayName] = useState('');
  const [plan, setPlan] = useState<string>('free');
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);

  const apiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || '';
  const apiKeyMissing = !apiKey || apiKey === 'your_openai_api_key_here';

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 6000);
  };

  // Auth: listen for session changes and load profile
  useEffect(() => {
    if (!supabase) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) loadProfile(s.user.id);
      else setDisplayName('');
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('profiles')
      .select('display_name, plan, stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();
    if (data?.display_name) setDisplayName(data.display_name);
    if (data?.plan) setPlan(data.plan);
    if (data?.stripe_customer_id) setStripeCustomerId(data.stripe_customer_id);
  };

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setPlan('free');
    setDisplayName('');
    setView('dashboard');
  };

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('histo_progress');
    return saved ? JSON.parse(saved) : {
      completedFlashcards: [],
      quizHistory: [],
      mastery: {
        'Fixation': 0,
        'Processing & Embedding': 0,
        'Microtomy': 0,
        'Staining': 0,
        'Special Stains': 0,
        'Lab Operations & Safety': 0,
        'Anatomy & Physiology': 0,
      },
      currentCourseStep: 0
    };
  });

  useEffect(() => {
    localStorage.setItem('histo_progress', JSON.stringify(progress));
  }, [progress]);

  const handleStartFlashcards = async (topic: Topic) => {
    setIsLoading(true);
    setView('loading');
    try {
      const cards = await geminiService.generateFlashcards(topic);
      setFlashcards(cards);
      setActiveTopic(topic);
      setView('flashcards');
    } catch (error: any) {
      console.error(error);
      showError(`Failed to generate flashcards: ${error?.message || 'API error'}`);
      setView('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = async (topic: Topic | 'Comprehensive') => {
    setIsLoading(true);
    setView('loading');
    try {
      const qs = await geminiService.generateQuiz(topic);
      setQuestions(qs);
      setActiveTopic(topic);
      setView('quiz');
    } catch (error: any) {
      console.error(error);
      showError(`Failed to generate quiz: ${error?.message || 'API error'}`);
      setView('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSpotterQuiz = async () => {
    setIsLoading(true);
    setView('loading');
    try {
      const qs = await geminiService.generateSpotterQuiz(10);
      setQuestions(qs);
      setActiveTopic('Comprehensive');
      setView('quiz');
    } catch (error: any) {
      console.error(error);
      showError(`Failed to generate spotter quiz: ${error?.message || 'API error'}`);
      setView('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSimulator = async () => {
    setIsLoading(true);
    setView('loading');
    try {
      const data = await geminiService.generateTroubleshootingScenarios(15);
      setScenarios(data);
      setView('simulator');
    } catch (error: any) {
      console.error(error);
      showError(`Failed to generate scenarios: ${error?.message || 'API error'}`);
      setView('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMoreScenarios = async () => {
    setIsGeneratingScenarios(true);
    try {
      const data = await geminiService.generateTroubleshootingScenarios(5);
      setScenarios(prev => [...prev, ...data]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingScenarios(false);
    }
  };

  const handleQuizComplete = (score: number, topicResults: Record<Topic, { correct: number; total: number }>) => {
    const result = {
      score,
      total: questions.length,
      topicResults,
      date: new Date().toISOString()
    };

    setLastQuizResult({ score, total: questions.length, topicResults });

    setProgress(prev => {
      const newMastery = { ...prev.mastery };
      Object.entries(topicResults).forEach(([topic, data]) => {
        const t = topic as Topic;
        const currentMastery = newMastery[t] || 0;
        const quizPerformance = (data.correct / data.total) * 100;
        newMastery[t] = Math.min(100, Math.round((currentMastery * 0.7) + (quizPerformance * 0.3)));
      });

      // Advance course step if they passed a module quiz (>= 80%)
      let nextStep = prev.currentCourseStep;
      const percentage = (score / questions.length) * 100;
      if (view === 'quiz' && activeTopic !== 'Comprehensive' && percentage >= 80) {
        nextStep = Math.min(prev.currentCourseStep + 1, 6); // 6 is the max index of GUIDED_COURSE
      }

      return {
        ...prev,
        quizHistory: [...prev.quizHistory, result],
        mastery: newMastery,
        currentCourseStep: nextStep
      };
    });

    setView('summary');
  };

  // Auth gate — loading spinner while session resolves
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  // Show login screen if not authenticated (and Supabase is configured)
  if (supabase && session === null) {
    return <AuthView onAuth={() => { }} />;
  }

  // Show paywall if logged in but not a paying subscriber or admin
  if (supabase && session && plan !== 'pro' && plan !== 'admin') {
    return (
      <PaywallView
        userId={session.user.id}
        userEmail={session.user.email || ''}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* API Key Missing Banner */}
      {apiKeyMissing && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center space-x-3 text-amber-800">
          <span className="text-lg">⚠️</span>
          <p className="text-sm font-medium">
            <strong>OpenAI API key not set.</strong> Add your key to <code className="bg-amber-100 px-1 rounded">.env</code> as <code className="bg-amber-100 px-1 rounded">VITE_OPENAI_API_KEY=sk-...</code> then restart the server.
          </p>
        </div>
      )}

      {/* Error Toast */}
      {errorToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-lg text-sm font-medium flex items-start space-x-3">
          <span>❌</span>
          <span>{errorToast}</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group"
            onClick={() => setView('dashboard')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-900 rounded-lg sm:rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <GraduationCap size={20} />
            </div>
            <span className="text-lg sm:text-xl font-display italic font-bold text-slate-900">HistoPath</span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl sm:rounded-2xl">
            <NavButton
              active={view === 'dashboard'}
              onClick={() => setView('dashboard')}
              icon={<LayoutDashboard size={18} />}
              label="Home"
              mobileLabel=""
            />
            <NavButton
              active={view === 'tutor'}
              onClick={() => setView('tutor')}
              icon={<MessageSquare size={18} />}
              label="AI Tutor"
              mobileLabel=""
            />
            <NavButton
              active={view === 'slidebox'}
              onClick={() => setView('slidebox')}
              icon={<Microscope size={18} />}
              label="Slide Box"
              mobileLabel=""
            />
          </div>

          {/* Profile button */}
          <button
            onClick={() => setView('profile')}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <User size={16} className="text-slate-600" />
            </div>
            {displayName ? (
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{displayName}</span>
            ) : null}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pb-12">
        <AnimatePresence mode="wait">
          {view === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-6"
            >
              <div className="relative">
                <Loader2 size={64} className="text-slate-900 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw size={24} className="text-slate-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-display italic text-slate-800 mb-2">Preparing your study session...</h2>
                <p className="text-slate-500">AI is generating high-quality histology content.</p>
              </div>
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Dashboard
                progress={progress}
                onStartFlashcards={handleStartFlashcards}
                onStartQuiz={handleStartQuiz}
                onStartSpotterQuiz={handleStartSpotterQuiz}
                onStartCourse={() => setView('course')}
                onOpenSlideBox={() => setView('slidebox')}
                onStartSimulator={handleStartSimulator}
                onStartCommuter={() => setView('commuter')}
              />
            </motion.div>
          )}

          {view === 'course' && (
            <motion.div
              key="course"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GuidedCourseView
                progress={progress}
                onStartFlashcards={handleStartFlashcards}
                onStartQuiz={handleStartQuiz}
                onBack={() => setView('dashboard')}
              />
            </motion.div>
          )}

          {view === 'flashcards' && (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <FlashcardView
                cards={flashcards}
                onComplete={() => setView('dashboard')}
              />
            </motion.div>
          )}

          {view === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <QuizView
                questions={questions}
                onComplete={handleQuizComplete}
              />
            </motion.div>
          )}

          {view === 'tutor' && (
            <motion.div
              key="tutor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12"
            >
              <TutorView />
            </motion.div>
          )}

          {view === 'summary' && lastQuizResult && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <QuizSummaryView
                score={lastQuizResult.score}
                total={lastQuizResult.total}
                topicResults={lastQuizResult.topicResults}
                onClose={() => setView('dashboard')}
              />
            </motion.div>
          )}

          {view === 'slidebox' && (
            <motion.div
              key="slidebox"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SlideBoxView onBack={() => setView('dashboard')} />
            </motion.div>
          )}

          {view === 'simulator' && (
            <motion.div
              key="simulator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LabSimulatorView
                scenarios={scenarios}
                onBack={() => setView('dashboard')}
                onGenerateMore={handleGenerateMoreScenarios}
                isGenerating={isGeneratingScenarios}
              />
            </motion.div>
          )}

          {view === 'commuter' && (
            <motion.div
              key="commuter"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <CommuterView
                progress={progress}
                onUpdateProgress={setProgress}
                onBack={() => setView('dashboard')}
                displayName={displayName}
              />
            </motion.div>
          )}

          {view === 'profile' && session && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProfileView
                userId={session.user.id}
                progress={progress}
                onBack={() => setView('dashboard')}
                onSignOut={handleSignOut}
                displayName={displayName}
                onNameChange={setDisplayName}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer — hidden on full-screen views that manage their own layout */}
      {!['slidebox', 'simulator', 'commuter'].includes(view) && (
        <footer className="bg-white border-t border-slate-200 py-8 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span>&copy; 2026 HistoPath Companion</span>
              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
              <span>State License Prep</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-slate-600 transition-colors">ASCP Standards</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Safety Protocols</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Help Center</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; mobileLabel?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center space-x-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-sm transition-all",
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
