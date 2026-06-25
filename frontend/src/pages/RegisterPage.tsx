import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Trophy, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface FormData {
  name: string;
  email: string;
  password: string;
  charityId: string;
  charityPercentage: number;
}

interface Charity {
  id: string;
  name: string;
}

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [charities, setCharities] = useState<Charity[]>([]);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { charityPercentage: 10 }
  });

  useEffect(() => {
    api.get('/charities').then(({ data }) => setCharities(data.charities || []));
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        charityId: data.charityId || undefined,
        charityPercentage: Number(data.charityPercentage),
      });
      toast.success('Account created!');
      navigate('/subscribe');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <Trophy size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl">GolfCharity</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white">Create your account</h1>
          <p className="text-white/50 mt-2">Play golf. Win prizes. Give back.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1.5 font-medium">Full name</label>
              <input className="input" placeholder="Jane Smith" {...register('name', { required: 'Name required' })} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1.5 font-medium">Email</label>
              <input type="email" className="input" placeholder="you@example.com" {...register('email', { required: 'Email required' })} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Min. 8 characters"
                  {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1.5 font-medium">Choose a charity</label>
              <select className="input" {...register('charityId')}>
                <option value="">Select a charity (optional)</option>
                {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1.5 font-medium">
                Charity contribution % <span className="text-white/30">(min 10%)</span>
              </label>
              <input
                type="number"
                className="input"
                min={10}
                max={100}
                {...register('charityPercentage', { min: 10, max: 100 })}
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account? <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
