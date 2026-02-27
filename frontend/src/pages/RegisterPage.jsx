/**
 * modaic/frontend/src/pages/RegisterPage.jsx
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../context/authStore';

export default function RegisterPage() {
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(form);
    if (success) navigate('/style-quiz');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--pink-50)',
      backgroundImage: 'radial-gradient(circle at 80% 20%, var(--lavender), transparent 50%), radial-gradient(circle at 20% 80%, var(--pink-100), transparent 50%)',
    }}>
      {['✦','♦','✿'].map((d, i) => (
        <div key={i} className="float-deco" style={{ top: `${15 + i * 25}%`, right: `${5 + i * 3}%`, fontSize: 18, animationDelay: `${i * 1}s` }}>{d}</div>
      ))}

      <div style={{ width: 'min(90vw, 420px)', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 22, color: 'var(--pink-500)', textShadow: '3px 3px 0 var(--pink-200)' }}>modaic</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--pink-300)', marginTop: 6 }}>✦ CREATE ACCOUNT ✦</div>
        </div>

        <div className="pixel-card animate-in">
          <form onSubmit={handleSubmit}>
            {[
              { key: 'name', label: 'YOUR NAME', type: 'text', placeholder: 'Priya K.' },
              { key: 'email', label: 'EMAIL', type: 'email', placeholder: 'your@email.com' },
              { key: 'password', label: 'PASSWORD', type: 'password', placeholder: 'min 6 characters' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--pink-600)', marginBottom: 8 }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  className="pixel-input"
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                  required
                  minLength={field.key === 'password' ? 6 : undefined}
                />
              </div>
            ))}

            <div style={{ background: 'var(--pink-50)', border: '2px solid var(--pink-200)', padding: 12, marginBottom: 20, fontSize: 11, fontWeight: 700, color: 'var(--gray-400)' }}>
              🌸 After signing up you'll take a quick style quiz so your AI stylist can get to know you!
            </div>

            <button type="submit" className="btn-pixel" style={{ width: '100%', justifyContent: 'center', fontSize: 10 }} disabled={loading}>
              {loading ? 'CREATING...' : '✦ JOIN MODAIC'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, fontWeight: 700, color: 'var(--gray-400)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--pink-500)', textDecoration: 'none', fontWeight: 900 }}>Sign in 💕</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
