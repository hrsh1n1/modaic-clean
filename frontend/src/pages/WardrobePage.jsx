/**
 * modaic/frontend/src/pages/WardrobePage.jsx
 * Full wardrobe management — grid view, filters, add item modal
 */

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { wardrobeAPI } from '../services/api';

const CATEGORIES = ['all', 'tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'activewear'];

const CATEGORY_ICONS = {
  tops: '👕', bottoms: '👖', dresses: '👗', outerwear: '🧥', shoes: '👟', accessories: '💍', activewear: '🩱', all: '✦',
};

function AddItemModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', category: 'tops', brand: '', purchasePrice: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      setPreview(URL.createObjectURL(accepted[0]));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please upload an image! 📸'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      await wardrobeAPI.addItem(formData);
      toast.success('Item added to your wardrobe! 👗');
      onAdded();
      onClose();
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: 'var(--pink-600)' }}>ADD NEW ITEM</div>
          <button onClick={onClose} style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, color: 'var(--gray-400)', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Image upload */}
          <div {...getRootProps()} style={{
            border: `3px dashed ${isDragActive ? 'var(--pink-500)' : 'var(--pink-200)'}`,
            background: isDragActive ? 'var(--pink-50)' : 'white',
            padding: preview ? 0 : 32, textAlign: 'center', cursor: 'pointer',
            marginBottom: 16, transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
          }}>
            <input {...getInputProps()} />
            {preview ? (
              <>
                <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }} />
                <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
                  <span className="badge pink">✓ IMAGE READY</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--pink-400)', marginBottom: 4 }}>
                  DROP PHOTO HERE
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)' }}>or click to browse</div>
              </>
            )}
          </div>

          {/* Form fields */}
          {[
            { key: 'name', label: 'ITEM NAME', type: 'text', placeholder: 'Floral Silk Blouse', required: true },
            { key: 'brand', label: 'BRAND', type: 'text', placeholder: 'H&M, Zara, etc.' },
            { key: 'purchasePrice', label: 'PURCHASE PRICE (₹)', type: 'number', placeholder: '1500' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--pink-600)', marginBottom: 6 }}>{f.label}</label>
              <input
                type={f.type} className="pixel-input" placeholder={f.placeholder}
                value={form[f.key]} required={f.required}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              />
            </div>
          ))}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--pink-600)', marginBottom: 6 }}>CATEGORY</label>
            <select className="pixel-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn-pixel secondary" onClick={onClose} style={{ flex: 1, fontSize: 8, justifyContent: 'center' }}>
              CANCEL
            </button>
            <button type="submit" className="btn-pixel" style={{ flex: 2, fontSize: 8, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'SAVING...' : '✦ ADD TO WARDROBE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WardrobePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      const res = await wardrobeAPI.getItems(params);
      setItems(res.data.data);
      setTotal(res.data.meta?.total || 0);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id) => {
    if (!confirm('Remove this item from your wardrobe?')) return;
    await wardrobeAPI.deleteItem(id);
    toast.success('Item removed 🗑️');
    fetchItems();
  };

  const handleWear = async (id, e) => {
    e.stopPropagation();
    await wardrobeAPI.recordWear(id);
    toast.success('Wear recorded! 🌸');
    fetchItems();
  };

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)' }}>{total} items total</div>
        </div>
        <button className="btn-pixel" onClick={() => setShowModal(true)} style={{ fontSize: 8 }}>
          + ADD ITEM
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text" className="pixel-input" placeholder="🔍 Search your wardrobe..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 340 }}
        />
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              fontFamily: 'var(--font-pixel)', fontSize: 7, padding: '7px 12px',
              border: '3px solid',
              borderColor: category === cat ? 'var(--pink-500)' : 'var(--pink-200)',
              background: category === cat ? 'var(--pink-500)' : 'white',
              color: category === cat ? 'white' : 'var(--pink-500)',
              boxShadow: category === cat ? 'var(--pixel-shadow)' : 'none',
              cursor: 'pointer', transition: 'all 0.1s',
            }}
          >
            {CATEGORY_ICONS[cat]} {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Items grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="pixel-spinner" style={{ margin: '0 auto 12px' }}/>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: 'var(--pink-300)' }}>LOADING YOUR CLOSET...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="pixel-card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: 'var(--pink-500)', marginBottom: 8 }}>
            {search || category !== 'all' ? 'NO ITEMS FOUND' : 'YOUR CLOSET IS EMPTY'}
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', marginBottom: 16 }}>
            {search ? `Try a different search term` : 'Start adding items to build your digital wardrobe!'}
          </p>
          {!search && <button className="btn-pixel" onClick={() => setShowModal(true)} style={{ fontSize: 8 }}>+ ADD FIRST ITEM</button>}
        </div>
      ) : (
        <div className="grid-auto">
          {items.map(item => (
            <div key={item._id} className="clothing-card">
              <div style={{ position: 'relative' }}>
                <img
                  src={item.imageUrl} alt={item.name}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.src = ''; e.target.style.display = 'none'; }}
                />
                {item.isFavorite && (
                  <div style={{ position: 'absolute', top: 6, right: 6, background: 'var(--pink-500)', border: '2px solid white', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ♥
                  </div>
                )}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--gray-700)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 700 }}>{item.category}</span>
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 7, color: 'var(--pink-400)' }}>×{item.wearCount}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="btn-pixel secondary" style={{ flex: 1, fontSize: 6, padding: '5px 6px', justifyContent: 'center' }}
                    onClick={e => handleWear(item._id, e)}
                  >
                    WORE IT
                  </button>
                  <button
                    style={{ padding: '5px 8px', border: '2px solid var(--pink-200)', background: 'white', color: 'var(--gray-400)', fontSize: 11, cursor: 'pointer' }}
                    onClick={() => handleDelete(item._id)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <AddItemModal onClose={() => setShowModal(false)} onAdded={fetchItems} />}
    </div>
  );
}
