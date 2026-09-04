// Decorative waypoint trail — the six MVP tracks laid out as stops on a
// path, echoing the product's core metaphor. Purely illustrative.
const TRACKS = [
  "Frontend",
  "Backend",
  "DevOps & Cloud",
  "Databases",
  "AI & ML",
  "Data Analytics",
];

export default function PathTrail() {
  const width = 360;
  const stopCount = TRACKS.length;
  const marginY = 48;
  const usableHeight = 560 - marginY * 2;
  const stepY = usableHeight / (stopCount - 1);

  const points = TRACKS.map((label, i) => {
    const y = marginY + stepY * i;
    const x = i % 2 === 0 ? 96 : 220;
    return { label, x, y };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `Q ${points[i - 1].x} ${(points[i - 1].y + p.y) / 2}, ${p.x} ${p.y}`))
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} 560`}
      className="h-full w-full"
      role="img"
      aria-label="Illustration of a learning path connecting six course tracks"
    >
      <path
        d={pathD}
        fill="none"
        stroke="var(--line)"
        strokeWidth="2"
        strokeDasharray="1 10"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <g key={p.label}>
          <circle
            cx={p.x}
            cy={p.y}
            r={i === 0 ? 7 : 5}
            fill={i === 0 ? "var(--waypoint)" : "var(--ink-raised)"}
            stroke="var(--waypoint)"
            strokeWidth={i === 0 ? 0 : 1.5}
          />
          <text
            x={p.x + (p.x < 160 ? 20 : -20)}
            y={p.y + 4}
            textAnchor={p.x < 160 ? "start" : "end"}
            fill="var(--text-muted)"
            fontSize="13"
            fontFamily="var(--font-body)"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
