import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
    Zap,
    User,
    Send,
    Loader2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { WishlistWidget } from '../components/dashboard/WishlistWidget';
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
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Chat Interface */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 max-w-5xl mx-auto w-full custom-scrollbar"
                >
                    <AnimatePresence initial={false}>
                        {messages.filter(msg => !(isStreaming && msg.role === 'assistant' && msg.content === '')).map(msg => (
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
                            <div className="size-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                                <Zap className="text-white w-6 h-6 fill-current" />
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
                        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
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
            </main>

            {/* Right Sidebar - Watchlist */}
            <aside className="hidden xl:flex w-80 border-l border-white/5 bg-slate-950/40 shrink-0">
                <WishlistWidget />
            </aside>
        </div>
    );
};

export default ChatPage;
