// Compass favicon — rendered as a 32x32 SVG icon by Next.js's icon convention.
// Auto-served at /icon.png and referenced from <link rel="icon">.
import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1a1614',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20%',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f5f1ea" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2 L14 11 L12 12 L10 11 Z" fill="#d44a1c" stroke="none" />
          <circle cx="12" cy="12" r="1.2" fill="#f5f1ea" stroke="none" />
        </svg>
      </div>
    ),
    size,
  );
}
