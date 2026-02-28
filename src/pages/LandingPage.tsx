import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Landmark,
    Brain,
    Zap,
    Play,
    Triangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
    return (
        <div className="relative z-10 flex min-h-screen flex-col">
            {/* Hero Background Pattern */}
            <div className="fixed inset-0 z-0 chart-bg pointer-events-none"></div>
            <div
                className="fixed inset-0 z-0 opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% -20%, #3c83f6 0%, transparent 50%)' }}
            ></div>

            {/* Market Ticker */}
            <div className="w-full bg-slate-900/50 border-b border-white/5 py-2 overflow-hidden relative z-20">
                <div className="ticker-wrap flex">
                    <motion.div
                        className="ticker-content flex gap-12 px-4"
                        initial={{ x: 0 }}
                        animate={{ x: "-50%" }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    >
                        {[1, 2].map((i) => (
                            <React.Fragment key={i}>
                                <TickerItem name="NIFTY 50" value="22,032.50" change="+0.45%" isUp={true} />
                                <TickerItem name="SENSEX" value="72,410.30" change="-0.12%" isUp={false} />
                                <TickerItem name="RELIANCE" value="2,980.15" change="+1.20%" isUp={true} />
                                <TickerItem name="TCS" value="3,945.20" change="+0.85%" isUp={true} />
                            </React.Fragment>
                        ))}
                    </motion.div>
                </div>
            </div>

            <Navbar variant="default" />

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-32 text-center max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    LIVE AI SIGNALS NOW ACTIVE
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-[1.1]"
                >
                    One Terminal. All Your Brokers. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                        Powered by AI.
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
                >
                    Aggregate your portfolio and execute trades across Zerodha, Upstox, Angel One, and Groww with institutional-grade AI insights. No more switching tabs.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
                >
                    <Link to="/auth" className="w-full sm:w-auto">
                        <button className="w-full min-w-[200px] bg-primary hover:bg-primary/90 text-white text-lg font-bold py-4 px-8 rounded-xl transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2 group">
                            Start Trading Free
                            <ArrowRight className="group-hover:translate-x-1 transition-transform w-5 h-5" />
                        </button>
                    </Link>
                    <button className="w-full sm:w-auto min-w-[200px] glass hover:bg-white/10 text-white text-lg font-bold py-4 px-8 rounded-xl transition-all">
                        Explore Features
                    </button>
                </motion.div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mt-24 w-full relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-blue-600/50 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative glass rounded-2xl p-2 border border-white/10 overflow-hidden aspect-video md:aspect-[21/9] flex items-center justify-center">
                        <img
                            className="w-full h-full object-cover rounded-xl opacity-80"
                            alt="Dark fintech dashboard"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLs4v-BEJBTr6g-WgSeYrXpy07SdBdZw7F0h1cQoCGKpgCkXxObLndxbt9rZk7dUVUIUFzZOw0jeMhIiqA_BJv4ObkzPpD2d9l8JWqvJ6ZSjJkC0yQL-wO3sbHRfHyyGIVvE16l1POpk-nwielKME6ksGt87jdgWuZJQzKkwy-a95IjkxitkPq2ik3b2JQu1lJ-jD-CpJhxqE0rWHXzzB9UgTne7KrtitAtSDUcSHLZlq0Ooz358TqydaaiRbtmdXrVdQbHoVJUg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-background-dark/40 backdrop-blur-[2px]">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                                    <Play className="text-white fill-current w-8 h-8 ml-1" />
                                </div>
                                <p className="text-white font-bold text-lg">Watch 60s Demo</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Broker Trust Section */}
            <section className="py-20 border-t border-white/5 bg-slate-900/30">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-center text-slate-500 text-sm font-bold tracking-[0.2em] mb-12 uppercase">
                        Connect with leading Indian Brokers
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all">
                        <BrokerLogo name="ZERODHA" />
                        <BrokerLogo name="UPSTOX" />
                        <BrokerLogo name="ANGEL ONE" />
                        <BrokerLogo name="GROWW" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 max-w-7xl mx-auto w-full">
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Landmark className="text-primary w-6 h-6" />}
                        title="Unified Portfolio"
                        description="See your complete net worth across all linked brokers in one consolidated view. Real-time P&L tracking without logging into 5 different apps."
                    />
                    <FeatureCard
                        icon={<Brain className="text-primary w-6 h-6" />}
                        title="AI-Generated Insights"
                        description="Get predictive signals based on technical analysis and market sentiment. Our AI scans millions of data points to highlight the best entry levels."
                    />
                    <FeatureCard
                        icon={<Zap className="text-primary w-6 h-6" />}
                        title="Direct API Execution"
                        description="Execute multi-leg strategies across different brokers simultaneously with ultra-low latency. Professional execution for retail traders."
                    />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4">
                <div className="max-w-5xl mx-auto glass rounded-[2rem] p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 blur-[100px] -ml-32 -mb-32"></div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10">
                        Ready to trade smarter?
                    </h2>
                    <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto relative z-10">
                        Join over 50,000+ traders who are already using Vertex AI to streamline their trading workflow.
                    </p>
                    <div className="relative z-10">
                        <Link to="/onboarding">
                            <button className="bg-primary hover:bg-primary/90 text-white text-lg font-bold py-4 px-12 rounded-xl transition-all shadow-xl shadow-primary/30">
                                Get Started For Free
                            </button>
                        </Link>
                        <p className="text-slate-500 text-sm mt-4">
                            No credit card required. Connect your first broker in 30 seconds.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

const TickerItem = ({ name, value, change, isUp }: { name: string, value: string, change: string, isUp: boolean }) => (
    <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{name}</span>
        <span className="text-xs font-mono font-medium text-white">{value}</span>
        <span className={`text-[10px] font-bold ${isUp ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-0.5`}>
            {isUp ? <Triangle className="w-2 h-2 fill-current" /> : <Triangle className="w-2 h-2 fill-current rotate-180" />}
            {change}
        </span>
    </div>
);

const BrokerLogo = ({ name }: { name: string }) => (
    <div className="flex flex-col items-center gap-2 group cursor-pointer">
        <div className="h-12 w-32 bg-slate-800/50 rounded-lg flex items-center justify-center group-hover:bg-slate-700 transition-colors border border-white/5">
            <span className="text-white font-black text-xl tracking-tighter italic opacity-80 group-hover:opacity-100">{name}</span>
        </div>
    </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass p-8 rounded-2xl hover:border-primary/50 transition-all group"
    >
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <p className="text-slate-400 leading-relaxed">
            {description}
        </p>
    </motion.div>
);

export default LandingPage;
