/**
 * modaic/frontend/src/pages/StyleQuizPage.jsx
 * Onboarding style quiz — personalizes AI recommendations
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

const STEPS = [
  {
    id: 'primaryStyle',
    title: 'WHAT IS YOUR STYLE?',
    subtitle: 'Choose the aesthetic that speaks to you most 💕',
    type: 'single',
    options: [
      { val: 'romantic', label: '🌸 Romantic', desc: 'Flowy, feminine, soft pastels' },
      { val: 'casual', label: '✌️ Casual', desc: 'Comfy, effortless, laid-back' },
      { val: 'minimalist', label: '◽ Minimalist', desc: 'Clean, simple, neutral tones' },
      { val: 'bold', label: '🔥 Bold', desc: 'Statement pieces, vibrant colors' },
      { val: 'vintage', label: '🎞 Vintage', desc: 'Retro-inspired, classic cuts' },
      { val: 'streetwear', label: '🧢 Streetwear', desc: 'Urban, edgy, sporty vibes' },
    ],
  },
  {
    id: 'preferredOccasions',
    title: 'WHERE DO YOU GO?',
    subtitle: 'Select all that apply ✨',
    type: 'multi',
    options: [
      { val: 'work', label: '💼 Work / Office' },
      { val: 'casual', label: '☕ Casual Outings' },
      { val: 'formal', label: '🎉 Formal Events' },
      { val: 'date', label: '🌹 Dates' },
      { val: 'sport', label: '🏃 Gym / Sport' },
      { val: 'travel', label: '✈️ Travel' },
    ],
  },
  {
    id: 'colorPalette',
    title: 'YOUR COLOR VIBE?',
    subtitle: 'Pick your favorites 🎨',
    type: 'multi',
    options: [
      { val: 'pink', label: '🌸 Pinks' },
      { val: 'neutrals', label: '🤍 Neutrals' },
      { val: 'blue', label: '💙 Blues' },
      { val: 'earth', label: '🍂 Earth Tones' },
      { val: 'bold', label: '🔴 Bold Colors' },
      { val: 'pastels', label: '🍬 Pastels' },
      { val: 'black', label: '🖤 Monochrome' },
      { val: 'green', label: '🌿 Greens' },
    ],
  },
];

export default function StyleQuizPage() {
  const { updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const currentStep = STEPS[step];

  const toggle = (field, val, multi) => {
    setAnswers(prev => {
      if (multi) {
        const arr = prev[field] || [];
        return { ...prev, [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
      }
      return { ...prev, [field]: val };
    });
  };

  const isSelected = (field, val) => {
    const a = answers[field];
    return Array.isArray(a) ? a.includes(val) : a === val;
  };

  const canNext = () => {
    const a = answers[currentStep.id];
    if (currentStep.type === 'single') return !!a;
    return Array.isArray(a) && a.length > 0;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await authAPI.updateProfile({
        styleProfile: {
          primaryStyle: answers.primaryStyle,
          preferredOccasions: answers.preferredOccasions || [],
          colorPalette: answers.colorPalette || [],
          quizCompleted: true,
        },
      });
      updateUser({ styleProfile: { ...answers, quizCompleted: true } });
      toast.success('Style profile saved! Luna knows you now 🌸');
      navigate('/dashboard');
    } catch {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--pink-50)',
      backgroundImage: 'radial-gradient(circle at 30% 30%, var(--pink-100), transparent 50%), radial-gradient(circle at 70% 70%, var(--lavender), transparent 50%)',
    }}>
      <div style={{ width: 'min(90vw, 540px)', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, color: 'var(--pink-500)', textShadow: '2px 2px 0 var(--pink-200)', marginBottom: 8 }}>modaic</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--pink-300)' }}>✦ STYLE QUIZ ✦</div>
        </div>

        {/* Progress */}
        <div className="progress-bar" style={{ marginBottom: 24 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }}/>
        </div>
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--pink-300)', marginBottom: 24 }}>
          STEP {step + 1} OF {STEPS.length}
        </div>

        <div className="pixel-card animate-in">
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: 'var(--pink-600)', marginBottom: 8 }}>
            {currentStep.title}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-400)', marginBottom: 20 }}>
            {currentStep.subtitle}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
            {currentStep.options.map(opt => {
              const selected = isSelected(currentStep.id, opt.val);
              return (
                <button
                  key={opt.val}
                  onClick={() => toggle(currentStep.id, opt.val, currentStep.type === 'multi')}
                  style={{
                    padding: '14px 12px', border: '3px solid', textAlign: 'left', cursor: 'pointer',
                    borderColor: selected ? 'var(--pink-500)' : 'var(--pink-200)',
                    background: selected ? 'var(--pink-50)' : 'white',
                    boxShadow: selected ? 'var(--pixel-shadow)' : 'none',
                    transition: 'all 0.1s',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 13, color: selected ? 'var(--pink-600)' : 'var(--gray-700)', marginBottom: opt.desc ? 4 : 0 }}>
                    {opt.label}
                  </div>
                  {opt.desc && <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)' }}>{opt.desc}</div>}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {step > 0 && (
              <button className="btn-pixel secondary" onClick={() => setStep(s => s - 1)} style={{ fontSize: 8 }}>← BACK</button>
            )}
            <button
              className="btn-pixel"
              style={{ flex: 1, justifyContent: 'center', fontSize: 9 }}
              disabled={!canNext() || loading}
              onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : handleFinish()}
            >
              {loading ? 'SAVING...' : step < STEPS.length - 1 ? 'NEXT →' : '✦ MEET LUNA!'}
            </button>
          </div>

          <button onClick={() => navigate('/dashboard')} style={{ display: 'block', marginTop: 12, fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', width: '100%' }}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
