/**
 * modaic/frontend/src/components/common/PixelIcons.jsx
 * SVG-based pixel art icons — all hand-crafted
 */

export const PixelHanger = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
    <rect x="3" y="0" width="2" height="1" fill={color}/>
    <rect x="2" y="1" width="1" height="1" fill={color}/>
    <rect x="4" y="1" width="1" height="1" fill={color}/>
    <rect x="1" y="2" width="6" height="1" fill={color}/>
    <rect x="0" y="3" width="1" height="1" fill={color}/>
    <rect x="7" y="3" width="1" height="1" fill={color}/>
    <rect x="1" y="4" width="1" height="2" fill={color}/>
    <rect x="6" y="4" width="1" height="2" fill={color}/>
    <rect x="1" y="6" width="6" height="1" fill={color}/>
  </svg>
);

export const PixelHeart = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
    <rect x="1" y="1" width="2" height="1" fill={color}/>
    <rect x="5" y="1" width="2" height="1" fill={color}/>
    <rect x="0" y="2" width="3" height="1" fill={color}/>
    <rect x="5" y="2" width="3" height="1" fill={color}/>
    <rect x="0" y="3" width="8" height="2" fill={color}/>
    <rect x="1" y="5" width="6" height="1" fill={color}/>
    <rect x="2" y="6" width="4" height="1" fill={color}/>
    <rect x="3" y="7" width="2" height="1" fill={color}/>
  </svg>
);

export const PixelStar = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
    <rect x="3" y="0" width="2" height="1" fill={color}/>
    <rect x="3" y="1" width="2" height="1" fill={color}/>
    <rect x="0" y="3" width="8" height="2" fill={color}/>
    <rect x="1" y="2" width="6" height="1" fill={color}/>
    <rect x="2" y="6" width="1" height="1" fill={color}/>
    <rect x="5" y="6" width="1" height="1" fill={color}/>
    <rect x="1" y="7" width="2" height="1" fill={color}/>
    <rect x="5" y="7" width="2" height="1" fill={color}/>
  </svg>
);

export const PixelSparkle = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
    <rect x="3" y="0" width="2" height="2" fill={color}/>
    <rect x="3" y="6" width="2" height="2" fill={color}/>
    <rect x="0" y="3" width="2" height="2" fill={color}/>
    <rect x="6" y="3" width="2" height="2" fill={color}/>
    <rect x="1" y="1" width="1" height="1" fill={color}/>
    <rect x="6" y="1" width="1" height="1" fill={color}/>
    <rect x="1" y="6" width="1" height="1" fill={color}/>
    <rect x="6" y="6" width="1" height="1" fill={color}/>
  </svg>
);

export const PixelDress = ({ size = 48 }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 10 12" style={{ imageRendering: 'pixelated' }}>
    <rect x="3" y="0" width="4" height="1" fill="#f9a8d4"/>
    <rect x="2" y="1" width="6" height="2" fill="#f9a8d4"/>
    <rect x="1" y="3" width="8" height="1" fill="#ec4899"/>
    <rect x="0" y="4" width="10" height="5" fill="#f9a8d4"/>
    <rect x="0" y="9" width="4" height="3" fill="#fce7f3"/>
    <rect x="6" y="9" width="4" height="3" fill="#fce7f3"/>
    <rect x="1" y="5" width="2" height="1" fill="#fbcfe8"/>
    <rect x="7" y="5" width="2" height="1" fill="#fbcfe8"/>
  </svg>
);

export const PixelShirt = ({ size = 40 }) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 10 9" style={{ imageRendering: 'pixelated' }}>
    <rect x="3" y="0" width="4" height="1" fill="#c4b5fd"/>
    <rect x="0" y="1" width="3" height="2" fill="#a78bfa"/>
    <rect x="7" y="1" width="3" height="2" fill="#a78bfa"/>
    <rect x="2" y="1" width="6" height="1" fill="#c4b5fd"/>
    <rect x="1" y="2" width="8" height="6" fill="#c4b5fd"/>
    <rect x="0" y="3" width="1" height="4" fill="#a78bfa"/>
    <rect x="9" y="3" width="1" height="4" fill="#a78bfa"/>
    <rect x="4" y="2" width="2" height="3" fill="#ede9fe"/>
  </svg>
);

export const PixelPants = ({ size = 36 }) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 9 10" style={{ imageRendering: 'pixelated' }}>
    <rect x="0" y="0" width="9" height="2" fill="#93c5fd"/>
    <rect x="0" y="2" width="4" height="8" fill="#60a5fa"/>
    <rect x="5" y="2" width="4" height="8" fill="#60a5fa"/>
    <rect x="4" y="2" width="1" height="6" fill="#93c5fd"/>
    <rect x="1" y="1" width="7" height="1" fill="#bfdbfe"/>
  </svg>
);

export const PixelBot = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" style={{ imageRendering: 'pixelated' }}>
    <rect x="1" y="0" width="8" height="1" fill="#f9a8d4"/>
    <rect x="0" y="1" width="10" height="7" fill="#ec4899"/>
    <rect x="1" y="2" width="2" height="2" fill="white"/>
    <rect x="7" y="2" width="2" height="2" fill="white"/>
    <rect x="2" y="3" width="1" height="1" fill="#be185d"/>
    <rect x="8" y="3" width="1" height="1" fill="#be185d"/>
    <rect x="3" y="5" width="4" height="2" fill="#fbcfe8"/>
    <rect x="4" y="5" width="2" height="1" fill="#fce7f3"/>
    <rect x="0" y="8" width="10" height="2" fill="#f9a8d4"/>
    <rect x="3" y="0" width="1" height="1" fill="white"/>
    <rect x="6" y="0" width="1" height="1" fill="white"/>
    <rect x="4" y="-1" width="2" height="1" fill="#ec4899"/>
  </svg>
);
