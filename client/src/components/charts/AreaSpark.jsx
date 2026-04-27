import { cn } from "../../lib/cn";

function normalize(values) {
  const v = values.filter((n) => typeof n === "number" && Number.isFinite(n));
  if (v.length === 0) return { points: [], min: 0, max: 0 };
  const min = Math.min(...v);
  const max = Math.max(...v);
  return { points: v, min, max };
}

function toPath(values, w, h, pad = 6) {
  const { points, min, max } = normalize(values);
  if (points.length < 2) return "";
  const dx = (w - pad * 2) / (points.length - 1);
  const range = Math.max(1e-6, max - min);

  const coords = points.map((p, i) => {
    const x = pad + dx * i;
    const t = (p - min) / range;
    const y = pad + (1 - t) * (h - pad * 2);
    return [x, y];
  });

  return `M ${coords.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(" L ")}`;
}

export default function AreaSpark({
  values = [],
  className,
  width = 320,
  height = 90,
  accent = "brand",
}) {
  const stroke = accent === "accent" ? "rgba(167,139,250,0.95)" : "rgba(34,211,238,0.95)";
  const fill =
    accent === "accent" ? "rgba(167,139,250,0.16)" : "rgba(34,211,238,0.16)";

  const d = toPath(values, width, height);
  const areaD = d ? `${d} L ${width - 6} ${height - 6} L 6 ${height - 6} Z` : "";

  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="block">
        <defs>
          <linearGradient id={`grad-${accent}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={fill} />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <path
          d={areaD}
          fill={`url(#grad-${accent})`}
          opacity={d ? 1 : 0}
        />
        <path
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth="2.25"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={d ? 1 : 0}
        />
        {!d ? (
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="rgba(255,255,255,0.35)"
            fontSize="12"
          >
            No trend data yet
          </text>
        ) : null}
      </svg>
    </div>
  );
}

