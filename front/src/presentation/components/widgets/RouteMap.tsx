import Icon from "@/presentation/components/ui/Icon";

interface Route {
  city: string;
  code: string;
  pax: number;
  x: number;
  y: number;
}

const ROUTES: Route[] = [
  { city: "Paris", code: "CDG", pax: 14250, x: 550, y: 90 },
  { city: "Lyon", code: "LYS", pax: 9840, x: 490, y: 110 },
  { city: "Marseille", code: "MRS", pax: 8100, x: 470, y: 130 },
  { city: "Nice", code: "NCE", pax: 6450, x: 510, y: 150 },
  { city: "Brussels", code: "BRU", pax: 5200, x: 560, y: 60 },
  { city: "Nantes", code: "NTE", pax: 4300, x: 420, y: 100 },
];

const MIR = { x: 500, y: 320 };

function arcPath(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.25 - 60;
  return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
}

/**
 * Stylized route map widget (MIR -> Europe), pure SVG.
 */
export default function RouteMap() {
  return (
    <div className="relative flex-1 overflow-hidden bg-surface-container-low">
      <svg viewBox="0 0 1000 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        {/* soft grid */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e0e3e5" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="1000" height="400" fill="#f2f4f6" />
        <rect width="1000" height="400" fill="url(#grid)" />

        {/* stylized landmass blobs */}
        <ellipse cx="520" cy="200" rx="360" ry="120" fill="#e6e8ea" />
        <ellipse cx="820" cy="260" rx="220" ry="90" fill="#e6e8ea" />
        <ellipse cx="300" cy="320" rx="200" ry="90" fill="#eceef0" />

        {/* flight arcs */}
        {ROUTES.map((r) => (
          <g key={r.code}>
            <path
              d={arcPath(MIR.x, MIR.y, r.x, r.y)}
              fill="none"
              stroke="#40c2fd"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.9"
            />
          </g>
        ))}

        {/* origin node */}
        <circle cx={MIR.x} cy={MIR.y} r="7" fill="#00668a" stroke="#ffffff" strokeWidth="2" />
        <text x={MIR.x} y={MIR.y + 22} textAnchor="middle" fill="#00668a" fontSize="11" fontWeight="700">
          Monastir (MIR)
        </text>

        {/* destination nodes */}
        {ROUTES.map((r) => (
          <g key={r.code}>
            <circle cx={r.x} cy={r.y} r="5" fill="#131b2e" />
            <text x={r.x} y={r.y - 10} textAnchor="middle" fill="#191c1e" fontSize="11" fontWeight="600">
              {r.city} ({r.code})
            </text>
          </g>
        ))}
      </svg>

      {/* zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button className="flex h-8 w-8 items-center justify-center rounded bg-surface-container-lowest text-on-surface shadow-sm transition-colors hover:bg-surface-variant">
          <Icon name="add" className="text-[18px]" />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded bg-surface-container-lowest text-on-surface shadow-sm transition-colors hover:bg-surface-variant">
          <Icon name="remove" className="text-[18px]" />
        </button>
      </div>

      <span className="absolute left-4 top-4 rounded bg-surface-container px-2 py-1 font-label-caps text-label-caps text-on-surface-variant">
        Temps Réel
      </span>
    </div>
  );
}
