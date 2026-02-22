import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Save, LogOut, Loader2, BookOpen, BrainCircuit, Trophy, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProgress, Topic } from '../types';

interface ProfileViewProps {
    userId: string;
    progress: UserProgress;
    onBack: () => void;
    onSignOut: () => void;
    displayName: string;
    onNameChange: (name: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
    userId,
    progress,
    onBack,
    onSignOut,
    displayName,
    onNameChange,
}) => {
    const [name, setName] = useState(displayName);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setName(displayName);
    }, [displayName]);

    const handleSave = async () => {
        if (!supabase) return;
        setSaving(true);
        try {
            await supabase.from('profiles').upsert({
                id: userId,
                display_name: name.trim(),
                updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
            onNameChange(name.trim());
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save profile:', err);
        } finally {
            setSaving(false);
        }
    };

    const totalQuizzes = progress.quizHistory.length;
    const avgScore = totalQuizzes > 0
        ? Math.round(progress.quizHistory.reduce((sum, q) => sum + (q.score / q.total) * 100, 0) / totalQuizzes)
        : 0;
    const masteryValues = Object.values(progress.mastery);
    const avgMastery = masteryValues.length > 0
        ? Math.round(masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length)
        : 0;

    const topTopic = Object.entries(progress.mastery)
        .sort(([, a], [, b]) => b - a)[0] as [Topic, number] | undefined;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
            </div>

            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8"
            >
                <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                        <User size={28} />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-slate-900">{displayName || 'Student'}</p>
                        <p className="text-sm text-slate-500">HistoPath Member</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your first name"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                        />
                        <p className="text-xs text-slate-400 mt-1.5">The AI tutor and Commuter Companion will use this name.</p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        <span>{saved ? 'Saved!' : 'Save Changes'}</span>
                    </button>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8"
            >
                <h2 className="text-lg font-bold text-slate-900 mb-6">Study Stats</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-2xl p-4 text-center">
                        <div className="flex justify-center mb-2"><Trophy size={20} className="text-amber-500" /></div>
                        <p className="text-2xl font-bold text-slate-900">{totalQuizzes}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Quizzes Done</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 text-center">
                        <div className="flex justify-center mb-2"><BrainCircuit size={20} className="text-indigo-500" /></div>
                        <p className="text-2xl font-bold text-slate-900">{avgScore}%</p>
                        <p className="text-xs text-slate-500 mt-0.5">Avg Score</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 text-center">
                        <div className="flex justify-center mb-2"><BookOpen size={20} className="text-emerald-500" /></div>
                        <p className="text-2xl font-bold text-slate-900">{avgMastery}%</p>
                        <p className="text-xs text-slate-500 mt-0.5">Avg Mastery</p>
                    </div>
                </div>

                {topTopic && (
                    <div className="bg-indigo-50 rounded-2xl p-4 flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Trophy size={14} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Strongest Topic</p>
                            <p className="text-sm font-bold text-slate-900">{topTopic[0]} — {topTopic[1]}%</p>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Sign Out */}
            <button
                onClick={onSignOut}
                className="w-full flex items-center justify-center space-x-2 py-3.5 border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
            >
                <LogOut size={18} />
                <span>Sign Out</span>
            </button>
        </div>
    );
};
