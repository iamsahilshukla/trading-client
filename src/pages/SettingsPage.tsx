import React from 'react';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon,
    Shield,
    Link as LinkIcon,
    Trash2,
    Plus,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Landmark,
    Zap,
    Monitor,
    Layers
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const TriangleIcon = ({ color }: { color: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4L4 20H20L12 4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BROKER_METADATA: Record<string, { name: string; icon: React.ReactNode }> = {
    ZERODHA: { name: 'Zerodha', icon: <TriangleIcon color="#E33E33" /> },
    GROWW: { name: 'Groww', icon: <Landmark className="text-emerald-500 w-6 h-6" /> },
    UPSTOX: { name: 'Upstox', icon: <Monitor className="text-primary w-6 h-6" /> },
    ANGEL: { name: 'Angel One', icon: <Zap className="text-orange-500 w-6 h-6" /> },
    FYERS: { name: 'Fyers', icon: <Landmark className="text-emerald-500 w-6 h-6" /> },
    ICICI: { name: 'ICICI Direct', icon: <Layers className="text-blue-800 w-6 h-6" /> },
};

const SettingsPage = () => {
    const { user, refreshAuth } = useAuth();
    const navigate = useNavigate();
    const [disconnecting, setDisconnecting] = React.useState<string | null>(null);

    const connectedBrokers = user?.connectedBrokers || [];
    const availableBrokers = Object.keys(BROKER_METADATA).filter(id => !connectedBrokers.includes(id));

    const handleDisconnect = async (brokerId: string) => {
        if (!window.confirm(`Are you sure you want to disconnect ${brokerId}?`)) return;

        setDisconnecting(brokerId);
        try {
            await api.delete(`/broker/${brokerId}`);
            await refreshAuth();
        } catch (error) {
            console.error('Failed to disconnect broker', error);
            alert('Failed to disconnect broker. Please try again.');
        } finally {
            setDisconnecting(null);
        }
    };

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col">
            <Navbar />

            <main className="max-w-4xl mx-auto w-full py-12 px-6 space-y-12 relative z-10">
                <header className="space-y-2">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <SettingsIcon className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">Account Settings</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Manage Integrations</h1>
                    <p className="text-slate-400 font-medium">Connect multiple brokerage accounts to unify your portfolio tracking.</p>
                </header>

                {/* Connected Brokers Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                            Connected Brokers
                        </h2>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{connectedBrokers.length} ACTIVE</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {connectedBrokers.length > 0 ? connectedBrokers.map((brokerId) => {
                            const meta = BROKER_METADATA[brokerId] || { name: brokerId, icon: <AlertCircle /> };
                            return (
                                <motion.div
                                    key={brokerId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:border-primary/30 transition-all backdrop-blur-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                            {meta.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{meta.name}</h3>
                                            <p className="text-xs text-emerald-500 font-bold uppercase tracking-tighter">Connection Active</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={!!disconnecting}
                                            className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-50"
                                        >
                                            <SettingsIcon className="size-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDisconnect(brokerId)}
                                            disabled={!!disconnecting}
                                            className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                        >
                                            {disconnecting === brokerId ? (
                                                <div className="size-5 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 className="size-5" />
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <div className="bg-slate-900/30 border border-dashed border-white/10 rounded-2xl p-12 text-center space-y-4">
                                <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                    <LinkIcon className="text-slate-600 w-8 h-8" />
                                </div>
                                <p className="text-slate-500 font-medium">No brokers connected yet. Start by adding one below.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Available Brokers Section */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Plus className="text-primary w-5 h-5" />
                        Available Integrations
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableBrokers.map((brokerId) => {
                            const meta = BROKER_METADATA[brokerId];
                            return (
                                <button
                                    key={brokerId}
                                    onClick={() => navigate('/onboarding')}
                                    className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:border-primary/50 transition-all text-left backdrop-blur-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
                                            {meta.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{meta.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium">Connect via API Key</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-700 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Security Footer */}
                <footer className="bg-primary/5 border border-primary/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="size-16 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0">
                        <Shield className="text-primary w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-white">Your data stays local</h4>
                        <p className="text-sm text-slate-400">Vertex AI encrypts your API keys with bank-grade AES-256 before storing them. Your funds never leave your broker account.</p>
                    </div>
                </footer>
            </main>

            {/* Background Polish */}
            <div className="fixed top-0 right-0 -z-0 w-1/2 h-1/2 opacity-20 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl"></div>
            </div>
            <div className="fixed bottom-0 left-0 -z-0 w-1/2 h-1/2 opacity-20 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-tr from-primary/20 to-transparent blur-3xl"></div>
            </div>
        </div>
    );
};

export default SettingsPage;
