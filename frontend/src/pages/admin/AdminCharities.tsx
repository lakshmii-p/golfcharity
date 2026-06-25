import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';

interface Charity {
  id: string;
  name: string;
  description: string;
  image_url: string;
  website: string;
  featured: boolean;
}

interface FormData {
  name: string;
  description: string;
  imageUrl: string;
  website: string;
  featured: boolean;
}

export default function AdminCharities() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Charity | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<FormData>();

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await api.get('/charities');
    setCharities(data.charities || []);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) {
        await api.put(`/charities/${editing.id}`, data);
        toast.success('Charity updated');
      } else {
        await api.post('/charities', data);
        toast.success('Charity created');
      }
      setShowForm(false);
      setEditing(null);
      reset();
      load();
    } catch {
      toast.error('Failed to save charity');
    }
  };

  const deleteCharity = async (id: string) => {
    if (!confirm('Delete this charity?')) return;
    try {
      await api.delete(`/charities/${id}`);
      toast.success('Charity deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const startEdit = (c: Charity) => {
    setEditing(c);
    setShowForm(true);
    setValue('name', c.name);
    setValue('description', c.description);
    setValue('imageUrl', c.image_url || '');
    setValue('website', c.website || '');
    setValue('featured', c.featured);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-3xl text-white">Charities</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); reset(); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Charity
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-bold text-lg">{editing ? 'Edit Charity' : 'New Charity'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); reset(); }} className="text-white/30 hover:text-white"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 block mb-1">Name</label>
                <input className="input" placeholder="Charity name" {...register('name', { required: true })} />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Website</label>
                <input className="input" placeholder="https://..." {...register('website')} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-white/50 block mb-1">Description</label>
                <textarea className="input resize-none" rows={3} placeholder="What this charity does..." {...register('description')} />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Image URL</label>
                <input className="input" placeholder="https://..." {...register('imageUrl')} />
              </div>
              <div className="flex items-center gap-3 mt-4">
                <input type="checkbox" id="featured" {...register('featured')} className="w-4 h-4 accent-green-500" />
                <label htmlFor="featured" className="text-sm text-white/70">Featured charity</label>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2"><Check size={16} /> Save</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); reset(); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {charities.map(c => (
          <div key={c.id} className="card flex justify-between items-start">
            <div className="flex gap-3">
              {c.image_url && <img src={c.image_url} alt={c.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{c.name}</p>
                  {c.featured && <span className="badge-active">Featured</span>}
                </div>
                <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{c.description}</p>
              </div>
            </div>
            <div className="flex gap-2 ml-3 flex-shrink-0">
              <button onClick={() => startEdit(c)} className="text-white/30 hover:text-white/70"><Pencil size={15} /></button>
              <button onClick={() => deleteCharity(c.id)} className="text-white/30 hover:text-red-400"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
