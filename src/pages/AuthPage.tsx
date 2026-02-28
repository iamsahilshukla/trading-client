import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    ShieldCheck,
    Triangle,
    Github
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user) {
            if (!user.brokerConnected) {
                navigate('/onboarding');
            } else {
                const origin = (location.state as any)?.from?.pathname || '/dashboard';
                navigate(origin);
            }
        }
    }, [user, navigate, location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Polish */}
            <div className="fixed inset-0 z-0 chart-bg opacity-30 pointer-events-none"></div>
            <div className="fixed top-0 right-0 -z-0 w-1/2 h-1/2 opacity-40">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative z-10"
            >
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="size-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20 rotate-12 group hover:rotate-0 transition-transform duration-500">
                        <Triangle className="text-white w-8 h-8 fill-current" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">
                        {isLogin ? 'Enter your credentials to access your terminal' : 'Join 50,000+ traders scaling with Vertex AI'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 size-5" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-slate-950/50 border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 size-5" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-slate-950/50 border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-lg text-xs font-bold"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin size-5" /> : (
                            <>
                                <span>{isLogin ? 'Log In' : 'Sign Up'}</span>
                                <ArrowRight className="group-hover:translate-x-1 transition-transform size-5" />
                            </>
                        )}
                    </button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-slate-900/50 px-2 text-slate-600">Or continue with</span></div>
                    </div>

                    <button type="button" className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2">
                        <Github className="size-5" />
                        <span>GitHub</span>
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-white/5">
                    <p className="text-sm text-slate-500">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-primary font-bold hover:underline"
                        >
                            {isLogin ? 'Create one now' : 'Log in here'}
                        </button>
                    </p>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600">
                    <ShieldCheck className="size-3" />
                    SECURE AES-256 ENCRYPTION
                </div>
            </motion.div>

            <div className="mt-8 flex gap-6 relative z-10">
                <a href="#" className="text-xs text-slate-600 hover:text-slate-400 font-bold transition-colors uppercase tracking-widest">Privacy</a>
                <a href="#" className="text-xs text-slate-600 hover:text-slate-400 font-bold transition-colors uppercase tracking-widest">Terms</a>
                <a href="#" className="text-xs text-slate-600 hover:text-slate-400 font-bold transition-colors uppercase tracking-widest">Support</a>
            </div>
        </div>
    );
};

export default AuthPage;
