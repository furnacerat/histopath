/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Topic =
  | 'Fixation'
  | 'Processing & Embedding'
  | 'Microtomy'
  | 'Staining'
  | 'Special Stains'
  | 'Lab Operations & Safety'
  | 'Anatomy & Physiology';

export interface Flashcard {
  id: string;
  topic: Topic;
  question: string;
  answer: string;
}

export interface Question {
  id: string;
  topic: Topic;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  imageUrl?: string;
}

export interface QuizResult {
  score: number;
  total: number;
  topicResults: Record<Topic, { correct: number; total: number }>;
  date: string;
}

export interface CommuterSession {
  lastTopic?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  recentSuccessRate: number; // 0 to 1
  conversationHistory: { role: 'user' | 'model'; text: string }[];
}

export interface UserProgress {
  completedFlashcards: string[];
  quizHistory: QuizResult[];
  mastery: Record<Topic, number>; // 0-100
  currentCourseStep: number;
  commuterSession?: CommuterSession;
}

export interface Slide {
  id: string;
  title: string;
  description: string;
  topic: Topic;
  imageUrl?: string | null;
  magnification: string;
  stain: string;
}

export interface TroubleshootingScenario {
  id: string;
  title: string;
  problemDescription: string;
  observation: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  imageUrl?: string;
}

export interface CourseStep {
  id: number;
  title: string;
  description: string;
  topic: Topic;
  objectives: string[];
}
