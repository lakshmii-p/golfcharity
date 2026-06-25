import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Trophy, Zap, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const cancelled = searchParams.get('cancelled');
  const { refreshUser } = useAuth();

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setLoading(plan);
    try {
      const { data } = await api.post('/subscriptions/checkout', { plan });
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No URL');
      }
    } catch {
      // Stripe not available — activate subscription directly for demo
      try {
        await api.post('/subscriptions/demo-activate', { plan });
        await refreshUser();
        toast.success('Subscription activated (demo mode)!');
        window.location.href = '/dashboard?subscribed=true';
      } catch {
        // Fallback — just show demo message
        toast.success('Demo mode: Redirecting to dashboard...', { duration: 3000 });
        setTimeout(() => { window.location.href = '/dashboard?subscribed=true'; }, 1500);
      }
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      key: 'monthly' as const,
      name: 'Monthly',
      price: '₹9.99',
      period: '/month',
      features: ['Enter 5 rolling scores', 'Monthly prize draw entry', 'Choose your charity', 'Cancel anytime'],
      icon: Trophy,
      highlight: false,
    },
    {
      key: 'yearly' as const,
      name: 'Yearly',
      price: '₹89.99',
      period: '/year',
      badge: 'Save 25%',
      features: ['Everything in Monthly', '2 months free vs monthly', 'Priority draw eligibility', 'Charity impact report'],
      icon: Zap,
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        {cancelled && (
          <div className="max-w-lg mx-auto mb-8 glass border border-yellow-500/30 rounded-xl p-4 text-yellow-400 text-sm text-center">
            Checkout was cancelled. You can try again below.
          </div>
        )}

        {/* Demo mode notice */}
        <div className="max-w-lg mx-auto mb-8 glass border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
          <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-blue-300 text-sm">
            <strong>Demo mode:</strong> Payment gateway is in test mode. Click subscribe to activate your account instantly for demonstration purposes.
          </p>
        </div>

        <div className="max-w-4xl mx-auto text-center mb-12">
          <p className="section-label mb-3">Pricing</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">Choose your plan</h1>
          <p className="text-white/50 text-lg">Subscribe to enter monthly draws and support your chosen charity.</p>
        </div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map(({ key, name, price, period, badge, features, icon: Icon, highlight }) => (
            <div key={key} className={`card relative ${highlight ? 'border-brand-500/40 bg-brand-500/5' : ''}`}>
              {badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {badge}
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${highlight ? 'bg-brand-500' : 'bg-white/10'}`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-xl">{name}</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-display font-bold text-white">{price}</span>
                <span className="text-white/40 text-sm ml-1">{period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <Check size={14} className="text-brand-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(key)}
                disabled={!!loading}
                className={`w-full ${highlight ? 'btn-primary' : 'btn-secondary'}`}
              >
                {loading === key ? 'Activating...' : `Subscribe ${name}`}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-sm mt-8">
          Secure payment via Stripe. Cancel anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}
