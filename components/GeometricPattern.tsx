export default function GeometricPattern({ className = "", opacity = 0.09 }: { className?: string, opacity?: number }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* 8-pointed Islamic star tile — clean, single-element, well-spaced */}
          <pattern id="islamic-star" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            {/* Central 8-pointed star */}
            <path
              d="M40,22 L42.68,33.53 L52.73,27.27 L46.47,37.32 L58,40 L46.47,42.68 L52.73,52.73 L42.68,46.47 L40,58 L37.32,46.47 L27.27,52.73 L33.53,42.68 L22,40 L33.53,37.32 L27.27,27.27 L37.32,33.53 Z"
              fill="none"
              stroke="#1B6B3A"
              strokeWidth="1"
            />
            {/* Small diamond at each corner for tiling continuity */}
            <path d="M0,40 L4,36 L8,40 L4,44 Z" fill="none" stroke="#1B6B3A" strokeWidth="0.8" />
            <path d="M80,40 L76,36 L72,40 L76,44 Z" fill="none" stroke="#1B6B3A" strokeWidth="0.8" />
            <path d="M40,0 L36,4 L40,8 L44,4 Z" fill="none" stroke="#1B6B3A" strokeWidth="0.8" />
            <path d="M40,80 L36,76 L40,72 L44,76 Z" fill="none" stroke="#1B6B3A" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#islamic-star)" />
      </svg>
    </div>
  );
}
