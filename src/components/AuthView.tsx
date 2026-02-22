import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthViewProps {
    onAuth: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuth }) => {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) { setError('Supabase not configured.'); return; }
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            if (mode === 'signup') {
                const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
                if (signUpError) throw signUpError;

                // Create profile with display name
                if (data.user && displayName.trim()) {
                    await supabase.from('profiles').insert({
                        id: data.user.id,
                        display_name: displayName.trim(),
                    });
                }

                if (data.session) {
                    onAuth();
                } else {
                    setSuccess('Check your email to confirm your account, then sign in.');
                    setMode('signin');
                }
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw signInError;
                onAuth();
            }
        } catch (err: any) {
            setError(err?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
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
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                        {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                    </h1>
                    <p className="text-slate-500 text-sm mb-8">
                        {mode === 'signin'
                            ? 'Sign in to continue your study sessions.'
                            : 'Join HistoPath and start preparing for your license exam.'}
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    placeholder="e.g. Sarah"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    placeholder="Min. 6 characters"
                                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 mt-2 disabled:opacity-60"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                            <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        {mode === 'signin' ? (
                            <>Don't have an account?{' '}
                                <button onClick={() => { setMode('signup'); setError(null); setSuccess(null); }} className="font-bold text-slate-900 hover:underline">
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>Already have an account?{' '}
                                <button onClick={() => { setMode('signin'); setError(null); setSuccess(null); }} className="font-bold text-slate-900 hover:underline">
                                    Sign in
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
