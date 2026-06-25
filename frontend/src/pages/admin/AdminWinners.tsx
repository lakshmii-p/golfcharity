import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, DollarSign, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

interface Winner {
  id: string;
  match_type: string;
  amount: number;
  status: string;
  proof_url?: string;
  verified_at?: string;
  paid_at?: string;
  users: { name: string; email: string };
  draws: { draw_month: string };
}

export default function AdminWinners() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    const { data } = await api.get(`/winners${filter ? `?status=${filter}` : ''}`);
    setWinners(data.winners || []);
  };

  const verify = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.put(`/winners/${id}/verify`, { action });
      toast.success(`Winner ${action}d`);
      load();
    } catch {
      toast.error('Action failed');
    }
  };

  const markPaid = async (id: string) => {
    try {
      await api.put(`/winners/${id}/pay`);
      toast.success('Marked as paid');
      load();
    } catch {
      toast.error('Failed to mark paid');
    }
  };

  const statusColor = (s: string) => {
    if (s === 'paid') return 'badge-active';
    if (s === 'approved') return 'bg-blue-500/20 text-blue-400 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-500/30';
    if (s === 'rejected') return 'badge-danger';
    if (s === 'proof_submitted') return 'badge-pending';
    return 'badge-inactive';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-3xl text-white">Winners</h1>
        <select className="input !w-auto" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="proof_submitted">Proof Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {winners.length === 0 ? (
        <div className="card text-center py-16 text-white/30">No winners found.</div>
      ) : (
        <div className="space-y-3">
          {winners.map(w => (
            <div key={w.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white">{w.users?.name}</p>
                    <span className={statusColor(w.status)}>{w.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-white/40 text-xs">{w.users?.email} · Draw: {w.draws?.draw_month}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-brand-400 font-bold">₹{Number(w.amount).toFixed(2)}</span>
                    <span className="text-white/30 text-xs capitalize">{w.match_type.replace('_', ' ')}</span>
                  </div>
                  {w.proof_url && (
                    <a href={w.proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 text-xs mt-2 hover:text-blue-300">
                      <ExternalLink size={12} /> View proof
                    </a>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {w.status === 'proof_submitted' && (
                    <>
                      <button onClick={() => verify(w.id, 'approve')} className="btn-primary !py-1.5 !px-3 text-sm flex items-center gap-1">
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button onClick={() => verify(w.id, 'reject')} className="btn-danger !py-1.5 !px-3 text-sm flex items-center gap-1">
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}
                  {w.status === 'approved' && (
                    <button onClick={() => markPaid(w.id)} className="btn-primary !py-1.5 !px-3 text-sm flex items-center gap-1">
                      <DollarSign size={14} /> Mark Paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
