import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
    GraduationCap, CheckCircle2, Loader2, LogOut, Sparkles,
    BrainCircuit, Microscope, MessageSquare, Headphones, FlaskConical,
    Star, BookOpen, Clock, Shield
} from 'lucide-react';
import { redirectToCheckout } from '../lib/stripe';

interface PaywallViewProps {
    userId: string;
    userEmail: string;
    onSignOut: () => void;
}

const FEATURES = [
    {
        icon: <BrainCircuit size={20} className="text-indigo-500" />,
        title: 'AI-Powered Quizzes',
        desc: 'Unlimited AI-generated histology questions covering fixation, staining, embedding, and more — tailored to ASCP HT exam topics.'
    },
    {
        icon: <Microscope size={20} className="text-indigo-500" />,
        title: 'Virtual Slide Box',
        desc: 'Study realistic DALL·E-generated histology photomicrographs across every tissue type — no physical slides needed.'
    },
    {
        icon: <Sparkles size={20} className="text-indigo-500" />,
        title: 'Spotter Quiz',
        desc: 'Identify tissues and structures from AI-generated images — exactly like the visual identification section of your state license exam.'
    },
    {
        icon: <MessageSquare size={20} className="text-indigo-500" />,
        title: 'AI Tutor',
        desc: 'Ask any histotechnology question and get expert-level explanations. Like having a board-certified HT mentor available 24/7.'
    },
    {
        icon: <Headphones size={20} className="text-indigo-500" />,
        title: 'Commuter Companion',
        desc: 'Hands-free voice study mode — review histology concepts during your commute, at the gym, or anywhere.'
    },
    {
        icon: <FlaskConical size={20} className="text-indigo-500" />,
        title: 'Lab Simulator',
        desc: 'Troubleshoot realistic lab scenarios — artifact identification, processing failures, staining problems, and QC issues.'
    },
];

const STATS = [
    { icon: <BookOpen size={18} />, value: '6', label: 'Study Modes' },
    { icon: <Clock size={18} />, value: '24/7', label: 'AI Availability' },
    { icon: <Star size={18} />, value: 'ASCP', label: 'Exam Aligned' },
    { icon: <Shield size={18} />, value: '100%', label: 'Secure' },
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
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                            <GraduationCap size={24} />
                        </div>
                        <span className="text-2xl font-display italic font-bold text-slate-900">HistoPath</span>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 leading-tight"
                    >
                        Pass Your Histotechnology<br />
                        <span className="text-indigo-600">License Exam — Guaranteed</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="text-lg text-slate-600 max-w-2xl mx-auto mb-8"
                    >
                        The only AI-powered study app built specifically for histology and histotechnology
                        state licensing exams. Quizzes, virtual slides, voice study mode, and a 24/7 AI tutor —
                        all in one place.
                    </motion.p>

                    {/* Stats row */}
                    <div className="flex justify-center space-x-6 sm:space-x-10 mb-10">
                        {STATS.map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="flex justify-center text-indigo-500 mb-1">{s.icon}</div>
                                <p className="text-xl font-black text-slate-900">{s.value}</p>
                                <p className="text-xs text-slate-500">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA card */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900 text-white rounded-3xl p-8 max-w-sm mx-auto shadow-2xl"
                    >
                        <div className="mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 bg-indigo-900/50 px-3 py-1 rounded-full">
                                Full Access
                            </span>
                        </div>
                        <div className="mb-2">
                            <span className="text-5xl font-black">$12.95</span>
                            <span className="text-slate-400 ml-1">/month</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-6">Cancel anytime. No commitments.</p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-900/50 rounded-xl text-sm text-red-300">{error}</div>
                        )}

                        <button
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-base hover:bg-indigo-500 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <><Loader2 size={20} className="animate-spin" /><span>Redirecting…</span></>
                            ) : (
                                <><Sparkles size={20} /><span>Get Full Access</span></>
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-3">
                            Powered by Stripe — 100% secure payment
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Features section */}
            <div className="max-w-4xl mx-auto px-6 py-16">
                <h2 className="text-2xl font-black text-slate-900 text-center mb-2">
                    Everything You Need to Pass
                </h2>
                <p className="text-slate-500 text-center mb-10">
                    Six study modes covering every aspect of the histotechnology licensing exam.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl border border-slate-100 p-5 flex space-x-4"
                        >
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                {f.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Secondary CTA */}
                <div className="text-center mt-12">
                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all inline-flex items-center space-x-2"
                    >
                        <Sparkles size={18} />
                        <span>Start Studying — $12.95/month</span>
                    </button>
                </div>

                {/* Why HistoPath */}
                <div className="mt-16 bg-indigo-50 rounded-3xl p-8">
                    <h2 className="text-xl font-black text-slate-900 mb-3">
                        Why histotechs choose HistoPath
                    </h2>
                    <div className="space-y-3">
                        {[
                            'Built by a histotech, for histotechs — not a generic study app repurposed for HT',
                            'Covers ASCP HT exam domains: fixation, processing, embedding, microtomy, staining, QC, and lab operations',
                            'AI generates fresh questions every session — no repetitive question banks',
                            'Study during your commute with hands-free voice mode',
                            'Virtual slide images generated by DALL·E 3 — practice visual ID anytime, anywhere',
                        ].map((point, i) => (
                            <div key={i} className="flex items-start space-x-3">
                                <CheckCircle2 size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                                <span className="text-sm text-slate-700">{point}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sign out footer */}
            <div className="text-center pb-8">
                <button
                    onClick={onSignOut}
                    className="text-sm text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center space-x-1.5"
                >
                    <LogOut size={13} />
                    <span>Sign out</span>
                </button>
            </div>
        </div>
    );
};
