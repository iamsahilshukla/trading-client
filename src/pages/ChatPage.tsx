import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
    Menu,
    Bell,
    Zap,
    User,
    Send,
    Paperclip,
    Database,
    History,
    Triangle,
    Loader2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Gemini-format message used when sending to the backend
interface GeminiMessage {
    role: 'user' | 'model';
    parts: [{ text: string }];
}

// Display message used in the UI
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const WELCOME_MSG: Message = {
    id: 'welcome',
    role: 'assistant',
    content: "Hello! I'm your **Vertex AI Assistant**. I have access to your live portfolio and watchlist. How can I help you today?",
    timestamp: new Date(),
};

const ChatPage = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
    const [isStreaming, setIsStreaming] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const buildGeminiHistory = (displayMessages: Message[]): GeminiMessage[] =>
        displayMessages
            .filter(m => m.id !== 'welcome')
            .map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            }));

    const handleSendMessage = async () => {
        if (!message.trim() || isStreaming) return;

        const userText = message.trim();
        setMessage('');

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userText,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setIsStreaming(true);

        // Build Gemini-format history including the new user message
        const geminiMessages: GeminiMessage[] = [
            ...buildGeminiHistory([...messages, userMsg]),
        ];

        const aiMsgId = `ai-${Date.now()}`;

        // Insert empty AI bubble that we'll stream into
        setMessages(prev => [
            ...prev,
            { id: aiMsgId, role: 'assistant', content: '', timestamp: new Date() },
        ]);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/ai-chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ messages: geminiMessages }),
            });

            if (!response.ok || !response.body) {
                throw new Error(`Request failed: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const payload = line.slice(6);
                    if (payload === '[DONE]') break;

                    try {
                        const parsed = JSON.parse(payload) as { chunk?: string; error?: string };
                        if (parsed.error) {
                            setMessages(prev =>
                                prev.map(m =>
                                    m.id === aiMsgId
                                        ? { ...m, content: `Error: ${parsed.error}` }
                                        : m,
                                ),
                            );
                            break;
                        }
                        if (parsed.chunk) {
                            setMessages(prev =>
                                prev.map(m =>
                                    m.id === aiMsgId
                                        ? { ...m, content: m.content + parsed.chunk }
                                        : m,
                                ),
                            );
                        }
                    } catch {
                        // ignore malformed SSE lines
                    }
                }
            }
        } catch (err) {
            console.error('Chat stream error:', err);
            setMessages(prev =>
                prev.map(m =>
                    m.id === aiMsgId
                        ? {
                              ...m,
                              content:
                                  'Sorry, I encountered an error. Please check your connection and try again.',
                          }
                        : m,
                ),
            );
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen flex overflow-hidden">
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full bg-slate-950/20 overflow-hidden relative">
                {/* Top Navbar */}
                <header className="h-16 border-b border-white/5 bg-slate-950/40 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <Menu className="text-slate-400 cursor-pointer lg:hidden w-5 h-5" />
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500">Market Status:</span>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold uppercase">NSE OPEN</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">NIFTY 50</p>
                                <p className="text-sm font-bold">22,147.20 <span className="text-emerald-500 font-medium text-xs">+0.45%</span></p>
                            </div>
                            <div className="w-[1px] h-8 bg-white/10"></div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">RELIANCE</p>
                                <p className="text-sm font-bold">2,945.10 <span className="text-emerald-500 font-medium text-xs">+1.20%</span></p>
                            </div>
                        </div>
                        <button className="relative p-2 text-slate-400 hover:bg-white/5 rounded-lg transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full border-2 border-slate-950"></span>
                        </button>
                    </div>
                </header>

                {/* Chat Interface */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 max-w-5xl mx-auto w-full custom-scrollbar"
                >
                    <AnimatePresence initial={false}>
                        {messages.map(msg => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    'flex gap-4',
                                    msg.role === 'user' ? 'justify-end' : 'justify-start',
                                )}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="size-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                                        <Zap className="text-white w-6 h-6 fill-current" />
                                    </div>
                                )}

                                <div
                                    className={cn(
                                        'max-w-[85%] space-y-4',
                                        msg.role === 'user' ? 'text-right' : 'text-left',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'p-4 rounded-2xl shadow-sm border',
                                            msg.role === 'user'
                                                ? 'bg-primary text-white rounded-tr-none border-primary/20'
                                                : 'bg-slate-900/60 backdrop-blur-md text-slate-100 rounded-tl-none border-white/10',
                                        )}
                                    >
                                        {msg.role === 'assistant' ? (
                                            <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:text-white prose-strong:text-white prose-code:text-primary prose-code:bg-slate-800 prose-code:px-1 prose-code:rounded">
                                                <ReactMarkdown>{msg.content || ' '}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {msg.content}
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-600 font-medium px-1">
                                        {msg.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>

                                {msg.role === 'user' && (
                                    <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-white/10 overflow-hidden">
                                        <div className="size-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                                            <User className="w-5 h-5" />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing indicator while waiting for first chunk */}
                    {isStreaming && messages[messages.length - 1]?.content === '' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-4"
                        >
                            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <Loader2 className="text-primary w-5 h-5 animate-spin" />
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl rounded-tl-none border border-white/10">
                                <div className="flex gap-1">
                                    <span className="size-1.5 bg-slate-600 rounded-full animate-bounce"></span>
                                    <span className="size-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="size-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 lg:p-8 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent shrink-0">
                    <div className="max-w-5xl mx-auto relative">
                        <div className="flex flex-col bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Quick Tools Bar */}
                            <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                                <div className="flex gap-4">
                                    <QuickTool icon={<Paperclip className="w-3.5 h-3.5" />} label="Upload CSV" />
                                    <QuickTool icon={<Database className="w-3.5 h-3.5" />} label="Live Markets" />
                                    <QuickTool icon={<History className="w-3.5 h-3.5" />} label="Historical" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        AI Level: Expert
                                    </span>
                                    <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="w-4/5 h-full bg-primary"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Input */}
                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="flex items-end p-4 gap-3"
                            >
                                <div className="flex-1">
                                    <textarea
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm p-0 placeholder:text-slate-600 text-white min-h-[24px]"
                                        placeholder="Ask about stocks, portfolios, or market trends..."
                                        rows={1}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!message.trim() || isStreaming}
                                    className={cn(
                                        'size-10 rounded-xl flex items-center justify-center transition-all',
                                        message.trim() && !isStreaming
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-100'
                                            : 'bg-slate-800 text-slate-600 scale-95 opacity-50 cursor-not-allowed',
                                    )}
                                >
                                    {isStreaming ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </form>
                        </div>
                        <p className="text-center mt-3 text-[10px] text-slate-600">
                            AI can make errors. Verify important financial data before making trades.
                        </p>
                    </div>
                </div>

                {/* Floating Assistant Icon */}
                <button className="fixed bottom-8 right-8 size-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center group z-50">
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20 group-hover:opacity-0 transition-opacity"></div>
                    <Zap className="w-7 h-7 fill-current" />
                    <div className="absolute bottom-full right-0 mb-4 scale-0 group-hover:scale-100 transition-transform origin-bottom-right">
                        <div className="bg-slate-900 border border-white/10 text-white text-[10px] font-bold py-2 px-3 rounded-lg shadow-xl whitespace-nowrap">
                            Quick Command (Alt + K)
                        </div>
                    </div>
                </button>
            </main>

            {/* Right Sidebar */}
            <aside className="hidden xl:flex w-80 border-l border-white/5 bg-slate-950/40 flex-col shrink-0">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-sm font-bold mb-4 text-white uppercase tracking-widest text-xs opacity-60">
                        Market Watchlist
                    </h2>
                    <div className="space-y-4">
                        <WatchItem symbol="AAPL" name="Apple Inc." price="182.52" change="-0.82%" isUp={false} />
                        <WatchItem symbol="NVDA" name="NVIDIA Corp." price="924.11" change="+2.14%" isUp={true} />
                        <WatchItem symbol="BTC" name="Bitcoin" price="68,412" change="+1.15%" isUp={true} />
                    </div>
                </div>

                <div className="p-6 flex-1 flex flex-col min-h-0">
                    <h2 className="text-sm font-bold mb-4 text-white uppercase tracking-widest text-xs opacity-60">
                        Real-time Signals
                    </h2>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                        <SignalItem
                            type="bullish"
                            title="Bullish Scanner"
                            text="HDFC Bank showing RSI divergence on 1h chart."
                            time="Just now"
                        />
                        <SignalItem
                            type="warning"
                            title="Volume Alert"
                            text="High selling volume detected in IT sector indices."
                            time="12 mins ago"
                        />
                        <SignalItem
                            type="info"
                            title="Macro Update"
                            text="Fed Chairman Powell to speak at 7:00 PM EST."
                            time="1 hour ago"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-slate-900/20">
                    <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 text-center">
                        <p className="text-[10px] font-bold text-primary mb-2 uppercase">Portfolio Value</p>
                        <p className="text-2xl font-bold tracking-tight text-white">$142,504.20</p>
                        <div className="flex items-center justify-center gap-1 text-emerald-500 mt-1">
                            <Triangle className="w-2.5 h-2.5 fill-current" />
                            <span className="text-xs font-bold">+$2,104.50 (1.5%)</span>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

const QuickTool = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <button className="text-[11px] font-bold text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors group">
        <span className="group-hover:text-primary transition-colors">{icon}</span>
        {label}
    </button>
);

const WatchItem = ({
    symbol,
    name,
    price,
    change,
    isUp,
}: {
    symbol: string;
    name: string;
    price: string;
    change: string;
    isUp: boolean;
}) => (
    <div className="flex items-center justify-between group cursor-pointer">
        <div>
            <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">{symbol}</p>
            <p className="text-[10px] text-slate-500">{name}</p>
        </div>
        <div className="text-right">
            <p className="text-xs font-bold text-white">{price}</p>
            <p className={cn('text-[10px] font-bold', isUp ? 'text-emerald-500' : 'text-rose-500')}>{change}</p>
        </div>
    </div>
);

const SignalItem = ({
    type,
    title,
    text,
    time,
}: {
    type: 'bullish' | 'warning' | 'info';
    title: string;
    text: string;
    time: string;
}) => {
    const styles = {
        bullish: 'bg-emerald-500/5 border-emerald-500 text-emerald-600',
        warning: 'bg-amber-500/5 border-amber-500 text-amber-600',
        info: 'bg-primary/5 border-primary text-primary',
    }[type];

    return (
        <div className={cn('p-3 border-l-2 rounded-r-lg', styles)}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">{title}</span>
            </div>
            <p className="text-xs font-medium text-slate-300">{text}</p>
            <p className="text-[10px] text-slate-500 mt-1">{time}</p>
        </div>
    );
};

export default ChatPage;
