interface LifelineLogoProps {
  width?: number;
  height?: number;
  className?: string;
  /** Show just the mark (no wordmark) */
  markOnly?: boolean;
  /** Light mode — strands stay colorful, wordmark goes dark */
  light?: boolean;
}

/**
 * Lifeline Medical Education logo — recreated as inline SVG.
 * The mark is a stylized neural-network tree: many colorful strands
 * interweave and converge to a single green downward arrow, symbolising
 * knowledge flowing to action.
 */
export function LifelineLogo({
  width,
  height,
  className = "",
  markOnly = false,
  light = false,
}: LifelineLogoProps) {
  if (markOnly) {
    return (
      <svg
        viewBox="0 0 100 130"
        width={width ?? 48}
        height={height ?? 62}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <LogoStrands />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 340 130"
      width={width ?? 220}
      height={height ?? 84}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* Mark */}
      <g transform="translate(0, 0)">
        <LogoStrands />
      </g>

      {/* Wordmark */}
      <g transform="translate(112, 24)">
        {/* LIFELINE */}
        <text
          x="0"
          y="44"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="900"
          fontSize="46"
          letterSpacing="-1"
          fill={light ? "#0a0d14" : "#ffffff"}
        >
          LIFELINE
        </text>
        {/* MEDICAL EDUCATION */}
        <text
          x="2"
          y="66"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="500"
          fontSize="14"
          letterSpacing="4"
          fill={light ? "#374151" : "rgba(255,255,255,0.55)"}
        >
          MEDICAL EDUCATION
        </text>
      </g>
    </svg>
  );
}

/** The neural-strand tree mark — shared between both variants */
function LogoStrands() {
  // Each strand: [path, color, strokeWidth]
  // All paths start from convergence point (50, 88) and fan upward.
  // Some have S-curves so they visually cross each other — matching the logo.
  const strands: [string, string, number][] = [
    // Far-left — lime green, sweeps from right then hard left
    ["M 50 88 C 68 68, 14 38, 4 2", "#a3e635", 2.8],
    // Left — yellow-green, gentle left arc
    ["M 50 88 C 60 65, 22 34, 15 2", "#84cc16", 2.2],
    // Center-left — green, crosses lime
    ["M 50 88 C 55 62, 32 30, 24 2", "#4ade80", 2.6],
    // Left-of-center — teal, S-curve crossing green
    ["M 50 88 C 64 60, 28 24, 34 2", "#2dd4bf", 2.0],
    // Slight-left — blue
    ["M 50 88 C 52 62, 42 28, 43 2", "#60a5fa", 2.4],
    // Center — purple, nearly straight
    ["M 50 88 C 50 62, 50 28, 50 2", "#a78bfa", 2.0],
    // Slight-right — orange, S-curve
    ["M 50 88 C 48 62, 58 28, 57 2", "#fb923c", 2.4],
    // Right-of-center — coral red, crosses orange
    ["M 50 88 C 36 60, 72 24, 66 2", "#f87171", 2.0],
    // Right — hot pink, gentle right arc
    ["M 50 88 C 45 62, 68 30, 76 2", "#f472b6", 2.6],
    // Center-right — violet, sweeps from left then hard right
    ["M 50 88 C 40 65, 78 34, 85 2", "#c084fc", 2.2],
    // Far-right — sky blue, sweeps from left then hard right
    ["M 50 88 C 32 68, 86 38, 96 2", "#38bdf8", 2.8],
  ];

  return (
    <>
      <defs>
        <filter id="ll-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ll-arrow-glow" x="-60%" y="-20%" width="220%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Strands */}
      {strands.map(([d, color, sw], i) => (
        <path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          filter="url(#ll-glow)"
          opacity={0.92}
        />
      ))}

      {/* Stem leading to arrow */}
      <line
        x1="50" y1="88"
        x2="50" y2="108"
        stroke="#22c55e"
        strokeWidth="5"
        strokeLinecap="round"
        filter="url(#ll-arrow-glow)"
      />

      {/* Arrowhead */}
      <polygon
        points="50,128 40,106 60,106"
        fill="#22c55e"
        filter="url(#ll-arrow-glow)"
      />
    </>
  );
}

export default LifelineLogo;
