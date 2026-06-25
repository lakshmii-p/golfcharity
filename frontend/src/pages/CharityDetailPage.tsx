import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, Heart } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import api from '../utils/api';

interface Charity {
  id: string;
  name: string;
  description: string;
  image_url: string;
  website: string;
  featured: boolean;
  upcoming_events: { title: string; date: string; location: string }[];
}

export default function CharityDetailPage() {
  const { id } = useParams();
  const [charity, setCharity] = useState<Charity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/charities/${id}`)
      .then(({ data }) => setCharity(data.charity))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" /></div>;
  if (!charity) return <div className="min-h-screen flex items-center justify-center text-white/50">Charity not found</div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link to="/charities" className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to charities
          </Link>

          {charity.image_url && (
            <div className="w-full h-64 rounded-2xl overflow-hidden mb-8 bg-dark-600">
              <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-start justify-between mb-4">
            <div>
              {charity.featured && <span className="badge-active mb-2 inline-block">Featured Charity</span>}
              <h1 className="font-display font-bold text-4xl text-white">{charity.name}</h1>
            </div>
            {charity.website && (
              <a href={charity.website} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-2 !px-3 flex items-center gap-1.5 text-sm">
                <ExternalLink size={14} /> Website
              </a>
            )}
          </div>

          <p className="text-white/60 leading-relaxed text-lg mb-8">{charity.description}</p>

          {charity.upcoming_events?.length > 0 && (
            <div className="card mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-brand-400" />
                <h2 className="font-display font-bold text-lg">Upcoming Events</h2>
              </div>
              <div className="space-y-3">
                {charity.upcoming_events.map((event, i) => (
                  <div key={i} className="glass rounded-xl px-4 py-3">
                    <p className="font-semibold text-white text-sm">{event.title}</p>
                    <p className="text-white/40 text-xs mt-0.5">{event.date} · {event.location}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card border-brand-500/20 bg-brand-500/5 text-center">
            <Heart size={28} className="text-brand-400 mx-auto mb-3" />
            <h3 className="font-display font-bold text-xl text-white mb-2">Support this charity</h3>
            <p className="text-white/50 text-sm mb-6">Subscribe to GolfCharity and choose {charity.name} as your cause.</p>
            <Link to="/register" className="btn-primary inline-block">Get started</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
