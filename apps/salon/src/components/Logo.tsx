export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="url(#logoGrad)" />

      {/* Scissors */}
      <g transform="translate(50, 50) rotate(-30) translate(-50, -50)">
        {/* Left blade */}
        <ellipse cx="38" cy="58" rx="8" ry="18" fill="white" opacity="0.9" />
        <circle cx="38" cy="68" r="5" fill="none" stroke="white" strokeWidth="2" />
        {/* Right blade */}
        <ellipse cx="62" cy="58" rx="8" ry="18" fill="white" opacity="0.9" />
        <circle cx="62" cy="68" r="5" fill="none" stroke="white" strokeWidth="2" />
        {/* Pivot */}
        <circle cx="50" cy="52" r="3" fill="white" />
      </g>

      {/* H letter */}
      <text
        x="50"
        y="44"
        textAnchor="middle"
        fontFamily="serif"
        fontWeight="bold"
        fontSize="32"
        fill="white"
        opacity="0.95"
      >
        H
      </text>

      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
      </defs>
    </svg>
  );
}
