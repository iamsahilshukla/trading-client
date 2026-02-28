import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    PlusCircle,
    Wallet,
    TrendingUp,
    TrendingDown,
    MessageCircle,
    Triangle,
    Loader2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { WishlistWidget } from '../components/dashboard/WishlistWidget';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const DashboardPage = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [portfolio, setPortfolio] = useState<any>(null);
    const [holdings, setHoldings] = useState<any[]>([]);
    const [indices, setIndices] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/');
            } else if (!user.brokerConnected) {
                navigate('/onboarding');
            }
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (user) {
                // Portfolio data — must always load
                try {
                    const [summaryRes, holdingsRes] = await Promise.all([
                        api.get('/portfolio/summary'),
                        api.get('/portfolio/holdings/normalized'),
                    ]);
                    setPortfolio(summaryRes.data);
                    setHoldings(holdingsRes.data.holdings);
                } catch (error) {
                    console.error('Error fetching portfolio data', error);
                } finally {
                    setLoading(false);
                }

                // Market indices — optional, failure must not affect portfolio display
                try {
                    const quoteRes = await api.get('/market/quote?symbols=NSE:NIFTY%2050,NSE:NIFTY%20BANK&broker=GROWW');
                    setIndices(quoteRes.data);
                } catch (error) {
                    console.error('Error fetching market indices', error);
                }
            } else {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user]);

    if (authLoading || (loading && !portfolio)) {
        return (
            <div className="bg-background-dark text-slate-100 min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const summary = portfolio?.holdings || { investedValue: 0, currentValue: 0, totalPnl: 0, returnPercent: 0 };
    const dayPnl = portfolio?.positions?.dayPnl || 0;

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen flex overflow-hidden">
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b border-white/5 bg-slate-950/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-6">
                        {/* NIFTY 50 */}
                        {(() => {
                            const nifty = indices?.['NSE:NIFTY 50'];
                            const ltp = nifty?.last_price || 0;
                            const change = nifty?.net_change || 0;
                            const prevClose = ltp - change;
                            const pctChange = prevClose > 0 ? (change / prevClose) * 100 : 0;
                            const isPositive = change >= 0;

                            return (
                                <div className={cn(
                                    "flex items-center gap-3 px-3 py-1.5 rounded-lg border",
                                    isPositive ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
                                )}>
                                    <span className={cn("text-xs font-bold", isPositive ? "text-emerald-500" : "text-rose-500")}>NIFTY 50</span>
                                    <span className={cn("text-sm font-bold", isPositive ? "text-emerald-500" : "text-rose-500")}>
                                        {ltp > 0 ? ltp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                                    </span>
                                    {ltp > 0 && (
                                        <span className={cn("text-[11px] font-bold flex items-center", isPositive ? "text-emerald-500" : "text-rose-500")}>
                                            <Triangle className={cn("w-2 h-2 fill-current mr-1", !isPositive && "rotate-180")} />
                                            {isPositive ? '+' : ''}{change.toFixed(2)} ({pctChange.toFixed(2)}%)
                                        </span>
                                    )}
                                </div>
                            );
                        })()}

                        {/* BANK NIFTY */}
                        {(() => {
                            const bankNifty = indices?.['NSE:NIFTY BANK'];
                            const ltp = bankNifty?.last_price || 0;
                            const change = bankNifty?.net_change || 0;
                            const prevClose = ltp - change;
                            const pctChange = prevClose > 0 ? (change / prevClose) * 100 : 0;
                            const isPositive = change >= 0;

                            return (
                                <div className={cn(
                                    "flex items-center gap-3 px-3 py-1.5 rounded-lg border",
                                    isPositive ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
                                )}>
                                    <span className={cn("text-xs font-bold", isPositive ? "text-emerald-500" : "text-rose-500")}>BANK NIFTY</span>
                                    <span className={cn("text-sm font-bold", isPositive ? "text-emerald-500" : "text-rose-500")}>
                                        {ltp > 0 ? ltp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                                    </span>
                                    {ltp > 0 && (
                                        <span className={cn("text-[11px] font-bold flex items-center", isPositive ? "text-emerald-500" : "text-rose-500")}>
                                            <Triangle className={cn("w-2 h-2 fill-current mr-1", !isPositive && "rotate-180")} />
                                            {isPositive ? '+' : ''}{change.toFixed(2)} ({pctChange.toFixed(2)}%)
                                        </span>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Bell className="p-2 text-slate-400 cursor-pointer hover:bg-white/5 rounded-lg transition-colors w-9 h-9" />
                            <span className="absolute top-2.5 right-2.5 size-2 bg-rose-500 border-2 border-background-dark rounded-full"></span>
                        </div>
                        <div className="h-8 w-px bg-white/10 mx-2"></div>
                        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                            <PlusCircle className="w-4 h-4" /> New Trade
                        </button>
                    </div>
                </header>

                {/* Dashboard Content Grid */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-6">

                        {/* Left Column: Portfolio & Table */}
                        <div className="col-span-12 xl:col-span-8 space-y-6">

                            {/* Portfolio Overview Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                        <Wallet className="w-20 h-20" />
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium mb-1">Total Portfolio Value</p>
                                    <h2 className="text-3xl font-bold tracking-tight text-white">₹{summary.currentValue.toLocaleString()}</h2>
                                    <div className="flex items-center gap-2 mt-4">
                                        <span className={cn("text-sm font-bold flex items-center", summary.totalPnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                            {summary.totalPnl >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                            {summary.totalPnl >= 0 ? '+' : ''}₹{summary.totalPnl.toLocaleString()}
                                        </span>
                                        <span className="text-slate-500 text-xs font-medium">All-time Gain ({summary.returnPercent}%)</span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className={cn("bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 border-l-4", dayPnl >= 0 ? "border-l-emerald-500" : "border-l-rose-500")}
                                >
                                    <p className="text-slate-400 text-sm font-medium mb-1">Today's P&L</p>
                                    <h2 className={cn("text-3xl font-bold tracking-tight", dayPnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                        {dayPnl >= 0 ? '+' : ''}₹{dayPnl.toLocaleString()}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-4">
                                        <span className={cn("text-[10px] font-black px-2 py-0.5 rounded uppercase", dayPnl >= 0 ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500")}>
                                            {dayPnl >= 0 ? 'Bullish Day' : 'Bearish Day'}
                                        </span>
                                        <span className="text-slate-500 text-xs font-medium">from market open</span>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Connected Brokers Component */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg">Connected Accounts</h3>
                                    <button onClick={() => navigate('/settings')} className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                                        Manage Connections
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {user?.connectedBrokers?.map(broker => (
                                        <div key={broker} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm border",
                                                    broker === 'ZERODHA' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                                        broker === 'GROWW' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                            "bg-primary/10 text-primary border-primary/20"
                                                )}>
                                                    {broker.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white uppercase tracking-wider text-sm">{broker}</p>
                                                    <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 uppercase tracking-widest mt-0.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
                                                        Live Sync
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!user?.connectedBrokers || user.connectedBrokers.length === 0) && (
                                        <div className="col-span-full text-center py-6 text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
                                            No brokers connected. Go to settings to add one.
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Market Movers */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <MarketMoverCard title="Top Gainers" type="gain" items={[
                                    { symbol: 'TATASTEEL', price: 141.25, change: '+4.82%', vol: '12M' },
                                    { symbol: 'ADANIPORTS', price: 1284.6, change: '+3.15%', vol: '4.2M' },
                                    { symbol: 'JSWSTEEL', price: 822.4, change: '+2.90%', vol: '2.1M' },
                                ]} />
                                <MarketMoverCard title="Top Losers" type="loss" items={[
                                    { symbol: 'WIPRO', price: 478.2, change: '-2.41%', vol: '8.5M' },
                                    { symbol: 'TITAN', price: 3612.45, change: '-1.85%', vol: '1.1M' },
                                    { symbol: 'TECHM', price: 1245.9, change: '-1.68%', vol: '1.8M' },
                                ]} />
                            </div>
                        </div>

                        {/* Right Column: Watchlist */}
                        <div className="col-span-12 xl:col-span-4 space-y-6">
                            <WishlistWidget />
                        </div>

                    </div>
                </div>

                {/* AI Chat FAB */}
                <div className="fixed bottom-6 right-6 z-50">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="size-14 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center relative group overflow-hidden"
                    >
                        <MessageCircle className="w-7 h-7" />
                        <span className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                    </motion.button>
                </div>
            </main>
        </div>
    );
};


const MarketMoverCard = ({ title, type, items }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={cn(
            "bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden",
            type === 'gain' ? "border-t-2 border-t-emerald-500" : "border-t-2 border-t-rose-500"
        )}
    >
        <div className="p-4 flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
                {type === 'gain' ? <TrendingUp className="text-emerald-500 w-4 h-4" /> : <TrendingDown className="text-rose-500 w-4 h-4" />}
                {title}
            </h3>
            <span className="text-[10px] font-bold text-slate-500">TODAY</span>
        </div>
        <div className="px-4 pb-4 space-y-3">
            {items.map((item: any) => (
                <div key={item.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div>
                        <p className="font-bold text-xs uppercase tracking-tight text-white">{item.symbol}</p>
                        <p className="text-[10px] text-slate-500">₹{item.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className={cn("font-bold text-xs", type === 'gain' ? "text-emerald-500" : "text-rose-500")}>{item.change}</p>
                        <p className="text-[10px] text-slate-500">Vol: {item.vol}</p>
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
);

const WatchlistItem = ({ symbol, ltp, change, isUp, trend }: any) => (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer group">
        <div className="w-1/3">
            <p className="font-bold text-sm text-white group-hover:text-primary transition-colors">{symbol}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase">NSE</p>
        </div>
        <div className="flex-1 h-8 px-4">
            <svg className={cn("w-full h-full fill-none stroke-2", isUp ? "stroke-emerald-500" : "stroke-rose-500")} viewBox="0 0 100 30">
                <polyline points={trend.map((p: number, i: number) => `${(i / (trend.length - 1)) * 100},${30 - p}`).join(' ')} />
            </svg>
        </div>
        <div className="w-1/3 text-right">
            <p className="font-bold text-sm text-white">₹{ltp.toLocaleString()}</p>
            <p className={cn("text-[10px] font-bold", isUp ? "text-emerald-500" : "text-rose-500")}>{change}</p>
        </div>
    </div>
);

export default DashboardPage;
