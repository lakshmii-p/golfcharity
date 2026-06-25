import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Shuffle, Heart, Trophy, LogOut, Trophy as Logo } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/draws', label: 'Draws', icon: Shuffle },
  { to: '/admin/charities', label: 'Charities', icon: Heart },
  { to: '/admin/winners', label: 'Winners', icon: Trophy },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 glass border-r border-white/5 flex flex-col py-6 px-4 fixed h-full z-40">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Logo size={16} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-sm">GolfCharity</p>
            <p className="text-white/30 text-xs">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-brand-500/20 text-brand-400' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/40 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/5 mt-4">
          <LogOut size={16} />
          Sign out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
