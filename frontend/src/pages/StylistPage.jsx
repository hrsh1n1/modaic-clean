/**
 * modaic/frontend/src/pages/StylistPage.jsx
 * AI chat with Luna — Gemini powered
 */

import { useState, useRef, useEffect } from 'react';
import { stylistAPI } from '../services/api';
import { PixelBot } from '../components/common/PixelIcons';

const SUGGESTIONS = [
  'What should I wear to a coffee date?',
  'Help me create a capsule wardrobe',
  'What colors suit me best?',
  'Give me an outfit for a job interview',
  'How do I style oversized pieces?',
];

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 16px', background: 'white', border: '3px solid var(--pink-200)', width: 'fit-content', boxShadow: '3px 3px 0 var(--pink-200)' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, background: 'var(--pink-400)',
          animation: 'blink 1s step-start infinite',
          animationDelay: `${i * 0.3}s`,
        }}/>
      ))}
    </div>
  );
}

export default function StylistPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Luna, your personal AI fashion stylist 🌸✨ I know your wardrobe and I'm here to help you style amazing outfits. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const message = text || input.trim();
    if (!message || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setLoading(true);

    try {
      const res = await stylistAPI.chat({ message, sessionId });
      const { response, sessionId: sid } = res.data.data;
      if (!sessionId) setSessionId(sid);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a moment! ✨ Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Luna header */}
      <div className="pixel-card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, var(--pink-50), var(--lavender))' }}>
        <div style={{
          width: 56, height: 56,
          background: 'linear-gradient(135deg, var(--pink-400), var(--lavender-dark))',
          border: '4px solid var(--pink-500)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, flexShrink: 0,
        }}>🤖</div>
        <div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: 'var(--pink-600)', marginBottom: 4 }}>LUNA — AI STYLIST</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)' }}>
            Powered by Gemini AI ✦ Knows your wardrobe ✦ Always stylish
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <span className="badge mint">ONLINE</span>
            <span className="badge pink">FREE TIER</span>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0',
        paddingRight: 4,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 28, height: 28, background: 'var(--pink-400)', border: '2px solid var(--pink-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }}>
                🤖
              </div>
            )}
            <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: 'var(--pink-400)', border: '2px solid var(--pink-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12, marginBottom: 8 }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => sendMessage(s)} style={{
              fontFamily: 'var(--font-pixel)', fontSize: 6, padding: '6px 10px',
              border: '2px solid var(--pink-200)', background: 'white', color: 'var(--pink-500)',
              cursor: 'pointer', transition: 'all 0.1s',
            }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, marginTop: 12, background: 'white', border: '3px solid var(--pink-300)', boxShadow: 'var(--pixel-shadow)', padding: 10 }}>
        <input
          type="text"
          className="pixel-input"
          placeholder="Ask Luna anything about style... 🌸"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          disabled={loading}
          style={{ flex: 1, border: 'none', background: 'transparent', boxShadow: 'none' }}
        />
        <button
          className="btn-pixel"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{ fontSize: 8, padding: '8px 16px', flexShrink: 0 }}
        >
          {loading ? '...' : 'SEND ✦'}
        </button>
      </div>
    </div>
  );
}
