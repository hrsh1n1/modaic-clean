/**
 * modaic/frontend/src/pages/OutfitBuilderPage.jsx
 * AI-powered outfit generator + manual builder
 */

import { useState, useEffect } from 'react';
import { stylistAPI, wardrobeAPI, outfitAPI } from '../services/api';
import toast from 'react-hot-toast';

const OCCASIONS = ['casual', 'work', 'formal', 'date', 'sport', 'beach', 'party', 'travel'];
const SEASONS   = ['spring', 'summer', 'autumn', 'winter'];
const MOODS     = ['confident', 'romantic', 'professional', 'playful', 'minimalist', 'bold'];

export default function OutfitBuilderPage() {
  const [mode, setMode] = useState('ai'); // 'ai' | 'manual'
  const [occasion, setOccasion] = useState('casual');
  const [season, setSeason] = useState('');
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    wardrobeAPI.getItems({ limit: 50 }).then(res => setWardrobeItems(res.data.data)).catch(() => {});
  }, []);

  const generateOutfits = async () => {
    setLoading(true);
    setOutfits([]);
    try {
      const res = await stylistAPI.generateOutfits({ occasion, season, mood });
      setOutfits(res.data.data.outfits);
    } finally {
      setLoading(false);
    }
  };

  const saveOutfit = async (outfit) => {
    try {
      await outfitAPI.saveOutfit({
        name: outfit.name,
        occasion,
        season,
        aiGenerated: true,
        aiStyleNotes: outfit.tip,
      });
      toast.success('Outfit saved! 💕');
    } catch {}
  };

  const toggleItemSelect = (item) => {
    setSelectedItems(prev =>
      prev.find(i => i._id === item._id)
        ? prev.filter(i => i._id !== item._id)
        : [...prev, item]
    );
  };

  return (
    <div className="animate-in">
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, border: '3px solid var(--pink-300)', width: 'fit-content' }}>
        {[['ai', '🤖 AI GENERATE'], ['manual', '✦ MANUAL BUILD']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            fontFamily: 'var(--font-pixel)', fontSize: 8, padding: '10px 20px',
            background: mode === m ? 'var(--pink-500)' : 'white',
            color: mode === m ? 'white' : 'var(--pink-400)',
            border: 'none', cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      {mode === 'ai' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
          {/* Config panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="pixel-card">
              <div className="section-title">BUILD CONTEXT</div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--pink-600)', marginBottom: 8 }}>OCCASION</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {OCCASIONS.map(o => (
                    <button key={o} onClick={() => setOccasion(o)} style={{
                      fontFamily: 'var(--font-pixel)', fontSize: 6, padding: '5px 8px',
                      border: '2px solid', borderColor: occasion === o ? 'var(--pink-500)' : 'var(--pink-200)',
                      background: occasion === o ? 'var(--pink-500)' : 'white',
                      color: occasion === o ? 'white' : 'var(--gray-500)', cursor: 'pointer',
                    }}>{o}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--pink-600)', marginBottom: 8 }}>SEASON</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {SEASONS.map(s => (
                    <button key={s} onClick={() => setSeason(season === s ? '' : s)} style={{
                      fontFamily: 'var(--font-pixel)', fontSize: 6, padding: '5px 8px',
                      border: '2px solid', borderColor: season === s ? 'var(--lavender-dark)' : 'var(--pink-200)',
                      background: season === s ? 'var(--lavender-dark)' : 'white',
                      color: season === s ? 'white' : 'var(--gray-500)', cursor: 'pointer',
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--pink-600)', marginBottom: 8 }}>VIBE</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {MOODS.map(m => (
                    <button key={m} onClick={() => setMood(mood === m ? '' : m)} style={{
                      fontFamily: 'var(--font-pixel)', fontSize: 6, padding: '5px 8px',
                      border: '2px solid', borderColor: mood === m ? '#34d399' : 'var(--pink-200)',
                      background: mood === m ? '#d1fae5' : 'white',
                      color: mood === m ? '#065f46' : 'var(--gray-500)', cursor: 'pointer',
                    }}>{m}</button>
                  ))}
                </div>
              </div>

              <button className="btn-pixel" onClick={generateOutfits} disabled={loading} style={{ width: '100%', justifyContent: 'center', fontSize: 9 }}>
                {loading ? (
                  <><span className="pixel-spinner" style={{ width: 14, height: 14 }}/> LUNA IS THINKING...</>
                ) : '✦ GENERATE OUTFITS'}
              </button>
            </div>

            {wardrobeItems.length === 0 && (
              <div className="pixel-card" style={{ background: 'var(--pink-50)', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>👗</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--pink-400)' }}>Add wardrobe items first!</div>
              </div>
            )}
          </div>

          {/* Results */}
          <div>
            {loading && (
              <div className="pixel-card" style={{ textAlign: 'center', padding: 60 }}>
                <div className="pixel-spinner" style={{ margin: '0 auto 16px' }}/>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--pink-400)' }}>LUNA IS STYLING YOU...</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', marginTop: 8 }}>This takes a few seconds ✨</div>
              </div>
            )}

            {!loading && outfits.length === 0 && (
              <div className="pixel-card" style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✨</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--pink-300)' }}>READY TO CREATE MAGIC</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', marginTop: 8 }}>Set your context and hit Generate!</div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {outfits.map((outfit, i) => (
                <div key={i} className="pixel-card animate-in" style={{ borderColor: i === 0 ? 'var(--pink-500)' : 'var(--pink-200)' }}>
                  {i === 0 && <div className="badge pink" style={{ marginBottom: 10 }}>✦ BEST PICK</div>}
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: 'var(--pink-700)', marginBottom: 12 }}>
                    {outfit.name}
                  </div>

                  {/* Items list */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {outfit.items?.map((item, j) => (
                      <span key={j} className="badge lavender">{item}</span>
                    ))}
                  </div>

                  <div style={{ background: 'var(--pink-50)', border: '2px solid var(--pink-100)', padding: 10, marginBottom: 12 }}>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--pink-500)', marginBottom: 4 }}>LUNA'S TIP</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', lineHeight: 1.5 }}>{outfit.tip}</div>
                  </div>

                  {outfit.accessory && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', marginBottom: 12 }}>
                      💍 Accessory: {outfit.accessory}
                    </div>
                  )}

                  <button className="btn-pixel secondary" onClick={() => saveOutfit(outfit)} style={{ fontSize: 7, padding: '7px 12px' }}>
                    ♥ SAVE OUTFIT
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Manual builder */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          <div>
            <div className="section-title">PICK ITEMS</div>
            <div className="grid-auto">
              {wardrobeItems.map(item => {
                const selected = selectedItems.find(i => i._id === item._id);
                return (
                  <div
                    key={item._id}
                    className="clothing-card"
                    onClick={() => toggleItemSelect(item)}
                    style={{ border: selected ? '3px solid var(--pink-500)' : undefined, boxShadow: selected ? 'var(--pixel-shadow)' : undefined }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}/>
                      {selected && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(236,72,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>✓</div>
                      )}
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: 800, fontSize: 11, color: 'var(--gray-700)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outfit preview */}
          <div>
            <div className="pixel-card" style={{ position: 'sticky', top: 80 }}>
              <div className="section-title">YOUR OUTFIT</div>
              {selectedItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)', fontSize: 12, fontWeight: 700 }}>
                  Click items to add them 👆
                </div>
              ) : (
                <>
                  {selectedItems.map(item => (
                    <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '8px', background: 'var(--pink-50)', border: '2px solid var(--pink-100)' }}>
                      <img src={item.imageUrl} alt={item.name} style={{ width: 40, height: 40, objectFit: 'cover', border: '2px solid var(--pink-200)' }}/>
                      <div style={{ flex: 1, fontSize: 11, fontWeight: 800, color: 'var(--gray-700)' }}>{item.name}</div>
                      <button onClick={() => toggleItemSelect(item)} style={{ color: 'var(--gray-400)', fontSize: 16, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                    </div>
                  ))}
                  <button
                    className="btn-pixel" style={{ width: '100%', justifyContent: 'center', fontSize: 8, marginTop: 12 }}
                    onClick={async () => {
                      await outfitAPI.saveOutfit({ name: 'My Outfit', items: selectedItems.map(i => ({ itemId: i._id })) });
                      toast.success('Outfit saved! 💕');
                      setSelectedItems([]);
                    }}
                  >
                    ♥ SAVE OUTFIT
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
