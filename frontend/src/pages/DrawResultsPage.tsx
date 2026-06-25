import { useEffect, useState } from 'react';
import { Trophy, Hash } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import api from '../utils/api';

interface Draw {
  id: string;
  draw_month: string;
  draw_numbers: number[];
  total_pool: number;
  jackpot_pool: number;
  four_match_pool: number;
  three_match_pool: number;
  jackpot_rollover: number;
  published: boolean;
}

export default function DrawResultsPage() {
  const [draw, setDraw] = useState<Draw | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/draws/latest')
      .then(({ data }) => setDraw(data.draw))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Monthly Draw</p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">Draw Results</h1>
            <p className="text-white/50">The latest published draw numbers and prize pool breakdown.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
            </div>
          ) : !draw ? (
            <div className="card text-center py-16">
              <Trophy size={48} className="mx-auto mb-4 text-white/10" />
              <p className="text-white/40 text-lg font-display font-bold">No draw results yet</p>
              <p className="text-white/30 text-sm mt-2">Check back after the first monthly draw is published.</p>
            </div>
          ) : (
            <>
              <div className="card mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-white/40 text-sm">Draw month</p>
                    <p className="font-display font-bold text-2xl text-white">{draw.draw_month}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-sm">Total prize pool</p>
                    <p className="font-display font-bold text-2xl text-brand-400">₹{Number(draw.total_pool).toFixed(2)}</p>
                  </div>
                </div>

                {/* Draw numbers */}
                <div className="text-center mb-6">
                  <p className="text-white/50 text-sm mb-4">Winning numbers</p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {draw.draw_numbers.map((n, i) => (
                      <div key={i} className="w-14 h-14 rounded-full bg-brand-500 flex items-center justify-center font-display font-bold text-xl text-white shadow-lg shadow-brand-500/30">
                        {n}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prize breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: '5-Number Match', pool: draw.jackpot_pool, rollover: draw.jackpot_rollover > 0 },
                    { label: '4-Number Match', pool: draw.four_match_pool, rollover: false },
                    { label: '3-Number Match', pool: draw.three_match_pool, rollover: false },
                  ].map(({ label, pool, rollover }) => (
                    <div key={label} className="glass rounded-xl p-4 text-center">
                      <p className="text-white/50 text-xs mb-1">{label}</p>
                      <p className="font-display font-bold text-xl text-white">₹{Number(pool).toFixed(2)}</p>
                      {rollover && <p className="text-accent-400 text-xs mt-1">⚡ Jackpot rolls over!</p>}
                    </div>
                  ))}
                </div>
              </div>

              {draw.jackpot_rollover > 0 && (
                <div className="glass border border-accent-500/30 rounded-xl p-4 text-center">
                  <p className="text-accent-400 font-semibold">Jackpot rollover: ₹{Number(draw.jackpot_rollover).toFixed(2)} carries into next month!</p>
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
