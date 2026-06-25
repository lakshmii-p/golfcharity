import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Trophy, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  const navLinks = [
    { to: '/charities', label: 'Charities' },
    { to: '/draws', label: 'Draw Results' },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 backdrop-blur-xl bg-dark-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Trophy size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg">GolfCharity</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium transition-colors ${pathname === to ? 'text-brand-400' : 'text-white/60 hover:text-white'}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm text-brand-400 font-medium hover:text-brand-300">Admin</Link>
                )}
                <Link to="/dashboard" className="btn-secondary !py-2 !px-4 text-sm">Dashboard</Link>
                <button onClick={logout} className="text-sm text-white/50 hover:text-white transition-colors">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/60 hover:text-white font-medium transition-colors">Log in</Link>
                <Link to="/register" className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5">
                  <Heart size={14} />
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <button className="md:hidden text-white/70 hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden glass border-t border-white/5 px-4 py-4 flex flex-col gap-3">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} className="text-sm text-white/70 hover:text-white py-2">{label}</Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-secondary text-sm text-center">Dashboard</Link>
              <button onClick={logout} className="text-sm text-red-400 py-2">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm text-white/70 py-2">Log in</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-sm text-center">Join Now</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
