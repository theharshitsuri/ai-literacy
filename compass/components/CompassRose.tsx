// The hero compass rose. Used on the landing page and (later) on the result
// page where the needle rotates to point at the user's actual level position.
//
// Props:
//   theta — 0–100 skill estimate. 0 → west (Newcomer), 100 → north (Ready).
//           Used on the result page; landing page leaves it undefined so the
//           needle just drifts subtly via CSS animation.
//   animated — when true, applies the drift animation (default).

type Props = {
  theta?: number;
  animated?: boolean;
  size?: number;
  highlight?: 'newcomer' | 'curious' | 'user' | 'ready';
};

export function CompassRose({ theta, animated = true, size = 460, highlight }: Props) {
  // Map theta (0–100) to a needle angle in degrees.
  // 0   → 270° (west)        Newcomer
  // 33  → 180° (south)       Curious
  // 66  → 90°  (east)        User
  // 100 → 0°   (north)       Ready
  //
  // We use a piecewise linear path through W→S→E→N going the long way around.
  let needleDeg: number | undefined;
  if (typeof theta === 'number') {
    // theta 0→100 maps along W → S → E → N, i.e. 270→180→90→0 going counter-clockwise,
    // which in CSS terms is -90° to -360° via 180°, 90°, 0°.
    // Simpler: just interpolate on the full circle.
    needleDeg = 270 - (theta / 100) * 270; // 0→270, 100→0
  }

  const active = (k: string) => highlight === k ? 'fill-accent font-semibold' : 'fill-ink-2';

  return (
    <svg
      viewBox="0 0 460 460"
      width="100%"
      style={{ maxWidth: size }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="rose-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5f1ea" />
          <stop offset="90%" stopColor="#ebe6dd" />
        </radialGradient>
      </defs>

      <g className={animated ? 'compass-rose-anim' : ''}>
        {/* rings */}
        <circle cx="230" cy="230" r="220" fill="url(#rose-bg)" stroke="#1a1614" strokeWidth="1.5" />
        <circle cx="230" cy="230" r="195" fill="none" stroke="#d8d2c4" strokeWidth="1" />
        <circle cx="230" cy="230" r="160" fill="none" stroke="#d8d2c4" strokeWidth="1" />
        <circle cx="230" cy="230" r="115" fill="none" stroke="#d8d2c4" strokeWidth="0.75" />

        {/* tick marks at cardinals */}
        <g stroke="#857e6f" strokeWidth="0.75">
          <line x1="230" y1="35"  x2="230" y2="48" />
          <line x1="230" y1="412" x2="230" y2="425" />
          <line x1="35"  y1="230" x2="48"  y2="230" />
          <line x1="412" y1="230" x2="425" y2="230" />
          <line x1="83"  y1="83"  x2="93"  y2="93" />
          <line x1="377" y1="83"  x2="367" y2="93" />
          <line x1="83"  y1="377" x2="93"  y2="367" />
          <line x1="377" y1="377" x2="367" y2="367" />
        </g>

        {/* cardinal level labels */}
        <text x="230" y="28"  textAnchor="middle" className={`font-mono ${active('ready')}`} style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' }}>N · Ready</text>
        <text x="436" y="234" textAnchor="middle" className={`font-mono ${active('user')}`}  style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' }}>E · User</text>
        <text x="230" y="448" textAnchor="middle" className={`font-mono ${active('curious')}`} style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' }}>S · Curious</text>
        <text x="24"  y="234" textAnchor="middle" className={`font-mono ${active('newcomer')}`} style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' }}>W · Newcomer</text>

        {/* compass star */}
        <g>
          <polygon points="230,80 240,230 230,380 220,230" fill="#1a1614" />
          <polygon points="230,80 230,230 220,230" fill="#4a423a" />
          <polygon points="80,230 230,220 380,230 230,240" fill="#d44a1c" opacity="0.85" />
          <polygon points="80,230 230,230 230,220" fill="#b03c14" />
          <circle cx="230" cy="230" r="9" fill="#1a1614" stroke="#f5f1ea" strokeWidth="2" />
          <circle cx="230" cy="230" r="3" fill="#f5f1ea" />
        </g>
      </g>

      {/* needle — drifts on the landing page, snaps to theta on the result page */}
      <g
        className={needleDeg === undefined && animated ? 'needle-anim' : ''}
        style={needleDeg !== undefined ? { transform: `rotate(${needleDeg}deg)`, transformOrigin: '50% 50%', transition: 'transform .8s cubic-bezier(0.2, 0.8, 0.2, 1)' } : undefined}
      >
        <line x1="230" y1="230" x2="230" y2="105" stroke="#d44a1c" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="230,95 224,108 236,108" fill="#d44a1c" />
      </g>
    </svg>
  );
}
