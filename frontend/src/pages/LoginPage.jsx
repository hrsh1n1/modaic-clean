/**
 * modaic/frontend/src/pages/LoginPage.jsx
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import { PixelSparkle } from '../components/common/PixelIcons';

export default function LoginPage() {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(form);
    if (success) navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--pink-50)',
      backgroundImage: 'radial-gradient(circle at 20% 20%, var(--pink-100), transparent 50%), radial-gradient(circle at 80% 80%, var(--lavender), transparent 50%)',
    }}>
      {/* Pixel decorations */}
      {['✦','♦','✿','◆','✦'].map((d, i) => (
        <div key={i} className="float-deco" style={{
          top: `${10 + i * 18}%`, left: i % 2 === 0 ? `${5 + i}%` : undefined,
          right: i % 2 === 1 ? `${5 + i}%` : undefined,
          fontSize: 16 + i * 4, animationDelay: `${i * 0.7}s`,
        }}>{d}</div>
      ))}

      <div style={{ width: 'min(90vw, 400px)', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 22, color: 'var(--pink-500)', textShadow: '3px 3px 0 var(--pink-200)' }}>
            modaic
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--pink-300)', marginTop: 6 }}>
            ✦ YOUR AI STYLIST ✦
          </div>
          <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: 'var(--gray-400)' }}>
            Sign in to your wardrobe 🌸
          </div>
        </div>

        <div className="pixel-card animate-in">
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--pink-600)', marginBottom: 8 }}>
                EMAIL
              </label>
              <input
                type="email"
                className="pixel-input"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--pink-600)', marginBottom: 8 }}>
                PASSWORD
              </label>
              <input
                type="password"
                className="pixel-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>

            <button type="submit" className="btn-pixel" style={{ width: '100%', justifyContent: 'center', fontSize: 10 }} disabled={loading}>
              {loading ? <><span className="pixel-spinner" style={{ width: 16, height: 16 }}/> LOGGING IN...</> : '✦ ENTER MY CLOSET'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, fontWeight: 700, color: 'var(--gray-400)' }}>
            New here?{' '}
            <Link to="/register" style={{ color: 'var(--pink-500)', textDecoration: 'none', fontWeight: 900 }}>
              Create account 💕
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: 'var(--pink-300)', fontFamily: 'var(--font-pixel)' }}>
          ✦ STYLE IS SELF-EXPRESSION ✦
        </div>
      </div>
    </div>
  );
}
