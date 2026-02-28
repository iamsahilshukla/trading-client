import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface QuoteData {
    last_price: number;
    net_change: number;
}

interface Wishlist {
    userId: string;
    name: string;
    symbols: string[];
}

interface WishlistWidgetProps {
    // optionally pass user or refresh trigger
}

export const WishlistWidget: React.FC<WishlistWidgetProps> = () => {
    const [wishlist, setWishlist] = useState<Wishlist | null>(null);
    const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newSymbol, setNewSymbol] = useState('');

    const fetchWishlistAndQuotes = async () => {
        try {
            const { data: wishlistData } = await api.get<Wishlist>('/wishlist');
            setWishlist(wishlistData);

            if (wishlistData?.symbols && wishlistData.symbols.length > 0) {
                // Query quotes for the exact symbols
                const symbolsParam = wishlistData.symbols.join(',');
                const { data: quoteData } = await api.get<Record<string, QuoteData>>(`/market/quote?symbols=${symbolsParam}`);
                setQuotes(quoteData);
            } else {
                setQuotes({});
            }
        } catch (error) {
            console.error('Failed to fetch wishlist data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlistAndQuotes();
        const interval = setInterval(fetchWishlistAndQuotes, 10000); // 10s refresh
        return () => clearInterval(interval);
    }, []);

    const handleAddSymbol = async () => {
        if (!newSymbol.trim()) return;
        setAdding(false);
        setLoading(true);
        try {
            // Typically user inputs 'RELIANCE', we might need to prepend 'NSE:' if missing
            const symbolToAdd = newSymbol.includes(':') ? newSymbol.toUpperCase() : `NSE:${newSymbol.toUpperCase()}`;

            // Validate symbol before saving to DB
            const validateRes = await api.get(`/market/quote?symbols=${symbolToAdd}&broker=GROWW`, { validateStatus: () => true });

            // Revert loading if it fails
            if (validateRes.status >= 400 || !validateRes.data || !validateRes.data[symbolToAdd] || validateRes.data.status === 'FAILURE') {
                alert(`The trading symbol "${newSymbol.toUpperCase()}" does not exist or is invalid.`);
                setLoading(false);
                return;
            }

            await api.post('/wishlist/symbol', { symbol: symbolToAdd });
            setNewSymbol('');
            fetchWishlistAndQuotes();
        } catch (error) {
            console.error('Failed to add symbol:', error);
            alert('Failed to add symbol. Ensure the symbol is valid.');
            setLoading(false);
        }
    };

    const handleRemoveSymbol = async (symbol: string) => {
        try {
            await api.delete(`/wishlist/symbol/${encodeURIComponent(symbol)}`);
            setLoading(true);
            fetchWishlistAndQuotes();
        } catch (error) {
            console.error('Failed to remove symbol:', error);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(value);
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl h-full flex flex-col max-h-[calc(100vh-160px)] sticky top-0 border border-white/5">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-lg text-white">Watchlist</h3>
                <button
                    onClick={() => setAdding(!adding)}
                    className="size-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                    {adding ? <X size={16} className="text-slate-400" /> : <Plus size={16} className="text-slate-400" />}
                </button>
            </div>

            {adding && (
                <div className="p-4 bg-white/5 border-b border-white/5 flex space-x-2">
                    <input
                        type="text"
                        placeholder="e.g., RELIANCE or NSE:TCS"
                        className="flex-1 px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSymbol()}
                    />
                    <button
                        onClick={handleAddSymbol}
                        className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                {loading && !wishlist ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Loading your watchlist...</div>
                ) : wishlist?.symbols?.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center">
                        <p className="text-sm font-medium text-slate-500 mb-2">Your watchlist is currently empty.</p>
                        <button
                            onClick={() => setAdding(true)}
                            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                            Add a stock to get started
                        </button>
                    </div>
                ) : (
                    wishlist?.symbols.map((symbol) => {
                        const quote = quotes[symbol];
                        const ltp = quote ? quote.last_price : 0;
                        const netChange = quote ? quote.net_change : 0;
                        const pctChange = quote && ltp > 0 ? (netChange / (ltp - netChange)) * 100 : 0;
                        const isPositive = netChange >= 0;

                        return (
                            <div key={symbol} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer group relative">
                                <div className="w-1/3">
                                    <p className="font-bold text-sm text-white group-hover:text-primary transition-colors">{symbol.split(':')[1] || symbol}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{symbol.split(':')[0] || 'NSE'}</p>
                                </div>
                                <div className="flex-1 h-8 px-4 flex justify-center items-center">
                                    {/* Fake trend chart or loading text */}
                                    {quote ? (
                                        <svg className={cn("w-full h-full fill-none stroke-2", isPositive ? "stroke-emerald-500" : "stroke-rose-500")} viewBox="0 0 100 30">
                                            {/* Dummy trendline representing the change natively */}
                                            <polyline points={isPositive ? "0,25 25,20 50,28 75,10 100,5" : "0,5 25,10 50,8 75,20 100,25"} />
                                        </svg>
                                    ) : (
                                        <div className="h-4 w-16 bg-white/10 rounded animate-pulse"></div>
                                    )}
                                </div>
                                <div className="w-1/3 flex items-center justify-end">
                                    <div className="text-right transition-transform duration-300 group-hover:-translate-x-10">
                                        {quote ? (
                                            <>
                                                <p className="font-bold text-sm text-white">₹{ltp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                <p className={cn("text-[10px] font-bold flex items-center justify-end", isPositive ? "text-emerald-500" : "text-rose-500")}>
                                                    {isPositive ? '+' : ''}{netChange.toFixed(2)} ({pctChange.toFixed(2)}%)
                                                </p>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="h-4 w-16 bg-white/10 rounded animate-pulse"></div>
                                                <div className="h-3 w-12 bg-white/5 rounded animate-pulse"></div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Delete button slide-in */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveSymbol(symbol) }}
                                        className="absolute right-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 bg-rose-500/10 text-rose-500 p-2 rounded-lg hover:bg-rose-500/20 transition-all duration-300"
                                        title="Remove from watchlist"
                                    >
                                        <Trash2 size={14} className="stroke-[3px]" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
