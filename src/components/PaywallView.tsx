import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
    GraduationCap, CheckCircle2, Loader2, LogOut, Sparkles,
    BrainCircuit, Microscope, MessageSquare, Headphones, FlaskConical
} from 'lucide-react';
import { redirectToCheckout } from '../lib/stripe';

interface PaywallViewProps {
    userId: string;
    userEmail: string;
    onSignOut: () => void;
}

const FEATURES = [
    { icon: <BrainCircuit size={18} />, text: 'AI-generated quizzes & flashcards' },
    { icon: <Microscope size={18} />, text: 'Virtual Slide Box with DALL·E images' },
    { icon: <Sparkles size={18} />, text: 'Spotter Quiz (10 image-based questions)' },
    { icon: <MessageSquare size={18} />, text: 'AI Tutor — ask anything, get expert answers' },
    { icon: <Headphones size={18} />, text: 'Commuter Companion — hands-free voice study' },
    { icon: <FlaskConical size={18} />, text: 'Lab Simulator — troubleshooting scenarios' },
];

export const PaywallView: React.FC<PaywallViewProps> = ({ userId, userEmail, onSignOut }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubscribe = async () => {
        setLoading(true);
        setError(null);
        try {
            await redirectToCheckout(userId, userEmail);
        } catch (err: any) {
            setError(err?.message || 'Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex items-center justify-center space-x-3 mb-10">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                        <GraduationCap size={24} />
                    </div>
                    <span className="text-2xl font-display italic font-bold text-slate-900">HistoPath</span>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
                    {/* Pricing header */}
                    <div className="text-center mb-8">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                            Full Access
                        </span>
                        <div className="mt-4">
                            <span className="text-5xl font-black text-slate-900">$12.95</span>
                            <span className="text-slate-500 ml-1">/month</span>
                        </div>
                        <p className="text-slate-500 text-sm mt-2">
                            Everything you need to pass your histology state license exam.
                        </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                        {FEATURES.map((f, i) => (
                            <li key={i} className="flex items-center space-x-3">
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                <span className="text-sm text-slate-700">{f.text}</span>
                            </li>
                        ))}
                    </ul>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-700">{error}</div>
                    )}

                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-base hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                    >
                        {loading ? (
                            <><Loader2 size={20} className="animate-spin" /><span>Redirecting to checkout…</span></>
                        ) : (
                            <><Sparkles size={20} /><span>Subscribe — $12.95/month</span></>
                        )}
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-4">
                        Cancel anytime. Powered by Stripe — 100% secure.
                    </p>
                </div>

                {/* Sign out */}
                <button
                    onClick={onSignOut}
                    className="mt-6 w-full flex items-center justify-center space-x-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <LogOut size={14} />
                    <span>Sign out</span>
                </button>
            </motion.div>
        </div>
    );
};
