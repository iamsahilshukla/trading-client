import { Wallet, HelpCircle, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ variant = 'default' }: { variant?: 'default' | 'minimal' }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (variant === 'minimal') {
        return (
            <header className="border-b border-slate-200 dark:border-white/5 px-6 py-4 bg-slate-950/20 backdrop-blur-md relative z-50">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded-lg">
                            <Wallet className="text-white w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Vertex AI</h1>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                            <HelpCircle className="w-5 h-5" />
                        </button>
                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link to="/settings" className="p-2 text-slate-400 hover:text-white transition-colors">
                                    <User className="w-5 h-5" />
                                </Link>
                                <Link to="/dashboard" className="text-sm font-bold text-white hover:text-primary transition-colors">Dashboard</Link>
                                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <Link to="/auth" className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                                <User className="text-slate-400 w-4 h-4" />
                            </Link>
                        )}
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="sticky top-4 mx-auto w-[90%] max-w-7xl z-50">
            <nav className="glass rounded-xl px-6 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Wallet className="text-white w-5 h-5" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-white">
                        Vertex<span className="text-primary">AI</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-primary transition-colors">Platform</Link>
                    <Link to="/markets" className="text-sm font-medium text-slate-300 hover:text-primary transition-colors">Markets</Link>
                    <Link to="/chat" className="text-sm font-medium text-slate-300 hover:text-primary transition-colors">AI Assistant</Link>
                    <Link to="/settings" className="text-sm font-medium text-slate-300 hover:text-primary transition-colors">Settings</Link>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="text-sm font-bold text-white hover:text-primary transition-colors">Dashboard</Link>
                            <Link to="/settings">
                                <button className="bg-white/5 hover:bg-white/10 text-white text-sm font-bold py-2 px-4 rounded-lg border border-white/10 transition-all flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Account
                                </button>
                            </Link>
                            <button onClick={handleLogout} className="bg-white/5 hover:bg-white/10 text-white text-sm font-bold py-2 px-4 rounded-lg border border-white/10 transition-all flex items-center gap-2 text-rose-500">
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/auth">
                                <button className="text-sm font-bold text-white hover:text-primary transition-colors px-4">Login</button>
                            </Link>
                            <Link to="/auth">
                                <button className="bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2 px-5 rounded-lg transition-all shadow-lg shadow-primary/20">
                                    Start Trading Free
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
