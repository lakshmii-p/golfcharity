import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, ExternalLink } from 'lucide-react';
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
  upcoming_events: any[];
}

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      api.get(`/charities${search ? `?search=${search}` : ''}`)
        .then(({ data }) => setCharities(data.charities || []))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const featured = charities.filter(c => c.featured);
  const others = charities.filter(c => !c.featured);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="section-label mb-3">Charities</p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">The causes you support</h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">Every subscription contributes to real change. Choose the cause that matters to you.</p>
          </div>

          {/* Search */}
          <div className="relative max-w-md mx-auto mb-12">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Search charities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {featured.length > 0 && !search && (
                <div className="mb-12">
                  <p className="section-label mb-4">Featured</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featured.map(c => <CharityCard key={c.id} charity={c} featured />)}
                  </div>
                </div>
              )}

              {others.length > 0 && (
                <div>
                  {!search && <p className="section-label mb-4">All Charities</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(search ? charities : others).map(c => <CharityCard key={c.id} charity={c} />)}
                  </div>
                </div>
              )}

              {charities.length === 0 && (
                <div className="text-center py-20 text-white/30">
                  <Heart size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No charities found.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function CharityCard({ charity, featured = false }: { charity: Charity; featured?: boolean }) {
  return (
    <div className={`card group hover:border-brand-500/30 transition-all duration-300 ${featured ? 'border-brand-500/20' : ''}`}>
      {charity.image_url && (
        <div className="w-full h-40 rounded-xl overflow-hidden mb-4 bg-dark-600">
          <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-display font-bold text-lg text-white">{charity.name}</h3>
        {featured && <span className="badge-active">Featured</span>}
      </div>
      <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-3">{charity.description}</p>
      {charity.upcoming_events?.length > 0 && (
        <div className="glass rounded-lg px-3 py-2 mb-4">
          <p className="text-xs text-brand-400 font-medium">Next event: {charity.upcoming_events[0].title}</p>
          <p className="text-xs text-white/40">{charity.upcoming_events[0].date} · {charity.upcoming_events[0].location}</p>
        </div>
      )}
      <div className="flex gap-2 mt-auto">
        <Link to={`/charities/${charity.id}`} className="btn-secondary !py-2 text-sm flex-1 text-center">Learn more</Link>
        {charity.website && (
          <a href={charity.website} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-2 !px-3 text-sm">
            <ExternalLink size={15} />
          </a>
        )}
      </div>
    </div>
  );
}
