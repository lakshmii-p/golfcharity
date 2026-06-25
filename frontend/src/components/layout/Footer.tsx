import { Link } from 'react-router-dom';
import { Trophy, Heart, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Trophy size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg">GolfCharity</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Play golf. Win prizes. Change lives. Every score you enter supports a charity you believe in.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-white/30 hover:text-white/70 transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-white/30 hover:text-white/70 transition-colors"><Instagram size={18} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white/70 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><Link to="/charities" className="hover:text-white/70 transition-colors">Charities</Link></li>
              <li><Link to="/draws" className="hover:text-white/70 transition-colors">Draw Results</Link></li>
              <li><Link to="/subscribe" className="hover:text-white/70 transition-colors">Subscribe</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white/70 mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><Link to="/login" className="hover:text-white/70 transition-colors">Log in</Link></li>
              <li><Link to="/register" className="hover:text-white/70 transition-colors">Register</Link></li>
              <li><Link to="/dashboard" className="hover:text-white/70 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} GolfCharity. All rights reserved.</p>
          <p className="text-white/30 text-xs flex items-center gap-1">Made with <Heart size={12} className="text-brand-500" /> for charity</p>
        </div>
      </div>
    </footer>
  );
}
