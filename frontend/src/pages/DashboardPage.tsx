import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trophy, Target, Heart, Calendar, Plus, Pencil, Trash2, Upload, CheckCircle, Clock, XCircle, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';

interface Score {
  id: string;
  score: number;
  score_date: string;
}

interface Winner {
  id: string;
  match_type: string;
  amount: number;
  status: string;
  proof_url?: string;
  draws: { draw_month: string; draw_numbers: number[] };
}

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [scores, setScores] = useState<Score[]>([]);
  const [winnings, setWinnings] = useState<Winner[]>([]);
  const [totalWon, setTotalWon] = useState(0);
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  const [showAddScore, setShowAddScore] = useState(false);
  const [proofWinnerId, setProofWinnerId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    if (searchParams.get('subscribed')) {
      toast.success('Subscription activated! Welcome aboard!');
      refreshUser();
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [scoresRes, winningsRes] = await Promise.all([
        api.get('/scores'),
        api.get('/winners/my'),
      ]);
      setScores(scoresRes.data.scores || []);
      setWinnings(winningsRes.data.winnings || []);
      setTotalWon(winningsRes.data.totalWon || 0);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const addScore = async (data: any) => {
    try {
      await api.post('/scores', { score: Number(data.score), scoreDate: data.scoreDate });
      toast.success('Score added!');
      setShowAddScore(false);
      reset();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add score');
    }
  };

  const updateScore = async (data: any) => {
    if (!editingScore) return;
    try {
      await api.put(`/scores/${editingScore.id}`, { score: Number(data.score), scoreDate: data.scoreDate });
      toast.success('Score updated!');
      setEditingScore(null);
      reset();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update score');
    }
  };

  const deleteScore = async (id: string) => {
    if (!confirm('Delete this score?')) return;
    try {
      await api.delete(`/scores/${id}`);
      toast.success('Score deleted');
      loadData();
    } catch {
      toast.error('Failed to delete score');
    }
  };

  const startEdit = (score: Score) => {
    setEditingScore(score);
    setShowAddScore(false);
    setValue('score', score.score);
    setValue('scoreDate', score.score_date);
  };

  const submitProof = async () => {
    if (!proofWinnerId || !proofUrl) return;
    try {
      await api.put(`/winners/${proofWinnerId}/proof`, { proofUrl });
      toast.success('Proof submitted!');
      setProofWinnerId(null);
      setProofUrl('');
      loadData();
    } catch {
      toast.error('Failed to submit proof');
    }
  };

  const handlePortal = async () => {
    try {
      const { data } = await api.post('/subscriptions/portal');
      window.location.href = data.url;
    } catch {
      toast.error('Failed to open billing portal');
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      active: 'badge-active',
      inactive: 'badge-inactive',
      cancelled: 'badge-danger',
      lapsed: 'badge-danger',
    };
    return map[s] || 'badge-inactive';
  };

  const winnerStatusIcon = (s: string) => {
    if (s === 'paid') return <CheckCircle size={14} className="text-brand-400" />;
    if (s === 'approved') return <CheckCircle size={14} className="text-blue-400" />;
    if (s === 'rejected') return <XCircle size={14} className="text-red-400" />;
    return <Clock size={14} className="text-yellow-400" />;
  };

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    </div>
  );

  const isActive = user?.subscription_status === 'active';

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white">Welcome, {user?.name?.split(' ')[0]}</h1>
          <p className="text-white/50 mt-1">Your GolfCharity dashboard</p>
        </div>

        {/* Subscription banner */}
        {!isActive && (
          <div className="glass border border-yellow-500/30 rounded-xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-yellow-400 font-medium">No active subscription</p>
              <p className="text-white/50 text-sm">Subscribe to enter draws and track scores.</p>
            </div>
            <Link to="/subscribe" className="btn-primary !py-2 text-sm whitespace-nowrap">Subscribe now</Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Entry */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target size={18} className="text-brand-400" />
                  <h2 className="font-display font-bold text-lg">My Scores</h2>
                </div>
                {isActive && (
                  <button onClick={() => { setShowAddScore(true); setEditingScore(null); reset(); }} className="btn-primary !py-1.5 !px-3 text-sm flex items-center gap-1">
                    <Plus size={14} /> Add score
                  </button>
                )}
              </div>

              {/* Add/Edit form */}
              {(showAddScore || editingScore) && (
                <form onSubmit={handleSubmit(editingScore ? updateScore : addScore)} className="glass rounded-xl p-4 mb-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white/70">{editingScore ? 'Edit score' : 'New score'}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/50 block mb-1">Score (1–45)</label>
                      <input type="number" className="input !py-2" min={1} max={45} placeholder="32" {...register('score', { required: true, min: 1, max: 45 })} />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 block mb-1">Date</label>
                      <input type="date" className="input !py-2" max={new Date().toISOString().split('T')[0]} {...register('scoreDate', { required: true })} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary !py-2 text-sm">{editingScore ? 'Save changes' : 'Add score'}</button>
                    <button type="button" onClick={() => { setShowAddScore(false); setEditingScore(null); reset(); }} className="btn-secondary !py-2 text-sm">Cancel</button>
                  </div>
                </form>
              )}

              <p className="text-white/40 text-xs mb-3">Last 5 scores shown · newest first · 1 score per date</p>
              {scores.length === 0 ? (
                <div className="text-center py-8 text-white/30">
                  <Target size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No scores yet. Add your first Stableford score!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scores.map((s) => (
                    <div key={s.id} className="glass rounded-xl px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-500/20 border border-brand-500/20 flex items-center justify-center">
                          <span className="font-display font-bold text-brand-400">{s.score}</span>
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{s.score} pts</p>
                          <p className="text-white/40 text-xs">{format(new Date(s.score_date + 'T00:00:00'), 'dd MMM yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(s)} className="text-white/30 hover:text-white/70 transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => deleteScore(s.id)} className="text-white/30 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Winnings */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={18} className="text-brand-400" />
                <h2 className="font-display font-bold text-lg">My Winnings</h2>
                <span className="ml-auto text-brand-400 font-bold">₹{totalWon.toFixed(2)} paid</span>
              </div>

              {winnings.length === 0 ? (
                <div className="text-center py-8 text-white/30">
                  <Trophy size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No winnings yet. Draw results appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {winnings.map((w) => (
                    <div key={w.id} className="glass rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-white text-sm">{w.match_type.replace('_', ' ')} — {w.draws?.draw_month}</p>
                          <p className="text-brand-400 font-bold mt-0.5">₹{w.amount.toFixed(2)}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-white/40">
                            {winnerStatusIcon(w.status)}
                            <span className="capitalize">{w.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                        {w.status === 'pending' && (
                          <button onClick={() => setProofWinnerId(w.id)} className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1">
                            <Upload size={12} /> Upload proof
                          </button>
                        )}
                      </div>
                      {proofWinnerId === w.id && (
                        <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                          <p className="text-xs text-white/50">Paste a URL to a screenshot of your golf platform scores</p>
                          <input className="input !py-2 text-sm" placeholder="https://..." value={proofUrl} onChange={e => setProofUrl(e.target.value)} />
                          <div className="flex gap-2">
                            <button onClick={submitProof} className="btn-primary !py-1.5 text-sm">Submit</button>
                            <button onClick={() => setProofWinnerId(null)} className="btn-secondary !py-1.5 text-sm">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Subscription card */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-brand-400" />
                <h2 className="font-display font-bold text-lg">Subscription</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Status</span>
                  <span className={statusBadge(user?.subscription_status || 'inactive')}>{user?.subscription_status}</span>
                </div>
                {user?.subscription_plan && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 text-sm">Plan</span>
                    <span className="text-white text-sm capitalize">{user.subscription_plan}</span>
                  </div>
                )}
                {user?.subscription_renewal_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 text-sm">Renews</span>
                    <span className="text-white text-sm">{format(new Date(user.subscription_renewal_date), 'dd MMM yyyy')}</span>
                  </div>
                )}
              </div>
              {isActive ? (
                <button onClick={handlePortal} className="btn-secondary w-full mt-4 text-sm">Manage billing</button>
              ) : (
                <Link to="/subscribe" className="btn-primary w-full text-center mt-4 block text-sm">Subscribe now</Link>
              )}
            </div>

            {/* Charity card */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Heart size={18} className="text-brand-400" />
                <h2 className="font-display font-bold text-lg">Charity</h2>
              </div>
              {user?.charity_id ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Contribution</span>
                    <span className="text-brand-400 font-bold">{user.charity_percentage}%</span>
                  </div>
                  <Link to="/charities" className="text-brand-400 text-sm hover:text-brand-300">Change charity →</Link>
                </div>
              ) : (
                <div>
                  <p className="text-white/40 text-sm mb-3">No charity selected.</p>
                  <Link to="/charities" className="btn-secondary text-sm w-full text-center block">Choose a charity</Link>
                </div>
              )}
            </div>

            {/* Participation summary */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-brand-400" />
                <h2 className="font-display font-bold text-lg">Participation</h2>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Active scores</span>
                  <span className="text-white font-medium">{scores.length}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Draw eligible</span>
                  <span className={isActive && scores.length > 0 ? 'text-brand-400 font-medium' : 'text-red-400'}>{isActive && scores.length > 0 ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Total draws entered</span>
                  <span className="text-white font-medium">{winnings.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
