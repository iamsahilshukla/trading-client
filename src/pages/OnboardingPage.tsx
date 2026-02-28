import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    ShieldCheck,
    Info,
    Eye,
    EyeOff,
    ChevronRight,
    Monitor,
    LayoutGrid,
    Zap,
    Landmark,
    Layers,
    Loader2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const TriangleIcon = ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4L4 20H20L12 4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BROKERS = [
    { id: 'ZERODHA', name: 'Zerodha', icon: <TriangleIcon color="#E33E33" /> },
    { id: 'GROWW', name: 'Groww', icon: <Landmark className="text-emerald-500 w-6 h-6" /> },
    { id: 'UPSTOX', name: 'Upstox', icon: <Monitor className="text-primary w-6 h-6" /> },
    { id: 'ANGEL', name: 'Angel One', icon: <Zap className="text-orange-500 w-6 h-6" /> },
    { id: 'FYERS', name: 'Fyers', icon: <Landmark className="text-emerald-500 w-6 h-6" /> },
    { id: 'ICICI', name: 'ICICI Direct', icon: <Layers className="text-blue-800 w-6 h-6" /> },
];

const OnboardingPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [selectedBroker, setSelectedBroker] = useState('ZERODHA');
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/auth');
            }
        }
    }, [user, authLoading, navigate]);

    const handleConnect = async () => {
        if (!apiKey || !apiSecret) {
            alert('Please enter both API Key and API Secret');
            return;
        }

        setLoading(true);
        try {
            await api.post('/broker/connect', {
                broker: selectedBroker,
                apiKey,
                apiSecret
            });

            // Redirect to the public broker login endpoint with user context
            // This ensures browser navigation works without losing auth headers
            if (user?.userId) {
                console.log(`[OnboardingPage] Redirecting to login for user: ${user.userId}`);
                window.location.href = `http://localhost:3000/broker/${selectedBroker.toLowerCase()}/login?userId=${user.userId}`;
            } else {
                console.error('[OnboardingPage] Missing userId, cannot redirect');
                alert('Authentication error. Please log in again.');
            }
        } catch (error) {
            console.error('Error connecting broker', error);
            alert('Failed to connect broker. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col">
            <Navbar variant="minimal" />

            <main className="flex-1 flex flex-col items-center justify-start py-12 px-6 relative z-10">
                <div className="max-w-2xl w-full space-y-10">

                    {/* Progress Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Step 2 of 3</span>
                            <span className="text-sm text-slate-400 font-medium">Connect Broker</span>
                        </div>
                        <div className="w-full h-1.5 bg-border-dark rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "66%" }}
                                className="h-full bg-primary rounded-full"
                            ></motion.div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">Connect Your Broker API</h2>
                        <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
                            Vertex AI doesn't hold your funds. We just provide the interface to automate your trading strategies.
                        </p>
                    </div>

                    {/* Broker Selection */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Select your Broker</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {BROKERS.map((broker) => (
                                <button
                                    key={broker.id}
                                    onClick={() => setSelectedBroker(broker.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 rounded-xl border transition-all",
                                        selectedBroker === broker.id
                                            ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(60,131,246,1)]"
                                            : "border-white/10 bg-slate-900/50 hover:border-primary/50 hover:bg-primary/5"
                                    )}
                                >
                                    <div className="h-10 w-10 mb-2 flex items-center justify-center">
                                        {broker.icon}
                                    </div>
                                    <span className="text-xs font-bold">{broker.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <motion.div
                        layout
                        className="bg-slate-900/50 p-8 rounded-2xl border border-white/10 shadow-xl space-y-6 backdrop-blur-sm"
                    >
                        <div className="grid grid-cols-1 gap-6">
                            {/* API Key */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <label className="text-sm font-semibold text-slate-300">API Key</label>
                                    <div className="group relative">
                                        <Info className="text-slate-500 w-4 h-4 cursor-help" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-[10px] rounded leading-tight w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 border border-white/10">
                                            Found in your broker's developer dashboard under 'App Settings'.
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your API Key"
                                    className="w-full bg-background-dark border-white/10 rounded-lg px-4 py-3 text-sm focus:ring-primary focus:border-primary placeholder-slate-600 text-white transition-all"
                                />
                            </div>

                            {/* API Secret */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <label className="text-sm font-semibold text-slate-300">API Secret</label>
                                    <div className="group relative">
                                        <Info className="text-slate-500 w-4 h-4 cursor-help" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-[10px] rounded leading-tight w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 border border-white/10">
                                            Keep this secret. This is used to sign your requests securely.
                                        </div>
                                    </div>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showSecret ? "text" : "password"}
                                        value={apiSecret}
                                        onChange={(e) => setApiSecret(e.target.value)}
                                        placeholder="••••••••••••••••"
                                        className="w-full bg-background-dark border-white/10 rounded-lg px-4 py-3 text-sm focus:ring-primary focus:border-primary placeholder-slate-600 text-white transition-all"
                                    />
                                    <button
                                        onClick={() => setShowSecret(!showSecret)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Security Note */}
                        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-primary/10 rounded-lg border border-primary/20">
                            <ShieldCheck className="text-primary w-5 h-5" />
                            <span className="text-xs font-semibold text-primary tracking-wide uppercase">Bank-grade 256-bit encryption</span>
                        </div>

                        {/* Action */}
                        <button
                            onClick={handleConnect}
                            disabled={loading}
                            className={cn(
                                "w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group",
                                loading && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <span>Verify & Connect</span>
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform w-5 h-5" />
                                </>
                            )}
                        </button>
                    </motion.div>

                    {/* Help */}
                    <p className="text-center text-sm text-slate-500">
                        Need help finding your credentials? <a href="#" className="text-primary hover:underline font-medium">Read our setup guide</a>
                    </p>
                </div>
            </main>

            {/* Background Decoration */}
            <div className="fixed top-0 right-0 -z-0 w-1/2 h-1/2 opacity-40">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl"></div>
            </div>
            <div className="fixed bottom-0 left-0 -z-0 w-1/2 h-1/2 opacity-40">
                <div className="w-full h-full bg-gradient-to-tr from-primary/10 to-transparent blur-3xl"></div>
            </div>
        </div>
    );
};

export default OnboardingPage;
