/**
 * modaic/frontend/src/pages/InsightsPage.jsx
 */

import { useState, useEffect } from 'react';
import { insightsAPI, trendsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function InsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState(null);
  const [trendLoading, setTrendLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    insightsAPI.getInsights()
      .then(res => setData(res.data.data))
      .finally(() => setLoading(false));

    trendsAPI.getTrend()
      .then(res => setTrend(res.data.data))
      .catch(() => {})
      .finally(() => setTrendLoading(false));
  }, []);

  const refreshTrend = async () => {
    setRefreshing(true);
    try {
      const res = await trendsAPI.refreshTrend();
      setTrend(res.data.data);
      toast.success("Trend alert refreshed! ✨");
    } catch {
      toast.error("Could not refresh trend");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div className="pixel-spinner" style={{ margin: '0 auto 12px' }}/>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--pink-300)' }}>CRUNCHING YOUR DATA...</div>
    </div>
  );

  const { stats, unlovedItems, aiInsights } = data || {};

  const statCards = [
    { icon: '♻️', title: 'Sustainability Score', val: `${stats?.sustainabilityScore || 0}/100`, color: '#bbf7d0', border: '#6ee7b7', desc: `You reuse ${stats?.reuseRate || 0}% of your wardrobe!` },
    { icon: '💸', title: 'Avg Cost Per Wear', val: stats?.avgCostPerWear ? `₹${stats.avgCostPerWear}` : '—', color: '#fef9c3', border: '#fcd34d', desc: 'Across items with price data' },
    { icon: '✨', title: 'Avg Wears Per Item', val: stats?.avgWears || 0, color: 'var(--lavender)', border: 'var(--lavender-dark)', desc: 'Higher = better utilization' },
    { icon: '👗', title: 'Total Items', val: stats?.totalItems || 0, color: 'var(--pink-100)', border: 'var(--pink-300)', desc: 'In your digital wardrobe' },
  ];

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {statCards.map(card => (
          <div key={card.title} className="pixel-card" style={{ background: card.color, borderColor: card.border, boxShadow: `4px 4px 0 ${card.border}` }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 18, color: 'var(--gray-700)', marginBottom: 6 }}>{card.val}</div>
            <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--gray-700)', marginBottom: 4 }}>{card.title}</div>
            <div style={{ fontSize: 10, color: 'var(--gray-500)', fontWeight: 700 }}>{card.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Category breakdown */}
        <div className="pixel-card">
          <div className="section-title">CATEGORY BREAKDOWN</div>
          {stats?.categoryBreakdown && Object.entries(stats.categoryBreakdown)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => {
              const max = Math.max(...Object.values(stats.categoryBreakdown));
              const colors = { tops: '#c4b5fd', bottoms: '#93c5fd', dresses: '#f9a8d4', outerwear: '#bbf7d0', shoes: '#fcd34d', accessories: '#fca5a5' };
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 90, fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'capitalize' }}>{cat}</span>
                  <div style={{ flex: 1, background: 'var(--pink-100)', height: 20, border: '2px solid var(--pink-200)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: colors[cat] || 'var(--pink-300)', width: `${(count / max) * 100}%`, transition: 'width 1s ease' }}/>
                  </div>
                  <span style={{ width: 20, fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--pink-500)' }}>{count}</span>
                </div>
              );
            })}
        </div>

        {/* Unloved items */}
        <div className="pixel-card">
          <div className="section-title">GIVE THESE LOVE 💕</div>
          <p style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 700, marginBottom: 12 }}>
            These haven't been worn recently — time to style them!
          </p>
          {unlovedItems?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, fontSize: 12, fontWeight: 700, color: 'var(--gray-400)' }}>
              🌟 Great job! You're wearing everything!
            </div>
          ) : (
            unlovedItems?.slice(0, 5).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 4 ? '2px dashed var(--pink-100)' : 'none' }}>
                <div style={{ width: 36, height: 36, background: 'var(--pink-50)', border: '2px solid var(--pink-200)', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray-700)' }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 700 }}>Worn {item.wearCount}×</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI insights */}
      {aiInsights && (
        <div className="pixel-card" style={{ background: 'linear-gradient(135deg, var(--pink-50), var(--lavender))', borderColor: 'var(--lavender-dark)' }}>
          <div className="section-title" style={{ color: 'var(--lavender-dark)' }}>LUNA'S INSIGHTS ✦</div>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-600)', lineHeight: 1.8 }}>{aiInsights}</p>
        </div>
      )}

      {/* Weekly Trend Alert */}
      <div className="pixel-card" style={{ background: 'linear-gradient(135deg, #fef3c7, #fdf2f8)', borderColor: '#fbbf24', boxShadow: '4px 4px 0 #fbbf24' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="section-title" style={{ color: '#92400e', marginBottom: 0 }}>✦ LUNA'S WEEKLY TREND ALERT</div>
          <button
            onClick={refreshTrend}
            disabled={refreshing}
            style={{ fontFamily: 'var(--font-pixel)', fontSize: 6, padding: '5px 10px', background: '#fbbf24', border: '2px solid #d97706', color: 'white', cursor: 'pointer' }}
          >
            {refreshing ? '...' : '⟳ REFRESH'}
          </button>
        </div>

        {trendLoading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div className="pixel-spinner" style={{ margin: '0 auto 8px' }}/>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e' }}>Luna is generating your trend alert...</div>
          </div>
        ) : trend ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{trend.badge || '✨'}</span>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: '#92400e' }}>{trend.title}</div>
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#78350f', lineHeight: 1.7, marginBottom: 14 }}>{trend.summary}</p>
            {trend.tips?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: '#92400e', marginBottom: 8 }}>3 WAYS TO WEAR IT</div>
                {trend.tips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: '#fbbf24', flexShrink: 0, marginTop: 2 }}>{i + 1}.</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#78350f', lineHeight: 1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            )}
            {trend.suggestion && (
              <div style={{ background: 'rgba(251,191,36,0.2)', border: '2px solid #fbbf24', padding: 10 }}>
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 6, color: '#92400e' }}>💡 CONSIDER ADDING: </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#78350f' }}>{trend.suggestion}</span>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 10 }}>
              Add more items to your wardrobe to unlock trend alerts! 👗
            </div>
            <button onClick={refreshTrend} className="btn-pixel" style={{ fontSize: 7 }}>
              ✦ GENERATE TREND ALERT
            </button>
          </div>
        )}
      </div>

      {/* Style badges */}
      <div className="pixel-card">
        <div className="section-title">STYLE BADGES</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            stats?.sustainabilityScore >= 70 && '🌿 Eco Warrior',
            stats?.totalItems >= 20 && '👗 Fashion Maven',
            stats?.outfitsCreated >= 10 && '✨ Style Creator',
            stats?.avgWears >= 5 && '♻️ Smart Shopper',
            '🌸 Modaic Member',
          ].filter(Boolean).map(badge => (
            <span key={badge} className="badge pink" style={{ fontSize: 9, padding: '6px 12px' }}>{badge}</span>
          ))}
        </div>
      </div>
    </div>
  );
}