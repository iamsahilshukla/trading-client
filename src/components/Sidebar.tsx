import {
    BarChart3,
    LayoutDashboard,
    PieChart,
    MessageSquare,
    Settings,
    LogOut,
    TrendingUp,
    Brain
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'markets', name: 'Markets', icon: BarChart3, path: '/markets' },
        { id: 'portfolio', name: 'Portfolio', icon: PieChart, path: '/portfolio' },
        { id: 'chat', name: 'AI Chat', icon: MessageSquare, path: '/chat', badge: true },
        { id: 'settings', name: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <aside className="w-64 border-r border-white/5 flex flex-col h-screen bg-slate-950/40 backdrop-blur-xl">
            <div className="p-6 flex items-center gap-3">
                <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-white leading-none">Vertex AI</h1>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Trading Hub</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(60,131,246,0.2)]"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-slate-400 group-hover:text-white")} />
                            <span className={cn("font-medium text-sm", isActive ? "font-semibold" : "font-medium")}>{item.name}</span>
                            {item.badge && (
                                <span className="absolute right-3 top-3.5 size-2 bg-primary rounded-full ring-4 ring-slate-950"></span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="bg-white/5 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                    <div className="size-8 rounded-full bg-slate-700 overflow-hidden ring-1 ring-white/10">
                        <img
                            alt="User Profile"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH-4mgw_k7cg6bzG7t2yytrqE94KoQre0elTijEcBR4P3N7WgaDaiplJKh65-sjv4YAo7Kmymw6HGgVv5Ba-L6lEkEW8JZyrbbJRxz58PMeuAGWnx5NegUeRdKz4p3jJAJVEyEoqRk3VacD2yv5VUWpA3aOcOWf9rgAeRFr9aduusYN1F84u3hNTQb2Um_pvkisHukgIZZmVaev3wxKVAYliqJQWnfLnjLQIAD2svEeovICKBMhCMwI-pV_BHf9GOE1AljE3_5Iw"
                        />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold truncate text-white">{user?.email?.split('@')[0] || 'Trader'}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Pro Trader</p>
                    </div>
                    <LogOut onClick={logout} className="text-slate-500 cursor-pointer hover:text-white transition-colors w-4 h-4" />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
