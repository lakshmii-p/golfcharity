import { useEffect, useState } from 'react';
import { Users, Trophy, Heart, BarChart2 } from 'lucide-react';
import api from '../../utils/api';

interface Stats {
  totalUsers: number;
  activeSubscribers: number;
  totalPrizePool: string;
  totalPaidOut: string;
  totalCharityContributions: string;
  totalDraws: number;
  recentDraws: { id: string; draw_month: string; total_pool: number; published: boolean }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data));
  }, []);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
    { label: 'Active Subscribers', value: stats.activeSubscribers, icon: Users, color: 'text-brand-400' },
    { label: 'Total Prize Pool', value: `₹${stats.totalPrizePool}`, icon: Trophy, color: 'text-yellow-400' },
    { label: 'Total Paid Out', value: `₹${stats.totalPaidOut}`, icon: Trophy, color: 'text-brand-400' },
    { label: 'Charity Contributions', value: `₹${stats.totalCharityContributions}`, icon: Heart, color: 'text-red-400' },
    { label: 'Total Draws', value: stats.totalDraws, icon: BarChart2, color: 'text-purple-400' },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Dashboard</h1>
        <p className="text-white/50 mt-1">Platform overview</p>
      </div>

      {!stats ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card">
                <div className="flex items-center gap-3 mb-2">
                  <Icon size={18} className={color} />
                  <span className="text-white/50 text-sm">{label}</span>
                </div>
                <p className="font-display font-bold text-3xl text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <h2 className="font-display font-bold text-lg mb-4">Recent Draws</h2>
            {stats.recentDraws.length === 0 ? (
              <p className="text-white/30 text-sm">No draws yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/40 text-left">
                    <th className="pb-3 font-medium">Month</th>
                    <th className="pb-3 font-medium">Pool</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentDraws.map(d => (
                    <tr key={d.id}>
                      <td className="py-3 text-white font-medium">{d.draw_month}</td>
                      <td className="py-3 text-brand-400">₹{Number(d.total_pool).toFixed(2)}</td>
                      <td className="py-3">
                        <span className={d.published ? 'badge-active' : 'badge-inactive'}>{d.published ? 'Published' : 'Draft'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
