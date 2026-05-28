// Dynamic OG image — what shows up when Compass links are shared in
// Slack, Twitter, Discord, iMessage. Rendered at build time as a static
// 1200x630 PNG and served from /opengraph-image.
import { ImageResponse } from 'next/og';

export const alt = 'Compass — find your bearing in AI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#f5f1ea',
          color: '#1a1614',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* brand mark in corner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1a1614" strokeWidth="1.4">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2 L14 11 L12 12 L10 11 Z" fill="#1a1614" stroke="none" />
            <circle cx="12" cy="12" r="1.2" fill="#1a1614" stroke="none" />
          </svg>
          <span style={{ fontSize: '32px', fontWeight: 500 }}>
            Compass<span style={{ color: '#d44a1c' }}>.</span>
          </span>
        </div>

        {/* big headline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: '20px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#857e6f',
            marginBottom: '20px',
          }}>
            · AI literacy + a feed tuned to you ·
          </div>
          <div style={{ fontSize: '110px', lineHeight: 0.98, letterSpacing: '-0.03em', marginBottom: '8px', display: 'flex' }}>
            Find your <span style={{ fontStyle: 'italic', color: '#d44a1c', marginLeft: '20px' }}>bearing</span>
          </div>
          <div style={{ fontSize: '110px', lineHeight: 0.98, letterSpacing: '-0.03em' }}>in AI.</div>
        </div>

        {/* compass rose, right side */}
        <div style={{ position: 'absolute', right: '60px', bottom: '60px', display: 'flex' }}>
          <svg width="320" height="320" viewBox="0 0 460 460" xmlns="http://www.w3.org/2000/svg">
            <circle cx="230" cy="230" r="220" fill="#ebe6dd" stroke="#1a1614" strokeWidth="1.5" />
            <circle cx="230" cy="230" r="160" fill="none" stroke="#d8d2c4" strokeWidth="1" />
            <polygon points="230,80 240,230 230,380 220,230" fill="#1a1614" />
            <polygon points="230,80 230,230 220,230" fill="#4a423a" />
            <polygon points="80,230 230,220 380,230 230,240" fill="#d44a1c" />
            <polygon points="80,230 230,230 230,220" fill="#b03c14" />
            <circle cx="230" cy="230" r="9" fill="#1a1614" stroke="#f5f1ea" strokeWidth="2" />
            <line x1="230" y1="230" x2="230" y2="105" stroke="#d44a1c" strokeWidth="3" strokeLinecap="round" />
            <polygon points="230,95 224,108 236,108" fill="#d44a1c" />
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
