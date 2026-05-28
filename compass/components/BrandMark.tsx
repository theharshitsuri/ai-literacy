// Compass brand mark — a minimal compass rose icon used in the nav.
// The size prop is in pixels; defaults to 22 to fit nav line-height.
export function BrandMark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      {/* North arrow (filled) */}
      <path d="M12 2 L14 11 L12 12 L10 11 Z" fill="currentColor" stroke="none" />
      {/* South arrow (outline) */}
      <path d="M12 22 L10 13 L12 12 L14 13 Z" fill="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BrandWordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const px = size === 'sm' ? 18 : size === 'lg' ? 26 : 20;
  return (
    <span className="flex items-center gap-[10px] font-serif font-medium tracking-tight" style={{ fontSize: px }}>
      <BrandMark size={px + 2} />
      <span>
        Compass<span className="text-accent">.</span>
      </span>
    </span>
  );
}
