/**
 * modaic/frontend/src/components/layout/AppLayout.jsx
 * Main layout shell — sidebar + top bar + page content
 */

import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../context/authStore';
import { PixelHanger, PixelHeart, PixelSparkle } from '../common/PixelIcons';

const NAV = [
  { path: '/dashboard', label: 'Dashboard',     icon: '🏠' },
  { path: '/wardrobe',  label: 'My Wardrobe',   icon: '👗' },
  { path: '/builder',   label: 'Outfit Builder', icon: '✨' },
  { path: '/stylist',   label: 'AI Stylist',     icon: '🤖' },
  { path: '/insights',  label: 'Insights',       icon: '📊' },
];

const PAGE_TITLES = {
  '/dashboard': 'Dashboard ✨',
  '/wardrobe':  'My Wardrobe 👗',
  '/builder':   'Outfit Builder ✦',
  '/stylist':   'AI Stylist Chat 🤖',
  '/insights':  'Style Insights 📊',
  '/style-quiz':'Style Quiz 💖',
};

export default function AppLayout() {
  const { user, logout, refreshUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Refresh user stats every time the page/route changes
  useEffect(() => {
    refreshUser();
  }, [location.pathname]);

  const currentTitle = PAGE_TITLES[location.pathname] || 'Modaic ✦';

  return (
    <div className="app-bg">
      {/* Floating pixel decorations */}
      <div className="float-deco" style={{ top: '10%', right: '5%',  fontSize: 24 }}>✦</div>
      <div className="float-deco" style={{ top: '60%', right: '3%',  fontSize: 16, animationDelay: '2s' }}>♦</div>
      <div className="float-deco" style={{ top: '30%', right: '8%',  fontSize: 12, animationDelay: '1s' }}>✿</div>
      <div className="float-deco" style={{ top: '80%', right: '12%', fontSize: 20, animationDelay: '3s' }}>◆</div>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '3px solid #fce7f3', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, color: 'var(--pink-500)', textShadow: '2px 2px 0 #fbcfe8' }}>
            modaic
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--pink-300)', marginTop: 4 }}>
            ✦ AI STYLIST ✦
          </div>

          {/* User avatar */}
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, var(--pink-300), var(--lavender-mid))',
              border: '3px solid var(--pink-500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0,
            }}>
              {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👸'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--gray-700)' }}>{user?.name?.split(' ')[0]}</div>
              <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 700 }}>
                {user?.styleProfile?.primaryStyle || 'Style Explorer'}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {NAV.map(item => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        {/* Wardrobe capacity */}
        <div style={{ padding: 16, borderTop: '3px solid #fce7f3' }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-pixel)', color: 'var(--gray-400)', marginBottom: 6 }}>
            WARDROBE
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(100, (user?.stats?.totalItems || 0) / 60 * 100)}%` }}/>
          </div>
          <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 700, marginTop: 4 }}>
            {user?.stats?.totalItems || 0} / 60 items
          </div>
          <button
            onClick={logout}
            style={{ marginTop: 12, width: '100%', padding: '8px', fontFamily: 'var(--font-pixel)', fontSize: 7,
              background: 'none', border: '2px solid var(--pink-200)', color: 'var(--pink-400)', cursor: 'pointer' }}
          >
            LOG OUT
          </button>
        </div>
      </aside>

      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="top-bar">
        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ display: 'none', fontFamily: 'var(--font-pixel)', fontSize: 10, color: 'var(--pink-500)',
            padding: '6px 10px', border: '2px solid var(--pink-200)' }}
          className="mobile-menu-btn"
        >☰</button>

        <div className="page-title">{currentTitle}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-pixel)', fontSize: 8,
            color: user?.plan === 'pro' ? 'var(--lavender-dark)' : 'var(--pink-300)',
            background: 'white', border: '3px solid var(--pink-100)',
            padding: '6px 12px', boxShadow: '2px 2px 0 var(--pink-100)',
          }}>
            {user?.plan === 'pro' ? '✦ PRO' : '✦ FREE'}
          </div>
          <button className="btn-pixel" onClick={() => navigate('/wardrobe')} style={{ fontSize: 8, padding: '8px 14px' }}>
            + ADD ITEM
          </button>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(253,242,248,0.7)', zIndex: 99 }}
        />
      )}
    </div>
  );
}