import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import {
    Database,
    BarChart,
    Activity,
    Search,
    Bell,
    Settings,
    Plus,
    Minus,
    Triangle,
    Timer,
    LayoutGrid,
    Filter,
    MoreVertical,
    ArrowRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const ChartsPage = () => {
    const [activeTab, setActiveTab] = useState('positions');
    const [symbol, setSymbol] = useState('NSE:TCS');
    const [range, setRange] = useState('1D');
    const [searchInput, setSearchInput] = useState('');
    const [quote, setQuote] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchQuote = async () => {
            if (!symbol) return;
            setLoading(true);
            setError('');
            try {
                if (range === '1D') {
                    const res = await api.get(`/market/quote/normalized?symbols=${symbol}`);
                    if (res.data?.data?.length > 0) {
                        setQuote(res.data.data[0]);
                    } else {
                        setQuote(null);
                        setError('Data not available');
                    }
                } else {
                    const toDate = new Date();
                    const fromDate = new Date();
                    let interval = 'day';
                    switch (range) {
                        case '1W': fromDate.setDate(toDate.getDate() - 7); interval = '60minute'; break;
                        case '1M': fromDate.setMonth(toDate.getMonth() - 1); interval = 'day'; break;
                        case '3M': fromDate.setMonth(toDate.getMonth() - 3); interval = 'day'; break;
                        case '1Y': fromDate.setFullYear(toDate.getFullYear() - 1); interval = 'day'; break;
                        case 'ALL': fromDate.setFullYear(2020, 0, 1); interval = 'day'; break;
                    }
                    const fromStr = fromDate.toISOString().split('T')[0];
                    const toStr = toDate.toISOString().split('T')[0];

                    const res = await api.get(`/market/history/normalized?symbol=${symbol}&from=${fromStr}&to=${toStr}&interval=${interval}`);

                    if (res.data?.candles?.length > 0) {
                        const lastCandle = res.data.candles[res.data.candles.length - 1];
                        setQuote({
                            instrument: symbol,
                            lastPrice: lastCandle.close,
                            ohlc: lastCandle,
                            isHistoricalFallback: true,
                            fallbackCandles: res.data.candles
                        });
                    } else {
                        setQuote(null);
                        setError('Historical data not available');
                    }
                }
            } catch (err: any) {
                if (err.response?.status === 429) {
                    setError('Rate limit hit. Try again later.');
                } else {
                    setError(err.response?.data?.message || 'Failed to fetch');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchQuote();
    }, [symbol, range]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            const formattedSymbol = searchInput.includes(':') ? searchInput.toUpperCase() : `NSE:${searchInput.toUpperCase()}`;
            setSymbol(formattedSymbol);
        }
    };

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#64748b',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                timeVisible: true,
            },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981',
            downColor: '#f43f5e',
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#f43f5e',
        });

        const generateData = () => {
            if (quote?.isHistoricalFallback && quote?.fallbackCandles?.length > 0) {
                const data = quote.fallbackCandles.map((c: any) => {
                    let t = c.date || c.timestamp;
                    if (typeof t === 'string' && t.includes('-')) t = new Date(t).getTime() / 1000;
                    else if (t > 100000000000) t = Math.floor(t / 1000);

                    return {
                        time: t as any,
                        open: c.open,
                        high: c.high,
                        low: c.low,
                        close: c.close,
                    };
                });
                return data.sort((a: any, b: any) => a.time - b.time);
            }

            if (!quote?.lastPrice || !quote?.ohlc) return [];

            const time = new Date();
            time.setHours(9, 15, 0, 0);

            return [{
                time: (time.getTime() / 1000) as any,
                open: quote.ohlc.open,
                high: quote.ohlc.high,
                low: quote.ohlc.low,
                close: quote.ohlc.close,
            }];
        };

        candlestickSeries.setData(generateData());

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [symbol, quote?.lastPrice ? 'fetched' : 'loading']);

    const yAxisPrices = quote?.lastPrice
        ? [
            (quote.lastPrice * 1.04).toFixed(2),
            (quote.lastPrice * 1.02).toFixed(2),
            (quote.lastPrice * 1.01).toFixed(2),
            (quote.lastPrice).toFixed(2),
            (quote.lastPrice * 0.98).toFixed(2),
            (quote.lastPrice * 0.96).toFixed(2),
        ]
        : ['--', '--', '--', '--', '--', '--'];

    return (
        <div className="bg-background-dark text-slate-100 h-screen flex overflow-hidden select-none">
            <Sidebar />

            {/* Main Terminal Area */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top Header */}
                <header className="flex items-center justify-between h-14 px-4 bg-slate-900 border-b border-white/5 flex-shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-1.5 rounded text-primary">
                                <Database className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        {quote?.isHistoricalFallback && (
                                            <div className="text-[10px] uppercase font-bold text-amber-500 tracking-wider mb-2 flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                Market Closed • Displaying Last Known Close
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-base text-white">{symbol.split(':')[1] || symbol}</span>
                                            <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-1.5 rounded">{symbol.split(':')[0] || 'NSE'}</span>
                                            {loading && <span className="text-[10px] text-slate-500 animate-pulse">Updating...</span>}
                                            {error && <span className="text-[10px] text-rose-500">{error}</span>}
                                        </div>
                                    </div>
                                </motion.div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-mono font-semibold text-slate-200">
                                        ₹{quote ? quote.lastPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '--'}
                                    </span>
                                    {quote?.ohlc && (
                                        <span className={cn(
                                            "text-xs font-medium flex items-center",
                                            quote.lastPrice >= quote.ohlc.close ? "text-emerald-500" : "text-rose-500"
                                        )}>
                                            <Triangle className={cn("w-2 h-2 fill-current mr-0.5", quote.lastPrice < quote.ohlc.close && "rotate-180")} />
                                            {Math.abs(quote.lastPrice - quote.ohlc.close).toFixed(2)} ({(((quote.lastPrice - quote.ohlc.close) / quote.ohlc.close) * 100).toFixed(2)}%)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-white/5 mx-2"></div>

                        <nav className="flex items-center gap-1">
                            {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRange(r)}
                                    className={cn(
                                        "px-2.5 py-1 text-xs font-semibold rounded transition-colors",
                                        range === r ? "bg-primary/20 text-primary" : "text-slate-400 hover:bg-white/5"
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                            <div className="w-px h-4 bg-white/5 mx-1"></div>
                            <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded text-slate-400 hover:bg-white/5">
                                <BarChart className="w-3.5 h-3.5" />
                                <span>Candlesticks</span>
                            </button>
                            <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded text-slate-400 hover:bg-white/5">
                                <Activity className="w-3.5 h-3.5" />
                                <span>Indicators</span>
                            </button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <form onSubmit={handleSearch} className="flex items-center bg-white/5 rounded-md px-3 py-1.5 gap-2 w-48 border border-white/5 focus-within:border-primary/50 transition-all">
                            <Search className="text-slate-500 w-4 h-4 cursor-pointer" onClick={handleSearch} />
                            <input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="bg-transparent border-none p-0 text-sm focus:ring-0 w-full placeholder:text-slate-600 text-white"
                                placeholder="Search Symbol"
                            />
                        </form>
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer" />
                            <Settings className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer" />
                        </div>
                    </div>
                </header>

                <main className="flex flex-1 overflow-hidden">
                    {/* Chart & Bottom Panel */}
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="relative flex-1 bg-slate-950 chart-grid overflow-hidden group">
                            {/* Watermark */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none z-0">
                                <span className="text-[120px] font-black tracking-tighter text-white">{symbol.split(':')[1] || symbol}</span>
                            </div>

                            {/* TradingView Chart Container */}
                            <div ref={chartContainerRef} className="absolute inset-0 z-10" />
                        </div>

                        {/* Bottom Panel */}
                        <div className="h-64 bg-slate-900 border-t border-white/5 flex flex-col">
                            <div className="flex items-center px-4 border-b border-white/5 shrink-0">
                                <div className="flex">
                                    {['positions', 'orders', 'history'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={cn(
                                                "px-6 py-3 text-xs font-bold transition-all relative",
                                                activeTab === tab ? "text-primary" : "text-slate-500 hover:text-slate-300"
                                            )}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'positions' && '(2)'}
                                            {activeTab === tab && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                                        </button>
                                    ))}
                                </div>
                                <div className="ml-auto flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">Today's P&L:</span>
                                        <span className="text-emerald-500 font-bold">₹+1,240.45</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-slate-950/50 sticky top-0 text-slate-500 font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-2">Symbol</th>
                                            <th className="px-4 py-2">Qty</th>
                                            <th className="px-4 py-2">Avg Price</th>
                                            <th className="px-4 py-2">LTP</th>
                                            <th className="px-4 py-2">P&L</th>
                                            <th className="px-4 py-2">P&L %</th>
                                            <th className="px-4 py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        <PositionRow symbol="TCS" qty={100} avg={3420.50} ltp={3450.20} pnl={2970} isUp={true} />
                                        <PositionRow symbol="RELIANCE" qty={50} avg={2510.00} ltp={2495.10} pnl={-745} isUp={false} />
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Trade Panel */}
                    <aside className="w-80 bg-slate-900 border-l border-white/5 flex flex-col shrink-0">
                        <div className="p-4 border-b border-white/5">
                            <div className="flex mb-4 p-1 bg-slate-950 rounded-lg">
                                <button className="flex-1 py-2 text-xs font-bold rounded-md bg-emerald-500 text-white shadow-lg shadow-emerald-500/10" onClick={() => alert('Order placement coming soon')}>BUY</button>
                                <button className="flex-1 py-2 text-xs font-bold rounded-md text-slate-500 hover:text-slate-300" onClick={() => alert('Order placement coming soon')}>SELL</button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <button className="flex-1 py-1.5 text-[10px] font-bold rounded border border-primary text-primary bg-primary/10">MARKET</button>
                                    <button className="flex-1 py-1.5 text-[10px] font-bold rounded border border-white/10 text-slate-500 hover:border-white/20">LIMIT</button>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quantity</label>
                                    <div className="flex bg-slate-950 border border-white/5 rounded overflow-hidden">
                                        <button className="px-3 py-2 hover:bg-white/5 text-slate-400"><Minus className="w-3.5 h-3.5" /></button>
                                        <input className="w-full bg-transparent border-none text-center text-sm font-mono focus:ring-0 text-white" defaultValue="100" />
                                        <button className="px-3 py-2 hover:bg-white/5 text-slate-400"><Plus className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Stop Loss</label>
                                        <input className="w-full bg-slate-950 border border-white/5 rounded px-3 py-2 text-sm font-mono text-white focus:border-primary/50 transition-colors" placeholder="--.--" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Take Profit</label>
                                        <input className="w-full bg-slate-950 border border-white/5 rounded px-3 py-2 text-sm font-mono text-white focus:border-primary/50 transition-colors" placeholder="--.--" />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex justify-between text-[11px] mb-1">
                                        <span className="text-slate-500">Required Margin</span>
                                        <span className="font-bold text-slate-200">₹69,004.00</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] mb-4">
                                        <span className="text-slate-500">Available Funds</span>
                                        <span className="text-primary font-bold">₹2,45,000.00</span>
                                    </div>
                                    <button className="w-full py-3 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2" onClick={() => alert('Order placement coming soon')}>
                                        PLACE BUY ORDER
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Depth / Book */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Order Book</h3>
                                <div className="flex gap-2">
                                    <Filter className="text-slate-600 w-3.5 h-3.5" />
                                    <MoreVertical className="text-slate-600 w-3.5 h-3.5" />
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col text-[10px] font-mono">
                                {/* Asks */}
                                <div className="flex-1 flex flex-col-reverse justify-start">
                                    <DepthRow price="3,452.45" qty="450" total="1.2k" p={45} color="bg-rose-500/10" textColor="text-rose-500" />
                                    <DepthRow price="3,451.90" qty="812" total="2.1k" p={80} color="bg-rose-500/10" textColor="text-rose-500" />
                                    <DepthRow price="3,450.85" qty="540" total="1.6k" p={60} color="bg-rose-500/10" textColor="text-rose-500" />
                                </div>
                                {/* Spread */}
                                <div className="py-1 px-3 bg-slate-950 border-y border-white/5 flex justify-between text-slate-500 font-bold uppercase text-[9px]">
                                    <span>Spread</span>
                                    <span className="text-slate-300">0.65 (0.02%)</span>
                                </div>
                                {/* Bids */}
                                <div className="flex-1">
                                    <DepthRow price="3,450.20" qty="950" total="4.5k" p={75} color="bg-emerald-500/10" textColor="text-emerald-500" reverse />
                                    <DepthRow price="3,449.65" qty="320" total="3.2k" p={55} color="bg-emerald-500/10" textColor="text-emerald-500" reverse />
                                    <DepthRow price="3,448.15" qty="1.2k" total="5.1k" p={90} color="bg-emerald-500/10" textColor="text-emerald-500" reverse />
                                </div>
                            </div>
                        </div>
                    </aside>
                </main>

                {/* Footer Bar */}
                <footer className="h-6 px-4 bg-slate-950 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Connected</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            <span>Latency: 24ms</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Market Status: <span className="text-emerald-500 font-bold uppercase">Open</span></span>
                        <span className="font-mono">IST 14:45:12</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

const PositionRow = ({ symbol, qty, avg, ltp, pnl, isUp }: any) => (
    <tr className="hover:bg-white/[0.02] transition-colors border-b border-white/[0.02]">
        <td className="px-4 py-3 font-semibold text-white">{symbol}</td>
        <td className="px-4 py-3 font-mono text-slate-300">{qty}</td>
        <td className="px-4 py-3 font-mono text-slate-500">₹{avg.toLocaleString()}</td>
        <td className="px-4 py-3 font-mono text-slate-200">₹{ltp.toLocaleString()}</td>
        <td className={cn("px-4 py-3 font-mono font-bold", isUp ? "text-emerald-500" : "text-rose-500")}>
            {isUp ? '+' : ''}₹{pnl.toLocaleString()}
        </td>
        <td className={cn("px-4 py-3 font-mono", isUp ? "text-emerald-500" : "text-rose-500")}>
            {isUp ? '+' : ''}{((pnl / (qty * avg)) * 100).toFixed(2)}%
        </td>
        <td className="px-4 py-3">
            <button className="text-primary hover:underline font-bold">Close</button>
        </td>
    </tr>
);

const DepthRow = ({ price, qty, total, p, color, textColor, reverse }: any) => (
    <div className="flex items-center relative py-1 px-3 hover:bg-white/5 transition-colors group">
        <div
            className={cn("absolute h-full transition-all duration-500", color, reverse ? "left-0" : "right-0")}
            style={{ width: `${p}%` }}
        />
        <span className={cn("w-1/3 relative z-10", textColor)}>{price}</span>
        <span className="text-slate-300 w-1/3 text-center relative z-10">{qty}</span>
        <span className="text-slate-500 w-1/3 text-right relative z-10">{total}</span>
    </div>
);

export default ChartsPage;
