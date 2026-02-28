/**
 * modaic/frontend/src/pages/DashboardPage.jsx
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import { wardrobeAPI, insightsAPI } from '../services/api';
import { PixelDress, PixelShirt, PixelPants, PixelHeart } from '../components/common/PixelIcons';

const QUICK_ACTIONS = [
  { icon: '👗', label: 'Add Item',        path: '/wardrobe', color: 'var(--pink-500)' },
  { icon: '✨', label: 'Build Outfit',    path: '/builder',  color: 'var(--lavender-dark)' },
  { icon: '🤖', label: 'Ask Luna',        path: '/stylist',  color: '#ec4899' },
  { icon: '📊', label: 'View Insights',   path: '/insights', color: '#10b981' },
];

export default function DashboardPage() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState([]);
  const [liveStats, setLiveStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Refresh user from server so sidebar + stats are always fresh
        await refreshUser();

        const [itemsRes, insRes] = await Promise.allSettled([
          wardrobeAPI.getItems({ limit: 6 }),
          insightsAPI.getInsights(),
        ]);
        if (itemsRes.status === 'fulfilled') setRecentItems(itemsRes.value.data.data);
        if (insRes.status === 'fulfilled') setLiveStats(insRes.value.data.data.stats);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Use live stats from insights API — always accurate
  const statCards = [
    { label: 'WARDROBE ITEMS', val: liveStats?.totalItems ?? user?.stats?.totalItems ?? 0, icon: '👗', color: 'var(--pink-100)', border: 'var(--pink-300)' },
    { label: 'OUTFITS CREATED', val: liveStats?.outfitsCreated ?? user?.stats?.outfitsCreated ?? 0, icon: '✨', color: 'var(--lavender)', border: 'var(--lavender-dark)' },
    { label: 'AI CHATS', val: user?.stats?.aiChats ?? 0, icon: '🤖', color: 'var(--mint)', border: '#34d399' },
    { label: 'ECO SCORE', val: liveStats ? `${liveStats.sustainabilityScore}%` : '—', icon: '🌱', color: 'var(--yellow)', border: '#fbbf24' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-in">
      {/* Greeting */}
      <div className="pixel-card" style={{ background: 'linear-gradient(135deg, var(--pink-100), var(--lavender))', borderColor: 'var(--pink-300)' }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: 'var(--pink-600)', marginBottom: 8 }}>
          ✦ GOOD {new Date().getHours() < 12 ? 'MORNING' : new Date().getHours() < 17 ? 'AFTERNOON' : 'EVENING'}, {user?.name?.split(' ')[0]?.toUpperCase() || 'BABE'}! ✦
        </div>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 16 }}>
          Ready to look amazing today? Your AI stylist Luna is here to help you shine 🌸
        </p>
        {!user?.styleProfile?.quizCompleted && (
          <button className="btn-pixel secondary" onClick={() => navigate('/style-quiz')} style={{ fontSize: 8 }}>
            💖 TAKE STYLE QUIZ
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {statCards.map(card => (
          <div key={card.label} className="pixel-card" style={{ background: card.color, borderColor: card.border, boxShadow: `4px 4px 0 ${card.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 16, color: 'var(--gray-700)', marginBottom: 4 }}>{card.val}</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 6, color: 'var(--gray-500)', letterSpacing: 0.5 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="section-title">QUICK ACTIONS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              style={{
                background: 'white', border: '3px solid var(--pink-200)', boxShadow: '4px 4px 0 var(--pink-200)',
                padding: '16px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, transition: 'all 0.1s',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 var(--pink-300)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 var(--pink-200)'; }}
            >
              <span style={{ fontSize: 28 }}>{action.icon}</span>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--pink-600)' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Wardrobe */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>RECENT ITEMS</div>
          <button className="btn-pixel secondary" onClick={() => navigate('/wardrobe')} style={{ fontSize: 7, padding: '6px 10px' }}>
            VIEW ALL →
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="pixel-spinner" style={{ margin: '0 auto 12px' }}/>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--pink-300)' }}>LOADING...</div>
          </div>
        ) : recentItems.length === 0 ? (
          <div className="pixel-card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👗</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--pink-500)', marginBottom: 8 }}>EMPTY WARDROBE</div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', marginBottom: 16 }}>
              Add your first clothing item to get started!
            </p>
            <button className="btn-pixel" onClick={() => navigate('/wardrobe')} style={{ fontSize: 8 }}>
              + ADD FIRST ITEM
            </button>
          </div>
        ) : (
          <div className="grid-auto">
            {recentItems.map(item => (
              <div key={item._id} className="clothing-card" onClick={() => navigate('/wardrobe')}>
                <div style={{ position: 'relative' }}>
                  <img src={item.imageUrl} alt={item.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <div style={{ display: 'none', width: '100%', aspectRatio: '1', background: 'var(--pink-50)', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                    {item.category === 'dresses' ? '👗' : item.category === 'tops' ? '👕' : item.category === 'shoes' ? '👟' : '👔'}
                  </div>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--gray-700)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 700 }}>{item.category}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}