import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  subscription_status: string;
  subscription_plan: string;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', subscription_status: '' });

  const load = async () => {
    const { data } = await api.get(`/admin/users?page=${page}&limit=15${search ? `&search=${search}` : ''}`);
    setUsers(data.users || []);
    setTotal(data.total || 0);
  };

  useEffect(() => { load(); }, [page, search]);

  const saveEdit = async (id: string) => {
    try {
      await api.put(`/admin/users/${id}`, editData);
      toast.success('User updated');
      setEditId(null);
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const startEdit = (user: User) => {
    setEditId(user.id);
    setEditData({ name: user.name, subscription_status: user.subscription_status });
  };

  const totalPages = Math.ceil(total / 15);

  const badge = (s: string) => {
    const map: Record<string, string> = { active: 'badge-active', inactive: 'badge-inactive', cancelled: 'badge-danger', lapsed: 'badge-danger' };
    return map[s] || 'badge-inactive';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Users</h1>
          <p className="text-white/50 text-sm mt-1">{total} total users</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="input pl-9" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-left border-b border-white/5">
                <th className="pb-3 font-medium pr-4">Name / Email</th>
                <th className="pb-3 font-medium pr-4">Status</th>
                <th className="pb-3 font-medium pr-4">Plan</th>
                <th className="pb-3 font-medium pr-4">Role</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="py-3 pr-4">
                    {editId === u.id ? (
                      <input className="input !py-1.5 text-sm w-40" value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} />
                    ) : (
                      <div>
                        <p className="text-white font-medium">{u.name}</p>
                        <p className="text-white/40 text-xs">{u.email}</p>
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {editId === u.id ? (
                      <select className="input !py-1.5 text-sm w-32" value={editData.subscription_status} onChange={e => setEditData(d => ({ ...d, subscription_status: e.target.value }))}>
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                        <option value="cancelled">cancelled</option>
                        <option value="lapsed">lapsed</option>
                      </select>
                    ) : (
                      <span className={badge(u.subscription_status)}>{u.subscription_status}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-white/60 capitalize">{u.subscription_plan || '—'}</td>
                  <td className="py-3 pr-4">
                    <span className={u.role === 'admin' ? 'badge-active' : 'badge-inactive'}>{u.role}</span>
                  </td>
                  <td className="py-3">
                    {editId === u.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(u.id)} className="text-brand-400 hover:text-brand-300"><Check size={16} /></button>
                        <button onClick={() => setEditId(null)} className="text-red-400 hover:text-red-300"><X size={16} /></button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(u)} className="text-white/30 hover:text-white/70"><Pencil size={15} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <p className="text-white/40 text-sm">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary !py-1.5 !px-3 disabled:opacity-30"><ChevronLeft size={15} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary !py-1.5 !px-3 disabled:opacity-30"><ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
