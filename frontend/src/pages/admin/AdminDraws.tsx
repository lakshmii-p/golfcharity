import { useEffect, useState } from 'react';
import { Play, Eye, Send, Shuffle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

interface Draw {
  id: string;
  draw_month: string;
  draw_numbers: number[];
  algorithm: string;
  total_pool: number;
  jackpot_rollover: number;
  published: boolean;
  created_at: string;
}

interface SimResult {
  numbers: number[];
  results: { five: any[]; four: any[]; three: any[] };
}

export default function AdminDraws() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [algorithm, setAlgorithm] = useState<'random' | 'algorithmic'>('random');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await api.get('/draws');
    setDraws(data.draws || []);
  };

  const simulate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/draws/simulate', { algorithm });
      setSimResult(data);
      toast.success('Simulation complete');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const runDraw = async () => {
    if (!confirm(`Run official draw for ${month}?`)) return;
    setLoading(true);
    try {
      const { data } = await api.post('/draws/run', { algorithm, month });
      toast.success(`Draw complete! ${data.winners.five.users.length + data.winners.four.users.length + data.winners.three.users.length} winners`);
      setSimResult(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Draw failed');
    } finally {
      setLoading(false);
    }
  };

  const publish = async (drawId: string) => {
    try {
      await api.put(`/draws/${drawId}/publish`);
      toast.success('Draw published! Notifications sent.');
      load();
    } catch {
      toast.error('Failed to publish');
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-white mb-6">Draw Management</h1>

      {/* Draw Controls */}
      <div className="card mb-6">
        <h2 className="font-display font-bold text-lg mb-4">Run a Draw</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-white/50 block mb-1">Draw Month</label>
            <input type="month" className="input" value={month} onChange={e => setMonth(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Algorithm</label>
            <select className="input" value={algorithm} onChange={e => setAlgorithm(e.target.value as any)}>
              <option value="random">Random (Standard)</option>
              <option value="algorithmic">Algorithmic (Score-weighted)</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={simulate} disabled={loading} className="btn-secondary flex items-center gap-2">
            <Eye size={16} /> Simulate (preview)
          </button>
          <button onClick={runDraw} disabled={loading} className="btn-primary flex items-center gap-2">
            <Play size={16} /> Run Official Draw
          </button>
        </div>

        {simResult && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-sm font-semibold text-white/70 mb-3">Simulation Preview</p>
            <div className="flex gap-2 mb-4">
              {simResult.numbers.map((n, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center font-bold text-white text-sm">{n}</div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[
                { label: '5-match', users: simResult.results.five },
                { label: '4-match', users: simResult.results.four },
                { label: '3-match', users: simResult.results.three },
              ].map(({ label, users }) => (
                <div key={label} className="glass rounded-xl p-3">
                  <p className="text-white/50 text-xs mb-1">{label} winners</p>
                  <p className="font-bold text-brand-400 text-xl">{users.length}</p>
                  {users.length > 0 && <p className="text-white/30 text-xs mt-1">{users.map((u: any) => u.name).slice(0, 3).join(', ')}{users.length > 3 ? '...' : ''}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Draw history */}
      <div className="card">
        <h2 className="font-display font-bold text-lg mb-4">Draw History</h2>
        {draws.length === 0 ? (
          <p className="text-white/30 text-sm">No draws yet.</p>
        ) : (
          <div className="space-y-3">
            {draws.map(d => (
              <div key={d.id} className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-bold text-white">{d.draw_month}</p>
                    <span className={d.published ? 'badge-active' : 'badge-inactive'}>{d.published ? 'Published' : 'Draft'}</span>
                    <span className="text-white/30 text-xs capitalize">{d.algorithm}</span>
                  </div>
                  <div className="flex gap-2">
                    {d.draw_numbers.map((n, i) => (
                      <span key={i} className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-xs font-bold">{n}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white/40 text-xs">Pool</p>
                    <p className="text-brand-400 font-bold">₹{Number(d.total_pool).toFixed(2)}</p>
                  </div>
                  {!d.published && (
                    <button onClick={() => publish(d.id)} className="btn-primary !py-2 !px-3 text-sm flex items-center gap-1.5">
                      <Send size={14} /> Publish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
