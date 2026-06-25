import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Trophy, Target, Users, Star, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

// Hook for scroll-triggered animations
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

// Animated counter
function Counter({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="stat-number">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

function FeaturedCharity() {
  const [charity, setCharity] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get('/charities?featured=true')
      .then(({ data }) => {
        if (data.charities?.length > 0) setCharity(data.charities[0]);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="card h-64 opacity-30" />
      </div>
    </section>
  );

  if (!charity) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="card gradient-border overflow-hidden relative animate-scale-in">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-transparent pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <p className="section-label mb-3">⭐ Featured Charity</p>
              <h2 className="font-display font-bold text-3xl text-white mb-4">{charity.name}</h2>
              <p className="text-white/60 leading-relaxed mb-6">{charity.description}</p>
              {charity.upcoming_events?.[0] && (
                <div className="glass rounded-xl px-4 py-3 mb-6 inline-block">
                  <p className="text-brand-400 text-sm font-medium">📅 {charity.upcoming_events[0].title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{charity.upcoming_events[0].date} · {charity.upcoming_events[0].location}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Link to={`/charities/${charity.id}`} className="btn-primary hover-lift">Learn more</Link>
                <Link to="/register" className="btn-secondary hover-lift">Support this cause</Link>
              </div>
            </div>
            {charity.image_url && (
              <div className="w-full h-64 rounded-xl overflow-hidden">
                <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const { ref: statsRef, inView: statsInView } = useInView();
  const { ref: howRef, inView: howInView } = useInView();
  const { ref: prizeRef, inView: prizeInView } = useInView();
  const { ref: ctaRef, inView: ctaInView } = useInView();

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" ref={heroRef}>
        {/* Animated background orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-brand-500/8 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute top-40 right-0 w-[350px] h-[350px] bg-accent-500/5 rounded-full blur-3xl pointer-events-none" style={{ animation: 'float 6s ease-in-out infinite' }} />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" style={{ animation: 'float 8s ease-in-out infinite reverse' }} />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-brand-400 font-medium mb-8 animate-fade-in hover-lift cursor-default">
              <Heart size={14} className="fill-brand-400 animate-pulse" />
              Every subscription fuels real change
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
              <span className="inline-block">
  Golf that{' '}
</span>
<span className="shimmer-text inline-block">
  gives back
</span>
            </h1>

            <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-fade-up opacity-0-start delay-300">
              Enter your Stableford scores, compete in monthly prize draws, and a portion of every subscription goes directly to the charity you choose.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up opacity-0-start delay-400">
              {user ? (
                <Link to="/dashboard" className="btn-primary flex items-center gap-2 text-base hover-lift animate-pulse-glow">
                  Go to Dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 hover-lift" style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}>
                    Start playing for good <ArrowRight size={18} />
                  </Link>
                  <Link to="/charities" className="btn-secondary text-base hover-lift">
                    See our charities
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
            {[
              { label: 'Prize pool this month', value: 12400, prefix: '₹', icon: Trophy },
              { label: 'Charity funds raised', value: 84200, prefix: '₹', icon: Heart },
              { label: 'Active members', value: 3200, suffix: '+', icon: Users },
              { label: 'Charities supported', value: 12, icon: Star },
            ].map(({ label, value, prefix, suffix, icon: Icon }, i) => (
              <div key={label} className={`card text-center card-glow gradient-border ${statsInView ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: `${i * 0.1}s` }}>
                <Icon size={20} className="text-brand-400 mx-auto mb-2" />
                <p className="text-2xl font-display font-bold text-white">
                  {statsInView ? <Counter target={value} prefix={prefix} suffix={suffix} /> : '0'}
                </p>
                <p className="text-white/40 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <ChevronDown size={20} className="text-white/20 mx-auto animate-bounce" />
        </div>
      </section>

      {/* FEATURED CHARITY */}
<FeaturedCharity />

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" ref={howRef}>
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 ${howInView ? 'animate-fade-up' : 'opacity-0'}`}>
            <p className="section-label mb-3">How it works</p>
            <h2 className="font-display font-bold text-4xl text-white">Three steps to impact</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Subscribe', desc: 'Choose a monthly or yearly plan. A portion goes to your chosen charity automatically.', icon: Heart },
              { step: '02', title: 'Enter scores', desc: 'Log your last 5 Stableford scores. Your rolling score history enters you into each monthly draw.', icon: Target },
              { step: '03', title: 'Win prizes', desc: 'Match 3, 4, or all 5 draw numbers to win from the prize pool. Jackpots roll over!', icon: Trophy },
            ].map(({ step, title, desc, icon: Icon }, i) => (
              <div
                key={step}
                className={`card relative group gradient-border card-glow ${howInView ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="absolute top-4 right-4 text-white/5 font-display font-bold text-6xl leading-none group-hover:text-white/10 transition-colors duration-500">{step}</div>
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mb-4 group-hover:bg-brand-500/30 group-hover:scale-110 transition-all duration-300">
                  <Icon size={20} className="text-brand-400" />
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIZE POOL */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" ref={prizeRef}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={prizeInView ? 'animate-slide-left' : 'opacity-0'}>
              <p className="section-label mb-3">Prize structure</p>
              <h2 className="font-display font-bold text-4xl text-white mb-6">How prizes are distributed</h2>
              <p className="text-white/50 mb-8">Every subscription contributes to the prize pool. The bigger the community, the bigger the prizes.</p>
              <div className="space-y-4">
                {[
                  { label: '5-Number Match', share: '40%', desc: 'Jackpot — rolls over if unclaimed!', color: 'brand' },
                  { label: '4-Number Match', share: '35%', desc: 'Split among all 4-match winners', color: 'accent' },
                  { label: '3-Number Match', share: '25%', desc: 'Split among all 3-match winners', color: 'blue' },
                ].map(({ label, share, desc, color }, i) => (
                  <div
                    key={label}
                    className={`glass rounded-xl p-4 flex items-center gap-4 hover-lift gradient-border ${prizeInView ? 'animate-fade-up' : 'opacity-0'}`}
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    <div className={`text-2xl font-display font-bold transition-transform duration-300 hover:scale-110 ${color === 'brand' ? 'text-brand-400' : color === 'accent' ? 'text-accent-400' : 'text-blue-400'}`}>{share}</div>
                    <div>
                      <p className="font-semibold text-white text-sm">{label}</p>
                      <p className="text-white/40 text-xs">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`card gradient-border ${prizeInView ? 'animate-scale-in delay-200' : 'opacity-0'}`}>
              <h3 className="font-display font-bold text-xl mb-6 text-center">Charity contribution model</h3>
              <div className="space-y-4">
                {[
                  { label: 'Minimum charity contribution', value: '10%' },
                  { label: 'You choose your charity', value: '✓ Always' },
                  { label: 'Increase your % anytime', value: '✓ Yes' },
                  { label: 'Independent donations', value: '✓ Supported' },
                ].map(({ label, value }, i) => (
                  <div key={label} className={`flex justify-between items-center py-3 border-b border-white/5 ${prizeInView ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                    <span className="text-white/60 text-sm">{label}</span>
                    <span className="text-brand-400 font-semibold">{value}</span>
                  </div>
                ))}
              </div>
              <Link to={user ? '/dashboard' : '/register'} className="btn-primary w-full text-center mt-6 block hover-lift">
                {user ? 'View my dashboard' : 'Join the community'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" ref={ctaRef}>
        <div className="max-w-3xl mx-auto text-center">
          <div className={`card border-brand-500/20 relative overflow-hidden gradient-border ${ctaInView ? 'animate-scale-in' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-500/10 rounded-full blur-2xl" style={{ animation: 'float 4s ease-in-out infinite' }} />
            <p className="section-label mb-3 relative z-10">Ready?</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4 relative z-10">
              Every round matters.<br />Start yours today.
            </h2>
            <p className="text-white/50 mb-8 relative z-10">Join thousands of golfers making a difference, one Stableford score at a time.</p>
            <Link to={user ? '/subscribe' : '/register'} className="btn-primary inline-flex items-center gap-2 text-base px-8 hover-lift relative z-10" style={{ animation: 'pulseGlow 2.5s ease-in-out infinite' }}>
              {user ? 'Subscribe now' : 'Get started'} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
