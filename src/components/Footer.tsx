import { Wallet, Share2, Rss } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="py-12 px-4 border-t border-white/5 mt-auto bg-slate-950/20 backdrop-blur-sm z-20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2 opacity-80">
                    <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                        <Wallet className="text-white w-3 h-3" />
                    </div>
                    <span className="text-lg font-extrabold tracking-tight text-white">
                        Vertex<span className="text-primary">AI</span>
                    </span>
                </div>
                <div className="flex gap-8 text-sm text-slate-500">
                    <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                    <Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link>
                    <Link to="#" className="hover:text-primary transition-colors">Cookie Policy</Link>
                </div>
                <div className="flex gap-4">
                    <div className="w-10 h-10 glass rounded-full flex items-center justify-center hover:text-primary transition-all cursor-pointer">
                        <Share2 className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                    </div>
                    <div className="w-10 h-10 glass rounded-full flex items-center justify-center hover:text-primary transition-all cursor-pointer">
                        <Rss className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                    </div>
                </div>
            </div>
            <p className="text-center text-slate-600 text-xs mt-12">
                © 2024 Vertex AI Technologies Pvt Ltd. Trading in securities market are subject to market risks. Read all the related documents carefully before investing.
            </p>
        </footer>
    );
};

export default Footer;
